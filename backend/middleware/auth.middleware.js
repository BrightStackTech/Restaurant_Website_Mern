const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { catchAsync, AppError } = require('./error.middleware');

// Extract JWT token from request
const getTokenFromRequest = (req) => {
  // 1) Get token from authorization header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2) Or get token from cookies
  else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  
  return token;
};

// Protect routes - Authentication middleware
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token
  const token = getTokenFromRequest(req);
  
  if (!token) {
    return next(new AppError('Please log in to access this resource', 401));
  }
  
  try {
    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3) Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists', 401));
    }
    
    // 4) Set user on request
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return next(new AppError('Invalid authentication token', 401));
  }
});

// Restrict access to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // User must already be authenticated by the protect middleware
    if (!roles.includes(req.user.isAdmin ? 'admin' : 'user')) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Check if user is admin or owner
exports.isOwnerOrAdmin = catchAsync(async (req, res, next) => {
  // User must already be authenticated by the protect middleware
  const userId = req.params.id;
  
  // Allow admin access
  if (req.user.isAdmin) {
    return next();
  }
  
  // Allow owner access
  if (req.user._id.toString() === userId) {
    return next();
  }
  
  // Otherwise, deny access
  return next(new AppError('You do not have permission to perform this action', 403));
}); 