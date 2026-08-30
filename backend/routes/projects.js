import { Router } from 'express';
import {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
} from '../controllers/projectController.js';
import {
  getProjectTasks,
  createTask,
} from '../controllers/taskController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All project routes require authentication
router.use(requireAuth);

// @route   GET /api/projects
// @desc    List projects accessible to the authenticated user
// @access  Private
router.get('/', getProjects);

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', createProject);

// @route   GET /api/projects/:projectId
// @desc    Get a single project by ID
// @access  Private (owner or member)
router.get('/:projectId', getProject);

// @route   PATCH /api/projects/:projectId
// @desc    Update a project
// @access  Private (owner only)
router.patch('/:projectId', updateProject);

// @route   DELETE /api/projects/:projectId
// @desc    Delete a project
// @access  Private (owner only)
router.delete('/:projectId', deleteProject);

// @route   GET /api/projects/:projectId/members
// @desc    Get project members
// @access  Private (owner only)
router.get('/:projectId/members', getProjectMembers);

// @route   POST /api/projects/:projectId/members
// @desc    Add a project member
// @access  Private (owner only)
router.post('/:projectId/members', addProjectMember);

// @route   DELETE /api/projects/:projectId/members/:userId
// @desc    Remove a project member
// @access  Private (owner only)
router.delete('/:projectId/members/:userId', removeProjectMember);

// ==========================================
// Nested Task Routes
// ==========================================

// @route   GET /api/projects/:projectId/tasks
// @desc    Get all tasks for a specific project
// @access  Private (project owner or member)
router.get('/:projectId/tasks', getProjectTasks);

// @route   POST /api/projects/:projectId/tasks
// @desc    Create a new task in a project
// @access  Private (project owner or member)
router.post('/:projectId/tasks', createTask);

export default router;
