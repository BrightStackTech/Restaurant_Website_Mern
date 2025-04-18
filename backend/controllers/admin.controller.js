const User = require('../models/user.model');
const Product = require('../models/product.model');
const Review = require('../models/review.model');

exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ isAdmin: { $ne: true } });
    const totalProducts = await Product.countDocuments();
    const totalReviews = await Review.countDocuments();

    // Top 3 rated products with number of raters and number of reviews
    const topProducts = await Product.aggregate([
      { $addFields: { 
          numRaters: { $size: "$ratings" },
          numReviews: { $size: "$reviews" }
        } 
      },
      { $sort: { ratingvalue: -1, numRaters: -1 } },
      { $limit: 3 },
      { $project: { name: 1, ratingvalue: 1, numRaters: 1, numReviews: 1, price: 1, media: 1, category: 1, vegornon: 1 } }
    ]);

    // Top 3 most liked reviews (unchanged)
    const topReviews = await Review.find()
      .sort({ likeCount: -1 })
      .limit(3)
      .populate('user', 'name profilePicture')
      .populate('product', 'name')
      .select('content likeCount user product createdAt');

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalReviews,
        topProducts,
        topReviews,
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserGrowthStats = async (req, res, next) => {
  try {
    const { period = 'day' } = req.query; // hour, day, month, year

    let groupFormat;
    let match = { isAdmin: { $ne: true } };
    let sort = { _id: 1 };
    let limit = 0;

    switch (period) {
      case 'hour':
        // Past 24 hours
        const now = new Date();
        const past24 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        match.createdAt = { $gte: past24 };
        groupFormat = { $hour: "$createdAt" };
        sort = { _id: 1 };
        break;
      case 'day':
        // Past 30 days
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        limit = 30;
        break;
      case 'month':
        groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        limit = 12;
        break;
      case 'year':
        groupFormat = { $dateToString: { format: "%Y", date: "$createdAt" } };
        break;
      default:
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }

    let pipeline = [
      { $match: match },
      { $group: { _id: groupFormat, count: { $sum: 1 } } },
      { $sort: sort }
    ];
    if (limit > 0) pipeline.push({ $limit: limit });

    const stats = await require('../models/user.model').aggregate(pipeline);

    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};