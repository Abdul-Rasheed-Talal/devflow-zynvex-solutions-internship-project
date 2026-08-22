import dotenv from 'dotenv';

dotenv.config();

/**
 * Validates that all required environment variables are present.
 * Returns the validated config object.
 * Throws a descriptive error if any required variable is missing.
 */
function validateEnv() {
  const required = ['MONGODB_URI'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Copy .env.example to .env and fill in the values.'
    );
  }

  return {
    port: parseInt(process.env.PORT, 10) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET, // Not used yet — will be required in auth task
  };
}

const env = validateEnv();

export default env;
