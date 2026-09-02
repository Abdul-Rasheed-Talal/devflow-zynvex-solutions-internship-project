import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getTeams, createTeam, addTeamMember, deleteTeam } from '../controllers/teamController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getTeams);
router.post('/', createTeam);
router.delete('/:id', deleteTeam);
router.post('/:id/members', addTeamMember);

export default router;
