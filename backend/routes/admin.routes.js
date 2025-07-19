const express = require('express');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');
const router = express.Router();

// Only admin can access
router.use(protect);
router.use(restrictTo('admin'));

router.get('/stats', adminController.getStats);

// ADD THIS LINE:
router.get('/user-growth', adminController.getUserGrowthStats);

// Add this with other protected routes
router.put('/change-admin-password', protect, restrictTo('admin'), adminController.changeAdminPassword);

module.exports = router;