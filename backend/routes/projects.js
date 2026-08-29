import { Router } from 'express';
import {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
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

export default router;
