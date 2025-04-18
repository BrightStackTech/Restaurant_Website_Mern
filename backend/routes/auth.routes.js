const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/user.model');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);
router.get('/google/callback', authController.googleAuthCallback);
router.post('/forgotpassword', authController.forgotPassword);
router.put('/resetpassword/:token', authController.resetPassword);
router.get('/verify-token', authController.verifyToken);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/test-email', authController.testEmail);
router.get('/check-email', async (req, res) => {
  res.set('Cache-Control', 'no-store'); // <-- Add this line
  const { email } = req.query;
  if (!email) return res.json({ exists: false });

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.json({ exists: false });
  }

  // Block password reset for any account with a googleId
  if (user.googleId) {
    return res.json({
      exists: true,
      googleSignIn: true,
      message: "This account was registered using Google sign-in method. Please try with a differnt email id"
    });
  }

  // Otherwise, normal email/password account
  return res.json({ exists: true, googleSignIn: false });
});

router.get('/check-username', async (req, res) => {
  const { name } = req.query;
  if (!name) return res.json({ exists: false });
  const user = await User.findOne({ name: new RegExp(`^${name}$`, 'i') });
  res.json({ exists: !!user });
});

//router.post('/reset-password', authController.sendResetPasswordEmail); // send reset link
router.post('/reset-password/:token', authController.resetPassword);   // reset password with token

// Protected routes
router.use(protect); // All routes below this middleware require authentication

router.get('/logout', authController.logout);
router.get('/me', authController.getMe);
router.put('/updatedetails', authController.updateDetails);
router.put('/updatepassword', authController.updatePassword);

module.exports = router; 