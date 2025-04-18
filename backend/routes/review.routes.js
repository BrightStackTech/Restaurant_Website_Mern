const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const reviewController = require('../controllers/review.controller');
const router = express.Router();


// Public route: fetch all reviews
router.get('/', reviewController.getAllReviews);

// Public route: allow anyone to fetch reviews for a product
router.get('/product/:productId', reviewController.getReviewsByProduct);

// Protected route: only logged in users can create a review
router.use(protect);

router.post('/', reviewController.createReview);

// Protected route: only logged in users can perform delete
router.delete('/:id', reviewController.deleteReview);

router.put('/:id/like', reviewController.toggleLike);
router.put('/:id/dislike', reviewController.toggleDislike);

module.exports = router;