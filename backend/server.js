import { createServer } from 'http';
import app from './app.js';
import env from './config/env.js';
import connectDB from './config/db.js';
import { initSocket } from './socket/index.js';

const server = createServer(app);

// --- Socket.IO ---
initSocket(server);

// --- Start Server ---
async function start() {
  try {
    await connectDB();

    server.listen(env.port, () => {
      console.log(
        `DevFlow API server running on port ${env.port} [${env.nodeEnv}]`
      );
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

start();
