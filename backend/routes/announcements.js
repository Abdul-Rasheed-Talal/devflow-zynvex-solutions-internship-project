import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getAnnouncements);
router.post('/', createAnnouncement);
router.delete('/:id', deleteAnnouncement);

export default router;
