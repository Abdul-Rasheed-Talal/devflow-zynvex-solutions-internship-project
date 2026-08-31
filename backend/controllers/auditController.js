import AuditLog from '../models/AuditLog.js';

/**
 * @desc    Get audit logs for a specific project
 * @route   GET /api/projects/:projectId/audit
 * @access  Private (admin or higher)
 */
export const getProjectAuditLogs = async (req, res, next) => {
  try {
    const projectId = req.project._id;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // We only expose safe fields for actor and targetUser
    const safeUserFields = 'name email id';

    const logs = await AuditLog.find({ project: projectId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('actor', safeUserFields)
      .populate('targetUser', safeUserFields)
      .lean(); // Faster query, returns plain JS objects

    const total = await AuditLog.countDocuments({ project: projectId });

    // Exclude ipAddress before sending to the client to prevent sensitive data leaks
    const safeLogs = logs.map(log => {
      const { ipAddress, ...safeLog } = log;
      return safeLog;
    });

    res.status(200).json({
      success: true,
      data: safeLogs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      }
    });
  } catch (error) {
    next(error);
  }
};
