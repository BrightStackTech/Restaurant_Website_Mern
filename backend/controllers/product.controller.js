const Product = require('../models/product.model');
const { catchAsync, AppError } = require('../middleware/error.middleware');
const cloudinary = require('cloudinary').v2;


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.createProduct = catchAsync(async (req, res, next) => {
  let mediaUrls = [];
  
  if (req.files && req.files.length > 0) {
    mediaUrls = req.files.map(file => file.path);
  }
  
  const { name, price, halfPrice, vegornon, category, description } = req.body;
  
  if (!name || !price || !category || !description) {
    return next(new AppError('All fields are required', 400));
  }

  // Get the highest order value
  const highestOrder = await Product.findOne().sort({ order: -1 }).select('order');
  const nextOrder = (highestOrder?.order || -1) + 1;

  // Convert halfPrice to number or null
  const convertedHalfPrice = halfPrice ? Number(halfPrice) : null;

  const product = await Product.create({
    name,
    description,
    price: Number(price),
    halfPrice: convertedHalfPrice,
    vegornon,
    category,
    media: mediaUrls,
    order: nextOrder // Set the order to next available number
  });

  res.status(201).json({
    success: true,
    data: product,
  });
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

exports.getProductsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  // You can customize this query as needed
  const products = await Product.find({ category: { $regex: new RegExp(category, "i") } });
  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = catchAsync(async (req, res, next) => {
  const updateFields = { ...req.body };
  
  // Convert price and halfPrice to numbers
  if (updateFields.price) {
    updateFields.price = Number(updateFields.price);
  }
  
  // Handle halfPrice specifically
  if (updateFields.halfPrice) {
    updateFields.halfPrice = Number(updateFields.halfPrice);
  } else if (updateFields.halfPrice === '') {
    // If halfPrice is empty string, set it to null
    updateFields.halfPrice = null;
  }

  // If files are sent, add them to the media array
  if (req.files && req.files.length > 0) {
    updateFields.media = req.files.map(file => file.path);
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id, 
    updateFields, 
    { 
      new: true, 
      runValidators: true 
    }
  );

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  try {
    // Delete all ratings associated with this product
    await mongoose.model('Rating').deleteMany({ product: product._id });

    // Delete all reviews and their replies associated with this product
    const reviews = await mongoose.model('Review').find({ product: product._id });
    
    // Delete replies for each review
    for (const review of reviews) {
      await mongoose.model('Reply').deleteMany({ review: review._id });
    }
    
    // Delete the reviews
    await mongoose.model('Review').deleteMany({ product: product._id });

    // Finally delete the product
    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product and all associated data deleted successfully'
    });
  } catch (error) {
    return next(new AppError('Error deleting product and associated data', 500));
  }
});

exports.updateProductsOrder = catchAsync(async (req, res, next) => {
  const { updates } = req.body; // Array of { id, order }

  for (let update of updates) {
    await Product.findByIdAndUpdate(update.id, { order: update.order });
  }

  res.status(200).json({
    success: true,
    message: 'Products reordered successfully'
  });
});

exports.toggleFeatured = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { featured } = req.body;

  // If trying to set featured to true, check current count
  if (featured) {
    const featuredCount = await Product.countDocuments({ featured: true });
    if (featuredCount >= 4) {
      return next(new AppError('Maximum 4 products can be featured', 400));
    }
  }

  const product = await Product.findByIdAndUpdate(
    id,
    { featured },
    { new: true, runValidators: true }
  );

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    data: product
  });
});