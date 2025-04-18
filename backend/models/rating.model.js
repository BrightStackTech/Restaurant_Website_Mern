const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please add a rating between 1 and 5']
  },
  review: {
    type: String,
    maxlength: [500, 'Review cannot be more than 500 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from submitting more than one review per product
ratingSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to get average rating for a product
ratingSchema.statics.getAverageRating = async function(productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' } } }
  ]);
  
  try {
    await this.model('Product').findByIdAndUpdate(productId, {
      ratingvalue: result[0] ? Math.round(result[0].avgRating * 10) / 10 : 0
    });
  } catch(err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ratingSchema.post('save', function() {
  this.constructor.getAverageRating(this.product);
});

// Call getAverageRating after remove
ratingSchema.post('remove', function() {
  this.constructor.getAverageRating(this.product);
});

module.exports = mongoose.model('Rating', ratingSchema); 