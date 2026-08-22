import mongoose from 'mongoose';
import env from './env.js';

/**
 * Connect to MongoDB.
 * Logs connection status clearly.
 * Does not crash the process on failure — the caller decides how to handle it.
 */
async function connectDB() {
  try {
    const conn = await mongoose.connect(env.mongodbUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}

export default connectDB;
