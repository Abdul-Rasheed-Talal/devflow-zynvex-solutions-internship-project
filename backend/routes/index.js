import { Router } from 'express';
import healthRoutes from './health.js';
import authRoutes from './auth.js';
import projectRoutes from './projects.js';
import taskRoutes from './tasks.js';
import commentRoutes from './comments.js';
import notificationRoutes from './notifications.js';
import userRoutes from './users.js';
import analyticsRoutes from './analytics.js';
import announcementRoutes from './announcements.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/comments', commentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/announcements', announcementRoutes);

export default router;
