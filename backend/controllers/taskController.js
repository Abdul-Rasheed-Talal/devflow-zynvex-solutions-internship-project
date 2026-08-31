import mongoose from 'mongoose';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { emitProjectEvent } from '../socket/events.js';

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
 * Helper to check if a user is part of the project (owner or member)
 */
function isProjectParticipant(project, userIdStr) {
  if (project.owner.toString() === userIdStr) return true;
  return project.members.some((m) => {
    const memberId = m.user ? m.user.toString() : m.toString();
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

      if (!isProjectParticipant(project, taskData.assignee.toString())) {
        const err = new Error('Assignee must be a project member or owner');
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

    if (Object.keys(updates).length === 0) {
      const err = new Error('No valid fields to update');
      err.statusCode = 400;
      return next(err);
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

        if (!isProjectParticipant(project, updates.assignee.toString())) {
          const err = new Error('Assignee must be a project member or owner');
          err.statusCode = 403;
          return next(err);
        }
      }
    }

    Object.assign(task, updates);
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('creator', 'name email createdAt updatedAt')
      .populate('assignee', 'name email createdAt updatedAt');

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
    const projectId = req.task.project;
    const taskId = req.task._id;
    
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
