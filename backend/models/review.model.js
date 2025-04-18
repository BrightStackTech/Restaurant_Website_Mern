const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Review content is required'],
    maxlength: [1000, 'Review cannot be more than 1000 characters']
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
  images: [
    {
      type: String
    }
  ],
  likeCount: {
    type: Number,
    default: 0
  },
  dislikeCount: {
    type: Number,
    default: 0
  },
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reply'
    }
  ],
  likedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  dislikedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);