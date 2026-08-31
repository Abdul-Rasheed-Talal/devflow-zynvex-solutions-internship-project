import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';

const ROLE_HIERARCHY = {
  viewer: 1,
  member: 2,
  admin: 3,
  owner: 4,
};

/**
 * Middleware to enforce project-level Role-Based Access Control (RBAC).
 * Resolves the user's role and ensures they meet the minimum required role.
 *
 * @param {string} requiredRole - The minimum role required (viewer, member, admin, owner)
 */
export const requireProjectRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      let projectId = req.params.projectId;
      let task = null;
      let comment = null;

      // 1. Resolve projectId (from URL params directly, or by looking up a Task/Comment)
      if (!projectId && req.params.commentId) {
        if (!mongoose.Types.ObjectId.isValid(req.params.commentId)) {
          return res.status(400).json({ success: false, message: 'Invalid comment ID' });
        }
        comment = await Comment.findById(req.params.commentId);
        if (!comment) {
          return res.status(404).json({ success: false, message: 'Comment not found' });
        }
        projectId = comment.project;
      }

      if (!projectId && req.params.taskId) {
        if (!mongoose.Types.ObjectId.isValid(req.params.taskId)) {
          return res.status(400).json({ success: false, message: 'Invalid task ID' });
        }
        task = await Task.findById(req.params.taskId);
        if (!task) {
          return res.status(404).json({ success: false, message: 'Task not found' });
        }
        projectId = task.project;
      }

      if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ success: false, message: 'Invalid project ID' });
      }

      // 2. Fetch Project
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      // 3. Resolve Role
      const userId = req.user.id.toString();
      let resolvedRole = null;

      if (project.owner.toString() === userId) {
        resolvedRole = 'owner';
      } else {
        const memberRecord = project.members.find((m) => {
          const mId = m.user ? m.user.toString() : m.toString();
          return mId === userId;
        });

        if (memberRecord) {
          resolvedRole = memberRecord.role || 'member';
        }
      }

      // 4. Reject if user is not in the project at all
      if (!resolvedRole) {
        return res.status(403).json({ 
          success: false, 
          message: 'You do not have access to this project' 
        });
      }

      // 5. Compare resolved role with required role hierarchy
      const requiredLevel = ROLE_HIERARCHY[requiredRole];
      const userLevel = ROLE_HIERARCHY[resolvedRole];

      if (!requiredLevel) {
        return res.status(500).json({ success: false, message: 'Invalid required role specified in middleware' });
      }

      if (userLevel < requiredLevel) {
        return res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to perform this action' 
        });
      }

      // 6. Expose context to downstream controllers to prevent redundant queries
      req.project = project;
      req.projectRole = resolvedRole;
      if (task) {
        req.task = task;
      }
      if (comment) {
        req.comment = comment;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
