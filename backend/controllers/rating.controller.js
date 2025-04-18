const Rating = require('../models/rating.model');
const Product = require('../models/product.model');
const { catchAsync, AppError } = require('../middleware/error.middleware');

// @desc    Get all ratings
// @route   GET /api/ratings
// @access  Public
exports.getAllRatings = catchAsync(async (req, res, next) => {
  const ratings = await Rating.find()
    .populate('user', 'name')
    .populate('product', 'name');

  res.status(200).json({
    success: true,
    count: ratings.length,
    data: ratings
  });
});

// @desc    Get ratings for a specific product
// @route   GET /api/ratings/product/:productId
// @access  Public
exports.getProductRatings = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  // Verify product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const ratings = await Rating.find({ product: productId })
    .populate('user', 'name');

  res.status(200).json({
    success: true,
    count: ratings.length,
    data: ratings
  });
});

// @desc    Get single rating
// @route   GET /api/ratings/:id
// @access  Private
exports.getRating = catchAsync(async (req, res, next) => {
  const rating = await Rating.findById(req.params.id)
    .populate('user', 'name')
    .populate('product', 'name');

  if (!rating) {
    return next(new AppError('Rating not found', 404));
  }

  res.status(200).json({
    success: true,
    data: rating
  });
});

// @desc    Create rating
// @route   POST /api/ratings
// @access  Private
exports.createRating = catchAsync(async (req, res, next) => {
  // Add the logged-in user's id to the request body
  req.body.user = req.user.id;

  // Check if the product exists
  const product = await Product.findById(req.body.product);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check if the user already rated the product
  const existingRating = await Rating.findOne({
    user: req.user.id,
    product: req.body.product,
  });
  if (existingRating) {
    // Update existing rating's value and comment
    existingRating.rating = req.body.rating;
    existingRating.comment = req.body.comment;
    await existingRating.save();

    // Optionally update product's average rating
    await Rating.getAverageRating(req.body.product);

    return res.status(200).json({
      success: true,
      data: existingRating,
    });
  }

  // Create a new rating document if none exists
  const rating = await Rating.create(req.body);

  // Update the product – push the new rating's _id into the product’s ratings array
  await Product.findByIdAndUpdate(req.body.product, {
    $push: { ratings: rating._id }
  });

  res.status(201).json({
    success: true,
    data: rating,
  });
});

// @desc    Update rating
// @route   PUT /api/ratings/:id
// @access  Private - Owner or Admin
exports.updateRating = catchAsync(async (req, res, next) => {
  // Don't allow changing product or user
  delete req.body.product;
  delete req.body.user;

  const rating = await Rating.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!rating) {
    return next(new AppError('Rating not found', 404));
  }

  res.status(200).json({
    success: true,
    data: rating
  });
});

// @desc    Delete rating
// @route   DELETE /api/ratings/:id
// @access  Private - Owner or Admin
exports.deleteRating = catchAsync(async (req, res, next) => {
  const rating = await Rating.findById(req.params.id);

  if (!rating) {
    return next(new AppError('Rating not found', 404));
  }

  await rating.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
}); 