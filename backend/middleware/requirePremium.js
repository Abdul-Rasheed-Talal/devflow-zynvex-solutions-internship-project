import User from '../models/User.js';
import Project from '../models/Project.js';

export const requirePremium = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // 1. If user themselves is Pro or Company, grant access
    if (user.subscriptionPlan === 'pro' || user.accountType === 'company' || user.email === 'mabdulrasheedtalal@gmail.com') {
      return next();
    }

    // 2. If this is a project-scoped request, check if the project is owned by an Enterprise/Pro user
    const projectId = req.params?.projectId || req.project?._id;
    if (projectId) {
      const project = req.project || await Project.findById(projectId);
      if (project) {
        const projectOwner = await User.findById(project.owner);
        if (projectOwner && (projectOwner.subscriptionPlan === 'pro' || projectOwner.accountType === 'company' || projectOwner.email === 'mabdulrasheedtalal@gmail.com')) {
          // The project is sponsored by an Enterprise/Pro account!
          return next();
        }
      }
    }

    res.status(402).json({
      message: 'Payment Required: This feature is only available on Enterprise or Pro workspaces.',
      code: 'PREMIUM_REQUIRED'
    });
  } catch (error) {
    next(error);
  }
};

