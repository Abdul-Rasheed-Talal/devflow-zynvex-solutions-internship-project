import mongoose from 'mongoose';
import Project from '../models/Project.js';

/**
 * Check whether a user can access a project (owner or member).
 */
function canAccessProject(project, userId) {
  const uid = userId.toString();
  if (project.owner.toString() === uid) return true;
  return project.members.some((m) => m.toString() === uid);
}

/**
 * Check whether a user is the project owner.
 */
function isProjectOwner(project, userId) {
  return project.owner.toString() === userId.toString();
}

/**
 * Validate that a string is a valid MongoDB ObjectId.
 */
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Fields the client is allowed to set on create
const ALLOWED_CREATE_FIELDS = ['name', 'description', 'status', 'priority', 'startDate', 'dueDate'];

// Fields the owner is allowed to update
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
      $or: [{ owner: userId }, { members: userId }],
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

    const project = new Project(fields);

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
 * @access  Private (owner or member)
 */
export const getProject = async (req, res, next) => {
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

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a project
 * @route   PATCH /api/projects/:projectId
 * @access  Private (owner only)
 */
export const updateProject = async (req, res, next) => {
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

    if (!isProjectOwner(project, req.user.id)) {
      const err = new Error('Only the project owner can update this project');
      err.statusCode = 403;
      return next(err);
    }

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

    if (!isProjectOwner(project, req.user.id)) {
      const err = new Error('Only the project owner can delete this project');
      err.statusCode = 403;
      return next(err);
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
