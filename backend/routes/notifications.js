import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead); // Must be before /:notificationId/read
router.patch('/:notificationId/read', markAsRead);

export default router;
