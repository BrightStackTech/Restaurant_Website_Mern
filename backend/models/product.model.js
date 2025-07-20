const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be a positive number']
  },
  halfPrice: {
    type: Number,
    min: [0, 'Half price must be a positive number'],
    default: null
  },
  media: [{
    type: String,
    default: 'default-product.jpg'
  }],
  vegornon: {
    type: String,
    required: [true, 'Please specify if the product is veg or non-veg'],
    enum: ['veg', 'non-veg']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
  },
  ratingvalue: {
    type: Number,
    default: 0
  },
  ratings: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Rating',
    default: []
  },
  reviews: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Review',
    default: []
  },
  order: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    // Delete all ratings
    await mongoose.model('Rating').deleteMany({ product: this._id });

    // Get all reviews
    const reviews = await mongoose.model('Review').find({ product: this._id });
    
    // Delete all replies to these reviews
    for (const review of reviews) {
      await mongoose.model('Reply').deleteMany({ review: review._id });
    }
    
    // Delete all reviews
    await mongoose.model('Review').deleteMany({ product: this._id });

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Product', productSchema);