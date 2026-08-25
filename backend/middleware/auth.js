import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * Middleware to protect routes.
 * Ensures the user has a valid JWT in the HttpOnly cookie.
 */
export const requireAuth = (req, res, next) => {
  try {
    let token;

    // Check if the token exists in cookies
    if (req.cookies && req.cookies.devflow_access_token) {
      token = req.cookies.devflow_access_token;
    }

    if (!token) {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      return next(error);
    }

    // Verify token
    const decoded = jwt.verify(token, env.jwtSecret);
    
    // Attach only necessary identity info
    req.user = {
      id: decoded.id
    };
    
    next();
  } catch (err) {
    const error = new Error('Invalid or expired token');
    error.statusCode = 401;
    return next(error);
  }
};
