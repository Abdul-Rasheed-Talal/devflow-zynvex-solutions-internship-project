import { Router } from 'express';
import { registerUser, loginUser, getMe, logoutUser, githubCallback } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/auth/me
// @desc    Get current logged in user profile
// @access  Private
router.get('/me', requireAuth, getMe);

// @route   POST /api/auth/logout
// @desc    Logout user (client clears token)
// @access  Private
router.post('/logout', requireAuth, logoutUser);

// @route   POST /api/auth/github/callback
// @desc    Handle GitHub OAuth Callback
// @access  Public
router.post('/github/callback', githubCallback);

export default router;
