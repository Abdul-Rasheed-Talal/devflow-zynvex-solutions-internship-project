import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireProjectRole } from '../middleware/requireProjectRole.js';
import { requirePremium } from '../middleware/requirePremium.js';
import { getGitHubData, getUserRepositories } from '../controllers/githubController.js';

const router = express.Router();

// Fetch user's own repositories for import
router.get('/repos', requireAuth, requirePremium, getUserRepositories);

// Fetch project-specific data (issues/PRs)
router.get('/projects/:projectId/github', requireAuth, requireProjectRole('viewer'), requirePremium, getGitHubData);

export default router;
