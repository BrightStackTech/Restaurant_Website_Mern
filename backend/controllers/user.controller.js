const User = require('../models/user.model');
const { catchAsync, AppError } = require('../middleware/error.middleware');
const { OAuth2Client } = require('google-auth-library');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-password');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin or Owner
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin or Owner
exports.updateUser = catchAsync(async (req, res, next) => {
  // Don't allow password updates through this route
  if (req.body.password) {
    return next(new AppError('This route is not for password updates. Please use /api/auth/updatepassword', 400));
  }

  // Filter allowed fields
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  // Only allow admin to update isAdmin status
  if (req.user.isAdmin) {
    fieldsToUpdate.isAdmin = req.body.isAdmin;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin or Owner
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL}/api/auth/google/callback`
); 
