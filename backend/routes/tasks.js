import { Router } from 'express';
import {
  getTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import {
  getComments,
  createComment,
} from '../controllers/commentController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireProjectRole } from '../middleware/requireProjectRole.js';

const router = Router();

// All task routes require authentication
router.use(requireAuth);

// @route   GET /api/tasks/:taskId
// @desc    Get a single task by ID
// @access  Private (viewer or higher)
router.get('/:taskId', requireProjectRole('viewer'), getTask);

// @route   PATCH /api/tasks/:taskId
// @desc    Update a task
// @access  Private (member or higher)
router.patch('/:taskId', requireProjectRole('member'), updateTask);

// @route   DELETE /api/tasks/:taskId
// @desc    Delete a task
// @access  Private (member or higher)
router.delete('/:taskId', requireProjectRole('member'), deleteTask);

// ==========================================
// Nested Comment Routes
// ==========================================

// @route   GET /api/tasks/:taskId/comments
// @desc    Get comments for a specific task
// @access  Private (viewer or higher)
router.get('/:taskId/comments', requireProjectRole('viewer'), getComments);

// @route   POST /api/tasks/:taskId/comments
// @desc    Create a new comment
// @access  Private (member or higher)
router.post('/:taskId/comments', requireProjectRole('member'), createComment);

export default router;
