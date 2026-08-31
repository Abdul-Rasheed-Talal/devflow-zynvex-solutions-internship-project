import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { emitProjectEvent } from '../socket/events.js';

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * @desc    Get comments for a specific task
 * @route   GET /api/tasks/:taskId/comments
 * @access  Private (viewer or higher)
 */
export const getComments = async (req, res, next) => {
  try {
    const taskId = req.task._id;
    // Standard pagination can be implemented via query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ task: taskId })
      .populate('author', 'name email createdAt updatedAt')
      .populate('mentionedUsers', 'name email createdAt updatedAt')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new comment
 * @route   POST /api/tasks/:taskId/comments
 * @access  Private (member or higher)
 */
export const createComment = async (req, res, next) => {
  try {
    const { content, mentionedUsers } = req.body;
    
    // Explicitly validate content length/presence here before saving
    if (!content || !content.trim()) {
      const err = new Error('Comment content is required');
      err.statusCode = 400;
      return next(err);
    }
    if (content.length > 2000) {
      const err = new Error('Comment content must not exceed 2000 characters');
      err.statusCode = 400;
      return next(err);
    }

    let parsedMentions = [];
    if (Array.isArray(mentionedUsers)) {
      // Validate all object ids
      const validMentions = mentionedUsers.filter(id => isValidObjectId(id));
      // Remove duplicates
      parsedMentions = [...new Set(validMentions)];
      
      // Verify they are actual users in the project. (Optional strictness, but good for security)
      // For now, just ensure they are valid ObjectIds
    }

    const newComment = await Comment.create({
      project: req.project._id,
      task: req.task._id,
      author: req.user.id,
      content: content.trim(),
      mentionedUsers: parsedMentions,
    });

    // Create Activity
    await Activity.create({
      project: req.project._id,
      task: req.task._id,
      actor: req.user.id,
      action: 'comment_created',
      metadata: {
        commentId: newComment._id,
      },
    });

    const populatedComment = await Comment.findById(newComment._id)
      .populate('author', 'name email createdAt updatedAt')
      .populate('mentionedUsers', 'name email createdAt updatedAt');

    emitProjectEvent(req.task.project, 'comment.created', { projectId: req.task.project, taskId: req.task._id, commentId: populatedComment._id });

    res.status(201).json({
      success: true,
      data: populatedComment,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      error.statusCode = 400;
    }
    next(error);
  }
};

/**
 * @desc    Update a comment
 * @route   PATCH /api/comments/:commentId
 * @access  Private (author only)
 */
export const updateComment = async (req, res, next) => {
  try {
    const comment = req.comment;

    if (comment.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own comments',
      });
    }

    const { content, mentionedUsers } = req.body;

    if (content !== undefined) {
      if (!content || !content.trim()) {
        const err = new Error('Comment content is required');
        err.statusCode = 400;
        return next(err);
      }
      if (content.length > 2000) {
        const err = new Error('Comment content must not exceed 2000 characters');
        err.statusCode = 400;
        return next(err);
      }
      comment.content = content.trim();
    }

    if (Array.isArray(mentionedUsers)) {
      comment.mentionedUsers = [...new Set(mentionedUsers.filter(id => isValidObjectId(id)))];
    }

    comment.isEdited = true;
    await comment.save();

    // Create Activity
    await Activity.create({
      project: req.project._id,
      task: req.task ? req.task._id : comment.task,
      actor: req.user.id,
      action: 'comment_updated',
      metadata: {
        commentId: comment._id,
      },
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name email createdAt updatedAt')
      .populate('mentionedUsers', 'name email createdAt updatedAt');

    emitProjectEvent(req.project._id, 'comment.updated', { projectId: req.project._id, taskId: req.task ? req.task._id : comment.task, commentId: populatedComment._id });

    res.status(200).json({
      success: true,
      data: populatedComment,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      error.statusCode = 400;
    }
    next(error);
  }
};

/**
 * @desc    Delete a comment
 * @route   DELETE /api/comments/:commentId
 * @access  Private (author, or admin/owner)
 */
export const deleteComment = async (req, res, next) => {
  try {
    const comment = req.comment;

    const isAuthor = comment.author.toString() === req.user.id.toString();
    const canDeleteAny = ['admin', 'owner'].includes(req.projectRole);

    if (!isAuthor && !canDeleteAny) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this comment',
      });
    }

    await comment.deleteOne();

    // Create Activity
    await Activity.create({
      project: req.project._id,
      task: req.task ? req.task._id : comment.task,
      actor: req.user.id,
      action: 'comment_deleted',
      metadata: {
        commentId: comment._id,
      },
    });

    emitProjectEvent(req.project._id, 'comment.deleted', { projectId: req.project._id, taskId: req.task ? req.task._id : comment.task, commentId: comment._id });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
