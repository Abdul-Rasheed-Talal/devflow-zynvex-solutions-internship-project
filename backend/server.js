import express from 'express';
import cors from 'cors';
import env from './config/env.js';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
app.use('/api', routes);

// --- Error handling ---
app.use(errorHandler);

// --- Start server ---
async function start() {
  await connectDB();

  app.listen(env.port, () => {
    console.log(
      `DevFlow API server running on port ${env.port} [${env.nodeEnv}]`
    );
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
