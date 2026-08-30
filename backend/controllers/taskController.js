import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

/**
 * Check whether a user can access a project (owner or member).
 */
function canAccessProject(project, userId) {
  const uid = userId.toString();
  if (project.owner.toString() === uid) return true;
  return project.members.some((m) => m.toString() === uid);
}

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
 * @desc    Get all tasks for a specific project
 * @route   GET /api/projects/:projectId/tasks
 * @access  Private (project owner or member)
 */
export const getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!isValidObjectId(projectId)) {
      const err = new Error('Invalid project ID');
      err.statusCode = 400;
      return next(err);
    }

    const project = await Project.findById(projectId);
    if (!project) {
      const err = new Error('Project not found');
      err.statusCode = 404;
      return next(err);
    }

    if (!canAccessProject(project, req.user.id)) {
      const err = new Error('You do not have access to this project');
      err.statusCode = 403;
      return next(err);
    }

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
 * @access  Private (project owner or member)
 */
export const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!isValidObjectId(projectId)) {
      const err = new Error('Invalid project ID');
      err.statusCode = 400;
      return next(err);
    }

    const project = await Project.findById(projectId);
    if (!project) {
      const err = new Error('Project not found');
      err.statusCode = 404;
      return next(err);
    }

    if (!canAccessProject(project, req.user.id)) {
      const err = new Error('You do not have access to this project');
      err.statusCode = 403;
      return next(err);
    }

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

      if (!canAccessProject(project, taskData.assignee)) {
        const err = new Error('Assignee must be a project member or owner');
        err.statusCode = 403;
        return next(err);
      }
    }

    // Enforce server-controlled relationships
    taskData.project = projectId;
    taskData.creator = req.user.id;

    const newTask = await Task.create(taskData);

    const populatedTask = await Task.findById(newTask._id)
      .populate('creator', 'name email createdAt updatedAt')
      .populate('assignee', 'name email createdAt updatedAt');

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
 * @access  Private (project owner or member)
 */
export const getTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    if (!isValidObjectId(taskId)) {
      const err = new Error('Invalid task ID');
      err.statusCode = 400;
      return next(err);
    }

    const task = await Task.findById(taskId)
      .populate('creator', 'name email createdAt updatedAt')
      .populate('assignee', 'name email createdAt updatedAt');

    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      return next(err);
    }

    const project = await Project.findById(task.project);
    if (!project || !canAccessProject(project, req.user.id)) {
      const err = new Error('You do not have access to this task');
      err.statusCode = 403;
      return next(err);
    }

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
 * @access  Private (project owner or member)
 */
export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    if (!isValidObjectId(taskId)) {
      const err = new Error('Invalid task ID');
      err.statusCode = 400;
      return next(err);
    }

    const task = await Task.findById(taskId);
    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      return next(err);
    }

    const project = await Project.findById(task.project);
    if (!project || !canAccessProject(project, req.user.id)) {
      const err = new Error('You do not have access to update this task');
      err.statusCode = 403;
      return next(err);
    }

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

        if (!canAccessProject(project, updates.assignee)) {
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
 * @access  Private (project owner or member)
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    if (!isValidObjectId(taskId)) {
      const err = new Error('Invalid task ID');
      err.statusCode = 400;
      return next(err);
    }

    const task = await Task.findById(taskId);
    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      return next(err);
    }

    const project = await Project.findById(task.project);
    if (!project || !canAccessProject(project, req.user.id)) {
      const err = new Error('You do not have access to delete this task');
      err.statusCode = 403;
      return next(err);
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
