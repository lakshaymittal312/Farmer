// Global 404 Handler for undefined routes
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' not found`,
  });
};

// Centralized Global Error Handler Middleware
export const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal server error';
  let errors = null;

  // Handle Mongoose Invalid ObjectId CastError
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found. Invalid ID format: ${err.value}`;
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
  }

  // Handle Mongoose Schema ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errors = Object.values(err.errors).map((val) => val.message);
    message = errors.join(', ');
  }

  // Handle JWT Verification Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error Handler] ${req.method} ${req.originalUrl}:`, err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
