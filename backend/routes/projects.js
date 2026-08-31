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
  updateProjectMemberRole,
} from '../controllers/projectController.js';
import {
  getProjectTasks,
  createTask,
} from '../controllers/taskController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireProjectRole } from '../middleware/requireProjectRole.js';

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
// @access  Private (viewer or higher)
router.get('/:projectId', requireProjectRole('viewer'), getProject);

// @route   PATCH /api/projects/:projectId
// @desc    Update a project
// @access  Private (admin or higher)
router.patch('/:projectId', requireProjectRole('admin'), updateProject);

// @route   DELETE /api/projects/:projectId
// @desc    Delete a project
// @access  Private (owner only)
router.delete('/:projectId', requireProjectRole('owner'), deleteProject);

// @route   GET /api/projects/:projectId/members
// @desc    Get project members
// @access  Private (viewer or higher)
router.get('/:projectId/members', requireProjectRole('viewer'), getProjectMembers);

// @route   POST /api/projects/:projectId/members
// @desc    Add a project member
// @access  Private (admin or higher)
router.post('/:projectId/members', requireProjectRole('admin'), addProjectMember);

// @route   PATCH /api/projects/:projectId/members/:userId
// @desc    Update a project member's role
// @access  Private (admin or higher)
router.patch('/:projectId/members/:userId', requireProjectRole('admin'), updateProjectMemberRole);

// @route   DELETE /api/projects/:projectId/members/:userId
// @desc    Remove a project member
// @access  Private (admin or higher)
router.delete('/:projectId/members/:userId', requireProjectRole('admin'), removeProjectMember);

// ==========================================
// Nested Task Routes
// ==========================================

// @route   GET /api/projects/:projectId/tasks
// @desc    Get all tasks for a specific project
// @access  Private (viewer or higher)
router.get('/:projectId/tasks', requireProjectRole('viewer'), getProjectTasks);

// @route   POST /api/projects/:projectId/tasks
// @desc    Create a new task in a project
// @access  Private (member or higher)
router.post('/:projectId/tasks', requireProjectRole('member'), createTask);

export default router;
