import bcrypt from 'bcrypt';
import User from '../models/User.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Basic validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      const err = new Error('Name is required');
      err.statusCode = 400;
      return next(err);
    }
    
    if (!email || typeof email !== 'string' || email.trim() === '') {
      const err = new Error('Email is required');
      err.statusCode = 400;
      return next(err);
    }
    
    if (!password || typeof password !== 'string') {
      const err = new Error('Password is required');
      err.statusCode = 400;
      return next(err);
    }

    if (password.length < 6) {
      const err = new Error('Password must be at least 6 characters');
      err.statusCode = 400;
      return next(err);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const err = new Error('User with this email already exists');
      err.statusCode = 409; // Conflict
      return next(err);
    }

    // 3. Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Create User document
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    // We rely on Mongoose validation here to catch any email regex issues, etc.
    try {
      await user.save();
    } catch (saveError) {
      // Safely handle MongoDB duplicate-key error (11000) for race conditions
      if (saveError.code === 11000) {
        const err = new Error('User with this email already exists');
        err.statusCode = 409;
        return next(err);
      }
      // Pass other Mongoose validation errors to central handler
      if (saveError.name === 'ValidationError') {
        saveError.statusCode = 400;
      }
      return next(saveError);
    }

    // 5. Return safe user information (201 Created)
    res.status(201).json({
      success: true,
      data: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};
