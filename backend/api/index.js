import app from '../app.js';
import connectDB from '../config/db.js';

/**
 * Vercel Serverless Function Handler for DevFlow Express API.
 * Ensures MongoDB connection is cached and ready before delegating request to Express app.
 */
export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Serverless database connection error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Please check server configuration.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
