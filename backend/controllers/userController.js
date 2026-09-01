import User from '../models/User.js';

/**
 * @desc    Update current user profile
 * @route   PATCH /api/users/me
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, skills, avatarUrl } = req.body;
    const userId = req.user.id;

    // Build update object based on allowed fields
    const updateFields = {};
    
    if (name !== undefined) {
      if (!name || typeof name !== 'string' || name.trim() === '') {
        const err = new Error('Name cannot be empty');
        err.statusCode = 400;
        return next(err);
      }
      updateFields.name = name.trim();
    }
    
    if (bio !== undefined) {
      updateFields.bio = bio;
    }
    
    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        const err = new Error('Skills must be an array of strings');
        err.statusCode = 400;
        return next(err);
      }
      updateFields.skills = skills;
    }

    if (avatarUrl !== undefined) {
      updateFields.avatarUrl = avatarUrl;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({
      success: true,
      data: updatedUser.toSafeObject(),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      error.statusCode = 400;
    }
    next(error);
  }
};
