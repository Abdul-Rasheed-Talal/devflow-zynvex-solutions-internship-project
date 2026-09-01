import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireProjectRole } from '../middleware/requireProjectRole.js';
import { getGitHubData } from '../controllers/githubController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/projects/:projectId/github', requireProjectRole('viewer'), getGitHubData);

export default router;
