import Activity from '../models/Activity.js';

/**
 * @desc    Get project activity
 * @route   GET /api/projects/:projectId/activity
 * @access  Private (viewer or higher)
 */
export const getProjectActivity = async (req, res, next) => {
  try {
    const projectId = req.project._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const activities = await Activity.find({ project: projectId })
      .populate('actor', 'name email createdAt updatedAt')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};
