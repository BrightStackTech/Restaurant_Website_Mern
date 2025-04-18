// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    err.message = `Duplicate field value: ${value}. Please use another value for ${field}.`;
    err.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    err.message = errors.join(', ');
    err.statusCode = 400;
  }

  // Mongoose CastError (invalid ID)
  if (err.name === 'CastError') {
    err.message = `Invalid ${err.path}: ${err.value}`;
    err.statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    err.message = 'Invalid token. Please log in again.';
    err.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    err.message = 'Your token has expired. Please log in again.';
    err.statusCode = 401;
  }

  // Development vs Production error response
  const errorResponse = {
    success: false,
    status: err.status,
    message: err.message,
  };

  if (process.env.NODE_ENV === 'development') {
    // Add more details in development mode
    errorResponse.error = err;
    errorResponse.stack = err.stack;
  }

  res.status(err.statusCode).json(errorResponse);
};

// Async error handler wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  errorHandler,
  catchAsync,
}; 