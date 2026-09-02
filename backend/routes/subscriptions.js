import express from 'express';
import { createCheckoutSession, verifySession } from '../controllers/subscriptionController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// The webhook route is mounted directly in server.js because it requires express.raw()

router.post('/checkout', requireAuth, createCheckoutSession);
router.post('/verify-session', requireAuth, verifySession);

export default router;
