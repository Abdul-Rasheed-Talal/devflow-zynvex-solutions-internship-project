import mongoose from 'mongoose';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { emitProjectEvent } from '../socket/events.js';
import { createTaskAssignmentNotification, createTaskUpdateNotification } from '../utils/notificationService.js';

/**
 * Validate that a string is a valid MongoDB ObjectId.
 */
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Fields the client is allowed to set on create/update
const ALLOWED_TASK_FIELDS = ['title', 'description', 'status', 'priority', 'assignee', 'labels', 'dueDate'];

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
 * Helper to check if a user is part of the project and eligible for task assignment
 */
function isAssignableParticipant(project, userIdStr) {
  if (project.owner.toString() === userIdStr) return true;
  return project.members.some((m) => {
    const memberId = m.user ? m.user.toString() : m.toString();
    // If members are objects with roles, ensure role is not 'viewer'
    if (m.role && m.role === 'viewer') return false;
    return memberId === userIdStr;
  });
}

/**
 * @desc    Get all tasks for a specific project
 * @route   GET /api/projects/:projectId/tasks
 * @access  Private (viewer or higher)
 */
export const getProjectTasks = async (req, res, next) => {
  try {
    const projectId = req.project._id;

    const tasks = await Task.find({ project: projectId })
      .populate('creator', 'name email createdAt updatedAt')
      .populate('assignee', 'name email createdAt updatedAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new task in a project
 * @route   POST /api/projects/:projectId/tasks
 * @access  Private (member or higher)
 */
export const createTask = async (req, res, next) => {
  try {
    const project = req.project;
    const taskData = pickFields(req.body, ALLOWED_TASK_FIELDS);

    // Validate assignee if supplied
    if (taskData.assignee) {
      if (!isValidObjectId(taskData.assignee)) {
        const err = new Error('Invalid assignee ID');
        err.statusCode = 400;
        return next(err);
      }
      
      const assigneeUser = await User.findById(taskData.assignee);
      if (!assigneeUser) {
        const err = new Error('Assignee user not found');
        err.statusCode = 404;
        return next(err);
      }

      if (!isAssignableParticipant(project, taskData.assignee.toString())) {
        const err = new Error('Assignee must be a project member or admin (viewers cannot be assigned tasks)');
        err.statusCode = 403;
        return next(err);
      }
    }

    // Enforce server-controlled relationships
    taskData.project = project._id;
    taskData.creator = req.user.id;

    const newTask = await Task.create(taskData);

    const populatedTask = await Task.findById(newTask._id)
      .populate('creator', 'name email createdAt updatedAt')
      .populate('assignee', 'name email createdAt updatedAt');

    if (populatedTask.assignee) {
      await createTaskAssignmentNotification(project, populatedTask, req.user.id);
    }

    emitProjectEvent(project._id, 'task.created', { projectId: project._id, taskId: populatedTask._id });

    res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      error.statusCode = 400;
    }
    next(error);
  }
};

/**
 * @desc    Get a single task by ID
 * @route   GET /api/tasks/:taskId
 * @access  Private (viewer or higher)
 */
export const getTask = async (req, res, next) => {
  try {
    // req.task is fetched by requireProjectRole middleware, but not populated
    const task = await Task.findById(req.task._id)
      .populate('creator', 'name email createdAt updatedAt')
      .populate('assignee', 'name email createdAt updatedAt');

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a task
 * @route   PATCH /api/tasks/:taskId
 * @access  Private (member or higher)
 */
export const updateTask = async (req, res, next) => {
  try {
    const task = req.task;
    const project = req.project;
    const updates = pickFields(req.body, ALLOWED_TASK_FIELDS);
    const oldAssigneeId = task.assignee ? task.assignee.toString() : null;

    if (Object.keys(updates).length === 0) {
      const err = new Error('No valid fields to update');
      err.statusCode = 400;
      return next(err);
    }

    // Role-based access control for individual tasks
    const isOwner = project.owner.toString() === req.user.id;
    let isAdmin = false;
    if (!isOwner) {
      const member = project.members.find(m => {
        const uid = m.user ? m.user.toString() : m.toString();
        return uid === req.user.id;
      });
      if (member && member.role === 'admin') isAdmin = true;
    }

    if (!isOwner && !isAdmin) {
      // Must be a member. Members can only update if they are the assignee or creator.
      const isAssignee = task.assignee && task.assignee.toString() === req.user.id;
      const isCreator = task.creator && task.creator.toString() === req.user.id;
      if (!isAssignee && !isCreator) {
        const err = new Error('Members can only update tasks they are assigned to or created');
        err.statusCode = 403;
        return next(err);
      }
    }

    // Validate assignee if supplied
    if (updates.assignee !== undefined) {
      if (updates.assignee === null || updates.assignee === '') {
        // Allow unassigning
        updates.assignee = null;
      } else {
        if (!isValidObjectId(updates.assignee)) {
          const err = new Error('Invalid assignee ID');
          err.statusCode = 400;
          return next(err);
        }
        
        const assigneeUser = await User.findById(updates.assignee);
        if (!assigneeUser) {
          const err = new Error('Assignee user not found');
          err.statusCode = 404;
          return next(err);
        }

        if (!isAssignableParticipant(project, updates.assignee.toString())) {
          const err = new Error('Assignee must be a project member or admin (viewers cannot be assigned tasks)');
          err.statusCode = 403;
          return next(err);
        }
      }
    }

    const oldStatus = task.status;
    
    Object.assign(task, updates);
    await task.save();

    if (updates.status && updates.status !== oldStatus) {
      await Activity.create({
        project: project._id,
        task: task._id,
        actor: req.user.id,
        action: 'task_status_changed',
        metadata: { oldStatus, newStatus: updates.status },
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('creator', 'name email createdAt updatedAt')
      .populate('assignee', 'name email createdAt updatedAt');

    // Handle notifications
    const newAssigneeId = populatedTask.assignee ? populatedTask.assignee._id.toString() : null;
    if (newAssigneeId && newAssigneeId !== oldAssigneeId) {
      // Re-assigned or newly assigned
      await createTaskAssignmentNotification(project, populatedTask, req.user.id);
    } else if (newAssigneeId && newAssigneeId === oldAssigneeId) {
      // Updated but assignee remained the same
      await createTaskUpdateNotification(project, populatedTask, req.user.id);
    }

    // Emit different events based on what changed (for fine-grained invalidation if needed, or just task.updated)
    const isStatusOnly = Object.keys(updates).length === 1 && updates.status;
    emitProjectEvent(project._id, isStatusOnly ? 'task.status_changed' : 'task.updated', { projectId: project._id, taskId: populatedTask._id });

    res.status(200).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      error.statusCode = 400;
    }
    next(error);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:taskId
 * @access  Private (member or higher)
 */
export const deleteTask = async (req, res, next) => {
  try {
    const project = req.project;
    const projectId = req.task.project;
    const taskId = req.task._id;
    
    // Role-based access control for deletion
    const isOwner = project.owner.toString() === req.user.id;
    let isAdmin = false;
    if (!isOwner) {
      const member = project.members.find(m => {
        const uid = m.user ? m.user.toString() : m.toString();
        return uid === req.user.id;
      });
      if (member && member.role === 'admin') isAdmin = true;
    }

    if (!isOwner && !isAdmin) {
      // Members can only delete tasks they created
      const isCreator = req.task.creator && req.task.creator.toString() === req.user.id;
      if (!isCreator) {
        const err = new Error('Members can only delete tasks they created');
        err.statusCode = 403;
        return next(err);
      }
    }

    await req.task.deleteOne();

    emitProjectEvent(projectId, 'task.deleted', { projectId, taskId });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
