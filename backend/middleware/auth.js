import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';

/**
 * Middleware to protect routes.
 * Ensures the user has a valid JWT in the HttpOnly cookie.
 */
export const requireAuth = async (req, res, next) => {
  try {
    let token;

    // Check if the token exists in cookies or Authorization header (fallback for cross-origin restrictions)
    if (req.cookies && req.cookies.devflow_access_token) {
      token = req.cookies.devflow_access_token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      return next(error);
    }

    // Verify token
    const decoded = jwt.verify(token, env.jwtSecret);
    
    // Fetch user details to ensure up-to-date accountType and subscriptionPlan
    const user = await User.findById(decoded.id).select('name email accountType subscriptionPlan companyName');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 401;
      return next(error);
    }

    // Permanent enterprise privilege guard for master developer
    if (user.email?.toLowerCase() === 'mabdulrasheedtalal@gmail.com') {
      if (user.accountType !== 'company' || user.subscriptionPlan !== 'pro') {
        user.accountType = 'company';
        user.subscriptionPlan = 'pro';
        if (!user.companyName) user.companyName = 'DevFlow Enterprise';
        await user.save();
      }
    }

    // Attach complete identity info
    req.user = {
      id: user._id.toString(),
      _id: user._id,
      name: user.name,
      email: user.email,
      accountType: user.accountType,
      subscriptionPlan: user.subscriptionPlan,
      companyName: user.companyName,
    };
    
    next();
  } catch (err) {
    const error = new Error('Invalid or expired token');
    error.statusCode = 401;
    return next(error);
  }
};
