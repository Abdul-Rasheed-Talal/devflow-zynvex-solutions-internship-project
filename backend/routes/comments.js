import { Router } from 'express';
import {
  updateComment,
  deleteComment,
} from '../controllers/commentController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireProjectRole } from '../middleware/requireProjectRole.js';

const router = Router();

// All comment routes require authentication
router.use(requireAuth);

// @route   PATCH /api/comments/:commentId
// @desc    Update a comment
// @access  Private (author only)
router.patch('/:commentId', requireProjectRole('viewer'), updateComment);

// @route   DELETE /api/comments/:commentId
// @desc    Delete a comment
// @access  Private (author, admin, or owner)
router.delete('/:commentId', requireProjectRole('viewer'), deleteComment);

export default router;
