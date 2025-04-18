const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const { catchAsync, AppError } = require('../middleware/error.middleware');
const { sendEmail } = require('../utils/email');
const { OAuth2Client } = require('google-auth-library');

// Create a Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

// Generate JWT token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET not set in environment variables');
    throw new Error('Server configuration error');
  }
  
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// Set token in response (cookie and JSON)
const sendTokenResponse = (user, statusCode, res) => {
  try {
    const token = generateToken(user._id);
    
    // Cookie options
    const cookieOptions = {
      expires: new Date(
        Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 30) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
    
    // Set secure flag in production
    if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true;
    }
    
    // Remove password from output
    user.password = undefined;
    
    // Get user profile data
    const userData = user.getProfile ? user.getProfile() : user;
    
    // Set cookie and send response
    res
      .status(statusCode)
      .cookie('jwt', token, cookieOptions)
      .json({
        success: true,
        data: {
          token,
          user: userData
        }
      });
      
    console.log('Token response sent with token:', token.substring(0, 10) + '...');
  } catch (error) {
    console.error('Error in sendTokenResponse:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating authentication token'
    });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  
  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already in use', 400));
  }
  
  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  console.log('Generated verification token:', verificationToken.substring(0, 10) + '...');
  
  // Hash token for storage
  const hashedToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  console.log('Hashed verification token for storage:', hashedToken.substring(0, 10) + '...');
  
  // Create new user with verification token
  const user = await User.create({
    name,
    email,
    password,
    emailVerificationToken: hashedToken,
    emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });
  
  // Create verification URL
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/email-verify/${verificationToken}`;
  
  // Email message
  const message = `
    Thank you for registering with ${process.env.RESTAURANT_NAME}! Please verify your email address by clicking the link below:
    \n\n${verificationUrl}\n\n
    If you did not register for an account, please ignore this email.
  `;
  
  try {
    // Log email details
    console.log('Sending registration email with nodemailer:');
    console.log('HOST:', process.env.EMAIL_HOST);
    console.log('PORT:', process.env.EMAIL_PORT);
    console.log('USER:', process.env.EMAIL_USER);
    console.log('TO:', user.email);
    console.log('Verification URL:', verificationUrl);
    
    // Send email
    await sendEmail({
      email: user.email,
      subject: `Welcome to ${process.env.RESTAURANT_NAME} - Verify Your Email`,
      message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF785B;">Welcome to ${process.env.RESTAURANT_NAME}!</h2>
          <p>Thank you for registering. To complete your registration, please verify your email address by clicking the button below:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #FF785B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Your Email</a>
          </p>
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>If you did not register for an account, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          <p style="color: #888; font-size: 12px;">${process.env.RESTAURANT_NAME} - Delicious Chinese Food for Every Mood</p>
        </div>
      `
    });
    
    // Return success message instead of token
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.'
    });
    
  } catch (err) {
    console.error('Registration email error:', err);
    
    // Delete the user if email fails - we require email verification
    await User.findByIdAndDelete(user._id);
    
    return next(new AppError(`Failed to send verification email: ${err.message}. Please try again.`, 500));
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  
  console.log('Login attempt for email:', email);
  
  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  
  // Find user by email
  const user = await User.findOne({ email }).select('+password');
  
  // Check if user exists
  if (!user) {
    console.log('User not found for email:', email);
    return next(new AppError('Invalid email or password', 401));
  }
  
  // Check if password is correct
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    console.log('Incorrect password for user:', email);
    return next(new AppError('Invalid email or password', 401));
  }
  
  // Log the email verification status 
  console.log('User email verification status:', user.isEmailVerified);
  
  // Check if email is verified
  if (!user.isEmailVerified) {
    console.log('Unverified email login attempt:', email);
    
    // Generate new verification token if needed
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save({ validateBeforeSave: false });
    
    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/email-verify/${verificationToken}`;
    
    try {
      // Send verification email
      await sendEmail({
        email: user.email,
        subject: 'Email Verification Required',
        message: `Please verify your email by clicking: ${verificationUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF785B;">Email Verification Required</h2>
            <p>Your email address has not been verified yet. Please verify your email by clicking the button below:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #FF785B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Your Email</a>
            </p>
            <hr style="border: 1px solid #eee; margin: 30px 0;">
          </div>
        `
      });
      console.log('Verification email sent to:', email);
    } catch (err) {
      console.error('Verification email error:', err);
    }
    
    return next(new AppError('Your email is not verified. A new verification email has been sent.', 401));
  }
  
  console.log('Login successful for:', email);
  
  // Send token response
  sendTokenResponse(user, 200, res);
});

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = catchAsync(async (req, res, next) => {
  // User is already available in req.user from protect middleware
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = catchAsync(async (req, res, next) => {
  const { name, email, profilePicture } = req.body;

  // Ensure email is unique
  if (email && email !== req.user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }
  }

  // Update user (now includes profilePicture)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, email, profilePicture },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  
  // Check if passwords exist
  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password', 400));
  }
  
  // Get user with password
  const user = await User.findById(req.user._id).select('+password');
  
  // Check if current password is correct
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 401));
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  // Send token response
  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password - send email
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return next(new AppError('Please provide an email address', 400));
  }
  
  // Find user by email
  const user = await User.findOne({ email });
  
  if (!user) {
    return next(new AppError('No user found with that email', 404));
  }
  
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and save to user
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  
  await user.save({ validateBeforeSave: false });
  
  // Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  
  // Email message
  const message = `
    You are receiving this email because you (or someone else) has requested a password reset.
    Please click on the link below to reset your password:
    \n\n${resetUrl}\n\n
    If you didn't request this, please ignore this email and your password will remain unchanged.
  `;
  
  try {
    // Add more detailed logging
    console.log('Sending registration email with nodemailer:');
    console.log('HOST:', process.env.EMAIL_HOST);
    console.log('PORT:', process.env.EMAIL_PORT);
    console.log('USER:', process.env.EMAIL_USER);
    console.log('TO:', user.email)
    
    // Send email
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message,
      html: `
        <p>You are receiving this email because you (or someone else) has requested a password reset.</p>
        <p style="margin-bottom:20px">Please click on the button below to reset your password:</p>
        <p><a href="${resetUrl}" style="background-color: #FF785B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p style="margin-top:20px">If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      `
    });
    
    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (err) {
    console.error('Email sending error:', err);
    
    // If email fails, clear reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    
    return next(new AppError(`Email could not be sent: ${err.message}`, 500));
  }
});

