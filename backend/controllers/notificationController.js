import Notification from '../models/Notification.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import mongoose from 'mongoose';

/**
 * @desc    Get user's notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('actor', 'name email')
      .populate('project', 'name')
      .lean();

    // Manually fetch contextual data for UI
    for (const notif of notifications) {
      if (notif.type === 'mention') {
        const comment = await Comment.findById(notif.referenceId).select('task content').lean();
        notif.comment = comment;
        if (comment && comment.task) {
          const task = await Task.findById(comment.task).select('title').lean();
          notif.task = task;
        }
      } else {
        const task = await Task.findById(notif.referenceId).select('title').lean();
        notif.task = task;
      }
    }

    const total = await Notification.countDocuments({ user: req.user.id });
    const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      meta: {
        unreadCount,
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/notifications/:notificationId/read
 * @access  Private
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Security: Only the recipient can mark as read
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You do not have permission to modify this notification' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all user's notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
