const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');

// Import route files
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const ratingRoutes = require('./routes/rating.routes');
const reviewRoutes = require('./routes/review.routes');
const replyRoutes = require('./routes/reply.routes');
const adminRoutes = require('./routes/admin.routes');
const contactRoutes = require('./routes/contact.routes');


const User = require('./models/user.model');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://yourdomain.com' 
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies
app.use(morgan('dev')); // HTTP request logger

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/replies', replyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve frontend build
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get(/(.*)/, (_req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Root route
app.get('/api', (_req, res) => {
  res.json({ 
    message: `Welcome to ${process.env.RESTAURANT_NAME} API`, 
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      ratings: '/api/ratings'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    (async () => {
      try {
        const adminEmail = process.env.ADMIN_EMAIL ;
        const adminPassword = process.env.ADMIN_PASSWORD ;
        
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (!existingAdmin) {
          await User.create({
            name: 'Admin',
            email: adminEmail,
            password: adminPassword,
            isAdmin: true,
            isEmailVerified: true
          });
          console.log(`Admin user created: ${adminEmail}`);
        } else {
          console.log(`Admin user already exists: ${adminEmail}`);
        }
      } catch (error) {
        console.error('Error creating admin user:', error);
      }
    })();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
}); 