exports.sendResetPasswordEmail = exports.forgotPassword;

// @desc    Verify token
// @route   GET /api/auth/verify-token
// @access  Public
exports.verifyToken = catchAsync(async (req, res, next) => {
  const token = req.query.token || 
                (req.headers.authorization && req.headers.authorization.startsWith('Bearer') 
                  ? req.headers.authorization.split(' ')[1] 
                  : null);
  
  if (!token) {
    return res.status(200).json({
      success: false,
      isValid: false,
      message: 'No token provided'
    });
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(200).json({
        success: false,
        isValid: false,
        message: 'User not found'
      });
    }
    
    // Token is valid
    return res.status(200).json({
      success: true,
      isValid: true,
      user: user.getProfile ? user.getProfile() : {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      isValid: false,
      message: 'Invalid token'
    });
  }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  
  // Find user with valid token
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  
  if (!user) {
    return next(new AppError('Invalid or expired token', 400));
  }
  
  // Set new password
  user.password = req.body.password;
  
  // Clear reset token fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  
  // Save user with new password (will trigger pre-save hook to hash the password)
  await user.save();
  
  // Send login token
  sendTokenResponse(user, 200, res);
});

// @desc    Google OAuth login/register
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = catchAsync(async (req, res, next) => {
  const { token } = req.body;
  
  if (!token) {
    return next(new AppError('No token provided', 400));
  }
  
  try {
    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    // Get user payload from the verified token
    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // Update Google ID if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePicture = picture;
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        profilePicture: picture,
        password: crypto.randomBytes(16).toString('hex'), // Random password for Google users
      });
    }
    
    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    return next(new AppError('Failed to authenticate with Google', 401));
  }
});

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleAuthCallback = catchAsync(async (req, res, next) => {
  const { code } = req.query;

  if (!code) {
    return next(new AppError('Authorization code not provided', 400));
  }

  try {
    // Exchange the code for tokens
    const { tokens } = await googleClient.getToken(code);

    // Get user info using the access token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists but does NOT have googleId, block Google login and redirect
      if (!user.googleId) {
        // Redirect to frontend login with error
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=google_wrong_method`
        );
      }
      // ...existing logic for updating googleId/profilePicture...
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.profilePicture || user.profilePicture.includes('googleusercontent.com')) {
          user.profilePicture = picture;
        }
      }
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
    } else {
      // Create new user for Google sign-in
      user = await User.create({
        name,
        email,
        googleId,
        profilePicture: picture,
        password: crypto.randomBytes(16).toString('hex'),
        lastLogin: new Date()
      });
    }

    // Generate token and redirect to frontend
    const token = generateToken(user._id);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
  }
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const token = req.params.token;

  if (!token) {
    return next(new AppError('Token is required', 400));
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid or expired verification token', 400));
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully. You can now log in.',
  });
});

// @desc    Test email service
// @route   POST /api/auth/test-email
// @access  Public
exports.testEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return next(new AppError('Please provide an email address', 400));
  }
  
  try {
    // Log email details
    console.log('Sending test email with nodemailer:');
    console.log('HOST:', process.env.EMAIL_HOST);
    console.log('PORT:', process.env.EMAIL_PORT);
    console.log('USER:', process.env.EMAIL_USER);
    console.log('TO:', email);
    
    // Send email
    await sendEmail({
      email: email,
      subject: `${process.env.RESTAURANT_NAME} Email Test`,
      message: `This is a test email from ${process.env.RESTAURANT_NAME} to verify that the email service is working correctly.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF785B;">${process.env.RESTAURANT_NAME} Email Test</h2>
          <p>This is a test email from ${process.env.RESTAURANT_NAME} to verify that the email service is working correctly.</p>
          <p>If you received this email, it means our email service is configured properly!</p>
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          <p style="color: #888; font-size: 12px;">${process.env.RESTAURANT_NAME} - Delicious Chinese Food for Every Mood</p>
        </div>
      `
    });
    
    res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
    });
  } catch (err) {
    console.error('Test email error:', err);
    return next(new AppError(`Failed to send test email: ${err.message}`, 500));
  }
}); 
