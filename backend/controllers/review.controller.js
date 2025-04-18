const Review = require('../models/review.model');
const Product = require('../models/product.model');
const { catchAsync, AppError } = require('../middleware/error.middleware');

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.product) {
    return next(new AppError('Product id is required', 400));
  }
  if (!req.body.content) {
    return next(new AppError('Review content is required', 400));
  }

  // Set the review’s user id from the authenticated user
  req.body.user = req.user.id;
  
  // Remove likedBy and dislikedBy from req.body so that defaults are applied
  delete req.body.likedBy;
  delete req.body.dislikedBy;

  const review = await Review.create(req.body);

  await Product.findByIdAndUpdate(req.body.product, {
    $push: { reviews: review._id }
  });

  res.status(201).json({
    success: true,
    data: review
  });
});

exports.getReviewsByProduct = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name profilePicture')
      .populate({
        path: 'replies',
        populate: { path: 'user', select: 'name profilePicture' }
      }).populate('product', 'name');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = catchAsync(async (req, res, next) => {
  console.log('Deleting review with id:', req.params.id);  // <-- debug log
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new AppError('Review not found', 404));
  }
  
  await review.deleteOne();
  await Product.findByIdAndUpdate(review.product, {
    $pull: { reviews: review._id }
  });
  
  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

exports.toggleLike = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const review = await Review.findById(req.params.id);
    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    // Check if user already liked the review
    const indexLike = review.likedBy.indexOf(userId);
    const indexDislike = review.dislikedBy.indexOf(userId);

    if (indexLike !== -1) {
      // Already liked → remove like (toggle off)
      review.likedBy.splice(indexLike, 1);
      review.likeCount = review.likedBy.length; // recalc the count (or decrement it)
    } else {
      // Not liked yet.
      // But if user already disliked, remove from dislikedBy first.
      if (indexDislike !== -1) {
        review.dislikedBy.splice(indexDislike, 1);
        review.dislikeCount = review.dislikedBy.length;
      }
      // Add user's like.
      review.likedBy.push(userId);
      review.likeCount = review.likedBy.length;
    }

    await review.save();
    res.status(200).json({
      success: true,
      data: {
        likeCount: review.likeCount,
        dislikeCount: review.dislikeCount,
        likedBy: review.likedBy,
        dislikedBy: review.dislikedBy,
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleDislike = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const review = await Review.findById(req.params.id);
    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    const indexDislike = review.dislikedBy.indexOf(userId);
    const indexLike = review.likedBy.indexOf(userId);

    if (indexDislike !== -1) {
      // Already disliked → remove dislike (toggle off)
      review.dislikedBy.splice(indexDislike, 1);
      review.dislikeCount = review.dislikedBy.length;
    } else {
      // Not disliked yet.
      // If user already liked, remove like.
      if (indexLike !== -1) {
        review.likedBy.splice(indexLike, 1);
        review.likeCount = review.likedBy.length;
      }
      // Add user's dislike.
      review.dislikedBy.push(userId);
      review.dislikeCount = review.dislikedBy.length;
    }

    await review.save();
    res.status(200).json({
      success: true,
      data: {
        likeCount: review.likeCount,
        dislikeCount: review.dislikeCount,
        likedBy: review.likedBy,
        dislikedBy: review.dislikedBy,
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find()
    .populate('user', 'name profilePicture')
    .populate('product', 'name');

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});