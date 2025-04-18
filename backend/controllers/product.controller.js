const Product = require('../models/product.model');
const { catchAsync, AppError } = require('../middleware/error.middleware');
const cloudinary = require('cloudinary').v2;


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.createProduct = catchAsync(async (req, res, next) => {
  // Instead of re-uploading, simply get the URLs from req.files
  let mediaUrls = [];
  
  if (req.files && req.files.length > 0) {
    // Each file object already contains the Cloudinary URL in file.path
    mediaUrls = req.files.map(file => file.path);
  }
  
  const { name, price, vegornon, category, description } = req.body;
  
  if (!name || !price || !category || !description) {
    return next(new AppError('All fields are required', 400));
  }

  const product = await Product.create({
    name,
    description,
    price,
    vegornon,
    category,
    media: mediaUrls
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
  // If files are sent, add them to the media array
  if (req.files && req.files.length > 0) {
    updateFields.media = req.files.map(file => file.path);
  }
  const product = await Product.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true });
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

  await product.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
}); 