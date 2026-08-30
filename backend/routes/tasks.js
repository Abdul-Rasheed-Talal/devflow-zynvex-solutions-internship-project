import { Router } from 'express';
import {
  getTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All task routes require authentication
router.use(requireAuth);

// @route   GET /api/tasks/:taskId
// @desc    Get a single task by ID
// @access  Private (project owner or member)
router.get('/:taskId', getTask);

// @route   PATCH /api/tasks/:taskId
// @desc    Update a task
// @access  Private (project owner or member)
router.patch('/:taskId', updateTask);

// @route   DELETE /api/tasks/:taskId
// @desc    Delete a task
// @access  Private (project owner or member)
router.delete('/:taskId', deleteTask);

export default router;
