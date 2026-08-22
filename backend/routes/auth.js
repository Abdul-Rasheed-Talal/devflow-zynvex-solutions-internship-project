import { Router } from 'express';
import { registerUser } from '../controllers/authController.js';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

export default router;
