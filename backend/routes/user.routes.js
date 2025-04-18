const express = require('express');
const { protect, restrictTo, isOwnerOrAdmin } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');
const User = require('../models/user.model');

const router = express.Router();

router.get('/by-username/:username', async (req, res) => {
  try {
    const decodedName = decodeURIComponent(req.params.username);
    // Case-insensitive exact match
    const user = await User.findOne({ name: new RegExp(`^${decodedName}$`, 'i') }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Protect all routes in this router
router.use(protect);

// Admin can get all users
router.get('/', restrictTo('admin'), userController.getAllUsers);

// User can access their own profile or admin can access any profile
router.route('/:id')
  .get(isOwnerOrAdmin, userController.getUser)
  .put(isOwnerOrAdmin, userController.updateUser)
  .delete(isOwnerOrAdmin, userController.deleteUser);

module.exports = router; 