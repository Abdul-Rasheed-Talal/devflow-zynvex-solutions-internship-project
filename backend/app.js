import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import env from './config/env.js';
import routes from './routes/index.js';
import { handleStripeWebhook } from './controllers/subscriptionController.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// --- CORS Configuration ---
// Supports exact frontend URL, multiple comma-separated URLs, localhost, and Vercel domains
const allowedOrigins = [
  env.frontendUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Direct match with configured origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow all preview and production deployments under vercel.app
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Allow any explicitly supplied FRONTEND_URL in production
    if (env.frontendUrl && (origin === env.frontendUrl || env.frontendUrl.split(',').map(s => s.trim()).includes(origin))) {
      return callback(null, true);
    }

    return callback(null, true); // Permissive fallback for seamless zero-config deployment
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
};

app.use(cors(corsOptions));

// --- Stripe Webhook ---
// Stripe Webhook needs raw body, so we place it before express.json()
app.post(
  '/api/subscriptions/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

// --- Standard Middleware ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// --- Health Check & Status Endpoints ---
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.nodeEnv,
    database: states[dbState] || 'unknown',
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'DevFlow API',
    status: 'operational',
    version: '1.0.0',
    health: '/api/health',
  });
});

// --- API Routes ---
app.use('/api', routes);

// --- Centralized Error Handling ---
app.use(errorHandler);

export default app;
