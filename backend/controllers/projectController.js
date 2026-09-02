import mongoose from 'mongoose';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Team from '../models/Team.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { emitProjectEvent, emitUserEvent } from '../socket/events.js';

/**
 * Validate that a string is a valid MongoDB ObjectId.
 */
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Fields the client is allowed to set on create
const ALLOWED_CREATE_FIELDS = ['name', 'description', 'status', 'priority', 'startDate', 'dueDate'];

// Fields the owner/admin is allowed to update
const ALLOWED_UPDATE_FIELDS = ['name', 'description', 'status', 'priority', 'startDate', 'dueDate'];

/**
 * Pick only allowed fields from an object.
 */
function pickFields(source, allowed) {
  const result = {};
  for (const key of allowed) {
    if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * @desc    List projects accessible to the authenticated user
 * @route   GET /api/projects
 * @access  Private
 */
export const getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const projects = await Project.find({
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ],
    }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private
 */
export const createProject = async (req, res, next) => {
  try {
    const fields = pickFields(req.body, ALLOWED_CREATE_FIELDS);

    // Owner is always the authenticated user — never trust the client
    fields.owner = req.user.id;

    // Enforce 3-project limit for basic users
    if (req.user.subscriptionPlan !== 'pro') {
      const projectCount = await Project.countDocuments({ owner: req.user.id });
      if (projectCount >= 3) {
        const err = new Error('Free plan limit reached. Upgrade to Pro to create more than 3 projects.');
        err.statusCode = 403;
        err.code = 'PROJECT_LIMIT_REACHED';
        return next(err);
      }
    }

    const project = new Project(fields);

    // If a global team was selected, pre-populate project members
    if (req.body.teamId && isValidObjectId(req.body.teamId)) {
      const team = await Team.findById(req.body.teamId);
      if (team) {
        const memberIds = team.members.map(m => (m.user?._id || m.user).toString());
        if (team.owner.toString() !== req.user.id) {
          memberIds.push(team.owner.toString());
        }
        const uniqueIds = [...new Set(memberIds)].filter(id => id !== req.user.id);
        const maxMembers = req.user.accountType === 'personal' ? 12 : Infinity;
        for (const uId of uniqueIds.slice(0, maxMembers)) {
          project.members.push({ user: uId, role: 'member' });
        }
      }
    }

    try {
      await project.save();
    } catch (saveError) {
      if (saveError.name === 'ValidationError') {
        saveError.statusCode = 400;
      }
      return next(saveError);
    }

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single project by ID
 * @route   GET /api/projects/:projectId
 * @access  Private (viewer or higher)
 */
export const getProject = async (req, res, next) => {
  try {
    // req.project is populated by requireProjectRole middleware
    res.status(200).json({
      success: true,
      data: req.project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a project
 * @route   PATCH /api/projects/:projectId
 * @access  Private (admin or higher)
 */
export const updateProject = async (req, res, next) => {
  try {
    const project = req.project;

    // Pick only allowed fields — never allow owner, members, _id, timestamps
    const updates = pickFields(req.body, ALLOWED_UPDATE_FIELDS);

    if (Object.keys(updates).length === 0) {
      const err = new Error('No valid fields to update');
      err.statusCode = 400;
      return next(err);
    }

    Object.assign(project, updates);

    try {
      await project.save();
    } catch (saveError) {
      if (saveError.name === 'ValidationError') {
        saveError.statusCode = 400;
      }
      return next(saveError);
    }

    emitProjectEvent(project._id, 'project.updated', { projectId: project._id });

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a project
 * @route   DELETE /api/projects/:projectId
 * @access  Private (owner only)
 */
export const deleteProject = async (req, res, next) => {
  try {
    await req.project.deleteOne();

    await logAuditEvent({
      req,
      projectId: req.project._id,
      action: 'project_deleted',
    });

    emitProjectEvent(req.project._id, 'project.deleted', { projectId: req.project._id });

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get project members
 * @route   GET /api/projects/:projectId/members
 * @access  Private (viewer or higher)
 */
export const getProjectMembers = async (req, res, next) => {
  try {
    const project = await Project.findById(req.project._id);

    // Auto-sync any members from teams owned by the project owner
    try {
      const ownerTeams = await Team.find({ owner: project.owner });
      let hasChanges = false;
      for (const t of ownerTeams) {
        for (const m of t.members) {
          const uId = (m.user?._id || m.user).toString();
          if (uId !== project.owner.toString()) {
            const exists = project.members.some(pm => (pm.user?._id || pm.user || pm).toString() === uId);
            if (!exists) {
              project.members.push({ user: uId, role: 'member' });
              hasChanges = true;
            }
          }
        }
      }
      if (hasChanges) {
        await project.save();
      }
    } catch (syncErr) {
      console.error('[Project] Auto-sync team members error:', syncErr.message);
    }

    // Populate members for response
    const populatedProject = await Project.findById(project._id).populate('members.user');

    const safeMembers = populatedProject.members.map((member) => {
      let safeUser = {};
      if (!member.user) {
        safeUser = member.toSafeObject ? member.toSafeObject() : member;
      } else {
        safeUser = member.user.toSafeObject ? member.user.toSafeObject() : member.user;
      }
      return {
        user: safeUser,
        role: member.role || 'member',
        addedAt: member.addedAt
      };
    });

    res.status(200).json({
      success: true,
      data: safeMembers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a project member
 * @route   POST /api/projects/:projectId/members
 * @access  Private (admin or higher)
 */
export const addProjectMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const project = req.project;

    // Check personal account member limit (12 members max)
    const requestUser = await User.findById(req.user.id);
    if (requestUser?.accountType === 'personal' && project.members.length >= 12) {
      const err = new Error('Personal accounts are limited to 12 members per project. Upgrade to Company for unlimited members.');
      err.statusCode = 403;
      return next(err);
    }

    if (!email || typeof email !== 'string') {
      const err = new Error('Email is required');
      err.statusCode = 400;
      return next(err);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }

    const userId = user._id;

    if (project.owner.toString() === userId.toString()) {
      const err = new Error('Project owner cannot be added as a member');
      err.statusCode = 400;
      return next(err);
    }

    const assignedRole = role || 'member';
    if (!['admin', 'member', 'viewer'].includes(assignedRole)) {
      const err = new Error('Invalid role');
      err.statusCode = 400;
      return next(err);
    }

    const isAlreadyMember = project.members.some((m) => {
      const memberId = m.user ? m.user.toString() : m.toString();
      return memberId === userId.toString();
    });
    
    if (isAlreadyMember) {
      const err = new Error('User is already a member');
      err.statusCode = 409;
      return next(err);
    }

    project.members.push({ user: userId, role: assignedRole });
    await project.save();

    await logAuditEvent({
      req,
      projectId: project._id,
      action: 'member_added',
      targetUser: userId,
    });

    await Activity.create({
      project: project._id,
      actor: req.user.id,
      action: 'member_added',
      metadata: { userId, role: assignedRole },
    });

    emitProjectEvent(project._id, 'membership.updated', { projectId: project._id, userId });

    // Send notification to newly added project member
    try {
      const notif = await Notification.create({
        user: userId,
        actor: req.user.id,
        project: project._id,
        type: 'project_added',
        referenceId: project._id,
      });
      emitUserEvent(userId.toString(), 'notification.created', { notificationId: notif._id });
    } catch (notifErr) {
      console.error('[Project] Failed to create project_added notification:', notifErr.message);
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a project member
 * @route   DELETE /api/projects/:projectId/members/:userId
 * @access  Private (admin or higher)
 */
export const removeProjectMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const project = req.project;

    if (!isValidObjectId(userId)) {
      const err = new Error('Invalid user ID');
      err.statusCode = 400;
      return next(err);
    }

    if (project.owner.toString() === userId.toString()) {
      const err = new Error('Project owner cannot be removed as a member');
      err.statusCode = 400;
      return next(err);
    }

    const isMember = project.members.some((m) => {
      const memberId = m.user ? m.user.toString() : m.toString();
      return memberId === userId.toString();
    });
    
    if (!isMember) {
      const err = new Error('User is not a member of this project');
      err.statusCode = 404;
      return next(err);
    }

    project.members = project.members.filter((m) => {
      const memberId = m.user ? m.user.toString() : m.toString();
      return memberId !== userId.toString();
    });
    
    await project.save();

    await logAuditEvent({
      req,
      projectId: project._id,
      action: 'member_removed',
      targetUser: userId,
    });

    emitProjectEvent(project._id, 'membership.updated', { projectId: project._id, userId });

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a project member's role
 * @route   PATCH /api/projects/:projectId/members/:userId
 * @access  Private (admin or higher)
 */
export const updateProjectMemberRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const project = req.project;

    if (!isValidObjectId(userId)) {
      const err = new Error('Invalid user ID');
      err.statusCode = 400;
      return next(err);
    }

    if (!role || !['admin', 'member', 'viewer'].includes(role)) {
      const err = new Error('Invalid role specified');
      err.statusCode = 400;
      return next(err);
    }

    if (project.owner.toString() === userId.toString()) {
      const err = new Error('Cannot modify the project owner role');
      err.statusCode = 400;
      return next(err);
    }

    const member = project.members.find((m) => {
      const memberId = m.user ? m.user.toString() : m.toString();
      return memberId === userId.toString();
    });
    
    if (!member) {
      const err = new Error('User is not a member of this project');
      err.statusCode = 404;
      return next(err);
    }

    member.role = role;
    await project.save();

    await logAuditEvent({
      req,
      projectId: project._id,
      action: 'role_changed',
      targetUser: userId,
    });

    emitProjectEvent(project._id, 'membership.updated', { projectId: project._id, userId });

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign all members of a Global Team to a Project in bulk
 * @route   POST /api/projects/:projectId/teams/:teamId/assign
 * @access  Private (admin or higher)
 */
export const assignTeamToProject = async (req, res, next) => {
  try {
    const { projectId, teamId } = req.params;
    const project = req.project;

    if (!isValidObjectId(teamId)) {
      const err = new Error('Invalid team ID');
      err.statusCode = 400;
      return next(err);
    }

    const team = await Team.findById(teamId).populate('members.user');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Verify user is owner or member of the team
    const isTeamOwner = team.owner.toString() === req.user.id;
    const isTeamMember = team.members.some(m => (m.user?._id || m.user).toString() === req.user.id);
    if (!isTeamOwner && !isTeamMember) {
      return res.status(403).json({ message: 'You are not a member of this team' });
    }

    const requestUser = await User.findById(req.user.id);

    // Collect all candidate user IDs: team owner + all team members
    const candidateUserIds = [];
    if (team.owner.toString() !== project.owner.toString()) {
      candidateUserIds.push(team.owner.toString());
    }
    for (const m of team.members) {
      const uId = (m.user?._id || m.user).toString();
      if (uId !== project.owner.toString() && !candidateUserIds.includes(uId)) {
        candidateUserIds.push(uId);
      }
    }

    let addedCount = 0;
    const newlyAddedUserIds = [];
    for (const uId of candidateUserIds) {
      const isAlreadyMember = project.members.some(m => {
        const memberId = (m.user?._id || m.user || m).toString();
        return memberId === uId;
      });

      if (!isAlreadyMember) {
        if (requestUser?.accountType === 'personal' && project.members.length >= 12) {
          break; // Stop at personal limit
        }
        project.members.push({ user: uId, role: 'member' });
        newlyAddedUserIds.push(uId);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      await project.save();

      await logAuditEvent({
        req,
        projectId: project._id,
        action: 'team_assigned',
        metadata: { teamId, teamName: team.name, addedCount }
      });

      await Activity.create({
        project: project._id,
        actor: req.user.id,
        action: 'team_assigned',
        metadata: { teamId, teamName: team.name, addedCount }
      });

      emitProjectEvent(project._id, 'membership.updated', { projectId: project._id });

      // Notify newly added users
      for (const newUId of newlyAddedUserIds) {
        try {
          const notif = await Notification.create({
            user: newUId,
            actor: req.user.id,
            project: project._id,
            type: 'project_added',
            referenceId: project._id,
          });
          emitUserEvent(newUId.toString(), 'notification.created', { notificationId: notif._id });
        } catch (notifErr) {
          // Non-blocking
        }
      }
    }

    // Return populated members
    const updatedProject = await Project.findById(project._id).populate('members.user');
    const safeMembers = updatedProject.members.map((member) => {
      let safeUser = {};
      if (!member.user) {
        safeUser = member.toSafeObject ? member.toSafeObject() : member;
      } else {
        safeUser = member.user.toSafeObject ? member.user.toSafeObject() : member.user;
      }
      return {
        user: safeUser,
        role: member.role || 'member',
        addedAt: member.addedAt
      };
    });

    res.status(200).json({
      success: true,
      message: `Assigned team "${team.name}" to project (${addedCount} members added)`,
      data: safeMembers
    });
  } catch (error) {
    next(error);
  }
};
