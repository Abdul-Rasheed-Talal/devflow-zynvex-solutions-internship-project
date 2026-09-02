import Team from '../models/Team.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Notification from '../models/Notification.js';
import { emitUserEvent } from '../socket/events.js';

/**
 * @desc    Get all teams for logged-in user
 * @route   GET /api/teams
 * @access  Private
 */
export const getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    }).populate('owner', 'name email avatarUrl').populate('members.user', 'name email avatarUrl');

    res.status(200).json({ success: true, data: teams });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new global team
 * @route   POST /api/teams
 * @access  Private
 */
export const createTeam = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user.id);

    // Master developer email bypasses all restrictions
    const isMaster = user.email.toLowerCase() === 'mabdulrasheedtalal@gmail.com';

    // Limit personal accounts to 1 team
    if (user.accountType === 'personal' && !isMaster) {
      const teamCount = await Team.countDocuments({ owner: req.user.id });
      if (teamCount >= 1) {
        return res.status(403).json({
          message: 'Upgrade to Pro to create unlimited teams.',
          code: 'TEAM_LIMIT_REACHED'
        });
      }
    }

    const team = await Team.create({
      name,
      owner: req.user.id,
      members: []
    });

    res.status(201).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add member to a global team
 * @route   POST /api/teams/:id/members
 * @access  Private
 */
export const addTeamMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    const teamId = req.params.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Only owner can add members for now
    if (team.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only team owners can add members' });
    }

    const ownerUser = await User.findById(req.user.id);
    
    // Check personal account member limit
    if (ownerUser.accountType === 'personal' && team.members.length >= 12) {
      return res.status(403).json({ 
        message: 'Personal teams are limited to 12 members. Upgrade to Business for unlimited members.',
        code: 'MEMBER_LIMIT_REACHED'
      });
    }

    const userToAdd = await User.findOne({ email: email.toLowerCase() });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    const isAlreadyMember = team.members.some(m => m.user.toString() === userToAdd._id.toString());
    if (isAlreadyMember) {
      return res.status(409).json({ message: 'User is already in this team' });
    }
    
    if (userToAdd._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You are the owner, you cannot add yourself as a member' });
    }

    team.members.push({ user: userToAdd._id });
    await team.save();

    // Auto-sync: Add the new team member to all projects owned by the team owner
    try {
      const ownerProjects = await Project.find({ owner: team.owner });
      for (const project of ownerProjects) {
        const alreadyInProject = project.members.some(m => {
          const memberId = (m.user?._id || m.user || m).toString();
          return memberId === userToAdd._id.toString();
        });
        if (!alreadyInProject) {
          project.members.push({ user: userToAdd._id, role: 'member' });
          await project.save();
        }
      }
    } catch (syncErr) {
      console.error('[Team] Failed to auto-sync member to projects:', syncErr.message);
    }

    // Send notification to the added user
    try {
      const notif = await Notification.create({
        user: userToAdd._id,
        actor: req.user.id,
        team: team._id,
        type: 'team_added',
        referenceId: team._id,
      });
      emitUserEvent(userToAdd._id.toString(), 'notification.created', { notificationId: notif._id });
    } catch (notifErr) {
      // Non-blocking: notification failure should not block team addition
      console.error('[Team] Failed to create team_added notification:', notifErr.message);
    }

    // Re-populate the team before returning
    const populatedTeam = await Team.findById(teamId)
      .populate('owner', 'name email avatarUrl')
      .populate('members.user', 'name email avatarUrl');

    res.status(200).json({ success: true, data: populatedTeam });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a global team
 * @route   DELETE /api/teams/:id
 * @access  Private (Owner or Master Admin Only)
 */
export const deleteTeam = async (req, res, next) => {
  try {
    const teamId = req.params.id;
    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isOwner = team.owner.toString() === req.user.id;
    const isMaster = req.user.email?.toLowerCase() === 'mabdulrasheedtalal@gmail.com';

    if (!isOwner && !isMaster) {
      return res.status(403).json({ message: 'Only the team owner can delete this team' });
    }

    await Team.findByIdAndDelete(teamId);

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
