require('dotenv').config();

const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { AppError } = require('./error.middleware');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage engine for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'restaurant-app',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'avi'],
    resource_type: 'auto',                  // <-- Add this line to process videos properly
    transformation: [{ width: 800, crop: 'scale' }],
  },
});

// Configure multer with Cloudinary storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp|mp4|mov|avi/;
    
    // If mimetype exists, test it; otherwise, allow (we'll rely on extension)
    const mimetypeValid = file.mimetype ? filetypes.test(file.mimetype) : true;
    
    // Remove leading dot before testing extension
    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    const validExt = filetypes.test(ext);
    
    if (mimetypeValid && validExt) {
      return cb(null, true);
    } else {
      cb(new AppError('Only image and video files are allowed (jpg, jpeg, png, webp, mp4, mov, avi)', 400));
    }
  },
});

// Use a field name "media" to match your AddProduct form Field
const uploadProductMedia = upload.array('media', 10);

// Middleware for handling multer errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  } else if (err) {
    return next(err);
  }
  next();
};

module.exports = {
  uploadProductMedia,
  handleUploadError,
  cloudinary,
};