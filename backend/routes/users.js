import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { updateProfile } from '../controllers/userController.js';

const router = express.Router();

router.use(requireAuth);

router.patch('/me', updateProfile);

export default router;
