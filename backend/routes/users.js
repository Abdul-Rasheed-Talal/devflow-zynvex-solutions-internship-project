import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { updateProfile, getTeamMembers } from '../controllers/userController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/team', getTeamMembers);
router.patch('/me', updateProfile);

export default router;
