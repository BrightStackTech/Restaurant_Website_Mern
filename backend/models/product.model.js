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
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Product', productSchema);