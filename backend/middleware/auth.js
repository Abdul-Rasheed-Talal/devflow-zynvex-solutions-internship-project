import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * Middleware to require valid JWT authentication.
 * Checks for Authorization header, verifies Bearer token,
 * and populates req.user with the decoded identity.
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Authentication required');
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    const error = new Error('Authentication required');
    error.statusCode = 401;
    return next(error);
  }

  try {
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
