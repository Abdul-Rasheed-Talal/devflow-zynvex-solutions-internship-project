import Announcement from '../models/Announcement.js';

/**
 * @desc    Get active announcements for the workspace
 * @route   GET /api/announcements
 * @access  Private
 */
export const getAnnouncements = async (req, res, next) => {
  try {
    // Return all active announcements, sorted by newest
    // In a multi-tenant system, this would filter by company ID.
    // For now, any active announcement made by a company is shown.
    const announcements = await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 })
      .populate('author', 'name email avatarUrl accountType');

    res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new announcement
 * @route   POST /api/announcements
 * @access  Private (Company Accounts Only)
 */
export const createAnnouncement = async (req, res, next) => {
  try {
    if (req.user.accountType !== 'company') {
      const err = new Error('Only company accounts can create announcements');
      err.statusCode = 403;
      return next(err);
    }

    const { message } = req.body;

    if (!message || message.trim() === '') {
      const err = new Error('Message is required');
      err.statusCode = 400;
      return next(err);
    }

    const announcement = await Announcement.create({
      author: req.user.id,
      message,
      isActive: true,
    });

    const populatedAnnouncement = await announcement.populate('author', 'name email avatarUrl accountType');

    res.status(201).json({
      success: true,
      data: populatedAnnouncement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete (deactivate) an announcement
 * @route   DELETE /api/announcements/:id
 * @access  Private (Company Accounts Only)
 */
export const deleteAnnouncement = async (req, res, next) => {
  try {
    if (req.user.accountType !== 'company') {
      const err = new Error('Only company accounts can manage announcements');
      err.statusCode = 403;
      return next(err);
    }

    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      const err = new Error('Announcement not found');
      err.statusCode = 404;
      return next(err);
    }

    if (announcement.author.toString() !== req.user.id) {
      const err = new Error('You can only delete your own announcements');
      err.statusCode = 403;
      return next(err);
    }

    announcement.isActive = false;
    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
