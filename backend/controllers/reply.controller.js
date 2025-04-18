const Reply = require('../models/reply.model');
const Review = require('../models/review.model');
const { catchAsync, AppError } = require('../middleware/error.middleware');

exports.createReply = catchAsync(async (req, res, next) => {
  const { reviewId, productId, content } = req.body;
  if (!reviewId || !productId || !content) {
    return next(new AppError('Review ID, Product ID and content are required', 400));
  }

  const reply = await Reply.create({
    review: reviewId,
    product: productId,
    user: req.user.id,
    content
  });

  // Push the reply's id into the corresponding review replies array
  await Review.findByIdAndUpdate(reviewId, { $push: { replies: reply._id } });

  res.status(201).json({
    success: true,
    data: reply,
  });
});

exports.getReplyById = catchAsync(async (req, res, next) => {
  const reply = await Reply.findById(req.params.id).populate('user', 'name profilePicture');
  if (!reply) {
    return next(new AppError('Reply not found', 404));
  }
  res.status(200).json({
    success: true,
    data: reply,
  });
});

exports.deleteReply = catchAsync(async (req, res, next) => {
  const reply = await Reply.findById(req.params.id);
  if (!reply) {
    return next(new AppError('Reply not found', 404));
  }

  // Allow deletion by admin or the user who posted the reply
  if (reply.user.toString() !== req.user.id && !req.user.isAdmin) {
    return next(new AppError('Not authorized to delete this reply', 403));
  }

  await reply.deleteOne();
  // Remove reply id from review's replies array
  await Review.findByIdAndUpdate(reply.review, { $pull: { replies: reply._id } });

  res.status(200).json({
    success: true,
    message: 'Reply deleted successfully'
  });
});