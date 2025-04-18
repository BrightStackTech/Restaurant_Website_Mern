const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Reply content is required'],
      maxlength: [1000, 'Reply cannot exceed 1000 characters']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reply', replySchema);