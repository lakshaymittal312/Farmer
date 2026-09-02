import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer reference is required'],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerProfile',
      required: [true, 'Farmer reference is required'],
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer between 1 and 5',
      },
    },
    comment: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound unique index for one review per product per order by a buyer
reviewSchema.index({ buyer: 1, product: 1, order: 1 }, { unique: true });
reviewSchema.index({ product: 1 });
reviewSchema.index({ farmer: 1 });
reviewSchema.index({ buyer: 1 });
reviewSchema.index({ order: 1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
