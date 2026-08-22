/**
 * Centralized error-handling middleware.
 *
 * Catches errors passed via next(error) from routes/controllers.
 * Returns a consistent JSON error response.
 * Hides internal details in production.
 */

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  const response = {
    success: false,
    message,
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  console.error(`[Error] ${statusCode} — ${message}`);

  res.status(statusCode).json(response);
}

export default errorHandler;
