import { Router } from 'express';
import healthRoutes from './health.js';
import authRoutes from './auth.js';

const router = Router();

router.use('/health', healthRoutes);

// Future route groups will be mounted here:
router.use('/auth', authRoutes);
// router.use('/users', userRoutes);

export default router;
