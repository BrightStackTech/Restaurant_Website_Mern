const express = require('express');
const { protect, isOwnerOrAdmin } = require('../middleware/auth.middleware');
const ratingController = require('../controllers/rating.controller');

const router = express.Router();

// Public routes
router.get('/', ratingController.getAllRatings);
router.get('/product/:productId', ratingController.getProductRatings);

// Protected routes - require authentication
router.use(protect);

// Create new rating
router.post('/', ratingController.createRating);

// Get, update or delete specific rating
router.route('/:id')
  .get(ratingController.getRating)
  .put(isOwnerOrAdmin, ratingController.updateRating)
  .delete(isOwnerOrAdmin, ratingController.deleteRating);

module.exports = router; 