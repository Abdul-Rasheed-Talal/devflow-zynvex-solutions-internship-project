import User from '../models/User.js';
import Project from '../models/Project.js';
import mongoose from 'mongoose';

/**
 * @desc    Update current user profile
 * @route   PATCH /api/users/me
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, skills, avatarUrl } = req.body;
    const userId = req.user.id;

    // Build update object based on allowed fields
    const updateFields = {};
    
    if (name !== undefined) {
      if (!name || typeof name !== 'string' || name.trim() === '') {
        const err = new Error('Name cannot be empty');
        err.statusCode = 400;
        return next(err);
      }
      updateFields.name = name.trim();
    }
    
    if (bio !== undefined) {
      updateFields.bio = bio;
    }
    
    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        const err = new Error('Skills must be an array of strings');
        err.statusCode = 400;
        return next(err);
      }
      updateFields.skills = skills;
    }

    if (avatarUrl !== undefined) {
      updateFields.avatarUrl = avatarUrl;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({
      success: true,
      data: updatedUser.toSafeObject(),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      error.statusCode = 400;
    }
    next(error);
  }
};

/**
 * @desc    Get team members (users in shared projects)
 * @route   GET /api/users/team
 * @access  Private
 */
export const getTeamMembers = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find all projects the user is part of (owner or member)
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    }).populate('members.user', 'name email avatarUrl bio skills accountType companyName subscriptionPlan');

    if (projects.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const teamDirectory = projects.map((project) => {
      // Determine the current user's role in this project
      let myRole = 'viewer';
      if (project.owner.toString() === userId.toString()) {
        myRole = 'owner';
      } else {
        const myMemberObj = project.members.find(m => m.user && m.user._id.toString() === userId.toString());
        if (myMemberObj) myRole = myMemberObj.role;
      }

      const hasPrivilegedAccess = myRole === 'owner' || myRole === 'admin';

      // Map members, applying RBAC to sensitive fields
      const mappedMembers = project.members.map((member) => {
        const u = member.user;
        if (!u) return null;
        
        // Base public profile
        const safeProfile = {
          id: u._id,
          name: u.name,
          avatarUrl: u.avatarUrl,
          bio: u.bio,
          skills: u.skills,
          accountType: u.accountType,
          companyName: u.companyName,
          projectRole: member.role,
          addedAt: member.addedAt
        };

        // Add private fields if privileged or if it's the user themselves
        if (hasPrivilegedAccess || u._id.toString() === userId.toString()) {
          safeProfile.email = u.email;
          safeProfile.subscriptionPlan = u.subscriptionPlan;
        }

        return safeProfile;
      }).filter(Boolean);

      // Add owner if not already in members array
      const ownerInMembers = mappedMembers.some(m => m.id.toString() === project.owner.toString());
      if (!ownerInMembers) {
        // We'd need to fetch owner details, but usually they are populated or we can just fetch if missing.
        // For simplicity, DevFlow always adds owner to members array on create.
      }

      return {
        projectId: project._id,
        projectName: project.name,
        myRole,
        members: mappedMembers
      };
    });

    res.status(200).json({
      success: true,
      data: teamDirectory,
    });
  } catch (error) {
    next(error);
  }
};
