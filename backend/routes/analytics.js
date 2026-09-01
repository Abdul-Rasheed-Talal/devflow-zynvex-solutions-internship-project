import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireProjectRole } from '../middleware/requireProjectRole.js';
import { getGlobalAnalytics, getProjectAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/global', getGlobalAnalytics);
router.get('/projects/:projectId', requireProjectRole('viewer'), getProjectAnalytics);

export default router;
