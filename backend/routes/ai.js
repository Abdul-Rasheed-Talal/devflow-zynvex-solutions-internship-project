import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireProjectRole } from '../middleware/requireProjectRole.js';
import { requirePremium } from '../middleware/requirePremium.js';
import { getProjectHealth } from '../controllers/aiController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/projects/:projectId/ai-health', requireProjectRole('viewer'), requirePremium, getProjectHealth);

export default router;
