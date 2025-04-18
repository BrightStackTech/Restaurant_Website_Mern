const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
      {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      set: v => v.replace(/\s+/g, '_').toLowerCase(), // Replace spaces with underscores and lowercase
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't include password by default in query results
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values (for non-Google users)
    },
    profilePicture: {
      type: String,
      default: 'https://res.cloudinary.com/dvb5mesnd/image/upload/v1741339315/Screenshot_2025-03-07_145028-removebg-preview_mqw8by.png',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    emailVerificationExpire: Date,
      lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to check if password is correct
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user profile (without sensitive info)
userSchema.methods.getProfile = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    isAdmin: this.isAdmin,
    profilePicture: this.profilePicture,
    isEmailVerified: this.isEmailVerified,
    createdAt: this.createdAt,
  };
};

userSchema.pre('findOneAndDelete', async function(next) {
  const user = await this.model.findOne(this.getFilter());
  if (user) {
    // Find all ratings by this user
    const ratings = await mongoose.model('Rating').find({ user: user._id });
    const ratingIds = ratings.map(r => r._id);
    const productIds = ratings.map(r => r.product);

    // Remove these rating IDs from products' ratings arrays
    await mongoose.model('Product').updateMany(
      { ratings: { $in: ratingIds } },
      { $pull: { ratings: { $in: ratingIds } } }
    );

    // Now delete the ratings themselves
    await mongoose.model('Rating').deleteMany({ user: user._id });

    // Recalculate ratingvalue for affected products
    const Rating = mongoose.model('Rating');
    const uniqueProductIds = [...new Set(productIds.map(id => id.toString()))];
    for (const productId of uniqueProductIds) {
      await Rating.getAverageRating(productId);
    }

    // Delete reviews and replies by this user
    await mongoose.model('Review').deleteMany({ user: user._id });
    await mongoose.model('Reply').deleteMany({ user: user._id });

    // Remove user from likedBy/dislikedBy in all reviews
    await mongoose.model('Review').updateMany(
      { likedBy: user._id },
      { $pull: { likedBy: user._id } }
    );
    await mongoose.model('Review').updateMany(
      { dislikedBy: user._id },
      { $pull: { dislikedBy: user._id } }
    );

    // Recalculate likeCount and dislikeCount for all reviews
    await mongoose.model('Review').updateMany(
      {},
      [
        { $set: { likeCount: { $size: "$likedBy" }, dislikeCount: { $size: "$dislikedBy" } } }
      ]
    );
  }
  next();
});

userSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  const userId = this._id;
  // Find all ratings by this user
  const ratings = await mongoose.model('Rating').find({ user: userId });
  const ratingIds = ratings.map(r => r._id);
  const productIds = ratings.map(r => r.product);

  // Remove these rating IDs from products' ratings arrays
  await mongoose.model('Product').updateMany(
    { ratings: { $in: ratingIds } },
    { $pull: { ratings: { $in: ratingIds } } }
  );

  // Now delete the ratings themselves
  await mongoose.model('Rating').deleteMany({ user: userId });

  // Recalculate ratingvalue for affected products
  const Rating = mongoose.model('Rating');
  const uniqueProductIds = [...new Set(productIds.map(id => id.toString()))];
  for (const productId of uniqueProductIds) {
    await Rating.getAverageRating(productId);
  }

  // Delete reviews and replies by this user
  await mongoose.model('Review').deleteMany({ user: userId });
  await mongoose.model('Reply').deleteMany({ user: userId });

  // Remove user from likedBy/dislikedBy in all reviews
  await mongoose.model('Review').updateMany(
    { likedBy: userId },
    { $pull: { likedBy: userId } }
  );
  await mongoose.model('Review').updateMany(
    { dislikedBy: userId },
    { $pull: { dislikedBy: userId } }
  );

  // Recalculate likeCount and dislikeCount for all reviews
  await mongoose.model('Review').updateMany(
    {},
    [
      { $set: { likeCount: { $size: "$likedBy" }, dislikeCount: { $size: "$dislikedBy" } } }
    ]
  );

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User; 