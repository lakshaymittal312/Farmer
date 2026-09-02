import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import FarmerProfile from '../models/FarmerProfile.js';

/**
 * Recalculate Product.rating and FarmerProfile.rating based on actual Review documents
 * @param {ObjectId|string} productId 
 * @param {ObjectId|string} farmerId 
 */
export const recalculateRatings = async (productId, farmerId) => {
  if (productId) {
    const productReviews = await Review.find({ product: productId });
    let productAvg = 0;
    if (productReviews.length > 0) {
      const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
      productAvg = Math.round((sum / productReviews.length) * 100) / 100;
    }
    await Product.findByIdAndUpdate(productId, { rating: productAvg });
  }

  if (farmerId) {
    const farmerReviews = await Review.find({ farmer: farmerId });
    let farmerAvg = 0;
    if (farmerReviews.length > 0) {
      const sum = farmerReviews.reduce((acc, r) => acc + r.rating, 0);
      farmerAvg = Math.round((sum / farmerReviews.length) * 100) / 100;
    }
    await FarmerProfile.findByIdAndUpdate(farmerId, { rating: farmerAvg });
  }
};

// @desc    Create a new product review
// @route   POST /api/reviews
// @access  Private (Buyer)
export const createReview = async (req, res) => {
  try {
    const { product, order, rating, comment } = req.body;
    const buyerId = req.user._id;

    // 1. Check required fields
    if (!product || !order || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product, order, and rating',
      });
    }

    // 2. Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(product) || !mongoose.Types.ObjectId.isValid(order)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product or order ID format',
      });
    }

    // 3. Validate rating constraints (integer 1-5)
    if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5',
      });
    }

    // 4. Find order and verify ownership
    const orderDoc = await Order.findById(order);
    if (!orderDoc) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (orderDoc.buyer.toString() !== buyerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: Order does not belong to authenticated user',
      });
    }

    // 5. Verify order is delivered
    if (orderDoc.orderStatus !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: `Only delivered orders can be reviewed. Current order status: '${orderDoc.orderStatus}'`,
      });
    }

    // 6. Verify product was purchased in this order
    const productInOrder = orderDoc.items.some(
      (item) => item.product.toString() === product.toString()
    );
    if (!productInOrder) {
      return res.status(400).json({
        success: false,
        message: 'Product was not purchased in this order',
      });
    }

    // 7. Load Product to verify existence and get farmer reference
    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const farmerId = productDoc.farmer;

    // 8. Check for duplicate review (buyer + product + order)
    const existingReview = await Review.findOne({
      buyer: buyerId,
      product: productDoc._id,
      order: orderDoc._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this product in this order',
      });
    }

    // 9. Create review
    const review = await Review.create({
      buyer: buyerId,
      product: productDoc._id,
      farmer: farmerId,
      order: orderDoc._id,
      rating,
      comment: comment ? String(comment).trim() : '',
    });

    // 10. Recalculate ratings
    await recalculateRatings(productDoc._id, farmerId);

    await review.populate([
      { path: 'buyer', select: 'name profileImage' },
      { path: 'product', select: 'name price images' },
    ]);

    return res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this product in this order',
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error creating review',
      error: error.message,
    });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const reviews = await Review.find({ product: productId })
      .populate('buyer', 'name profileImage')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching product reviews',
      error: error.message,
    });
  }
};

// @desc    Get reviews created by authenticated buyer
// @route   GET /api/reviews/my-reviews
// @access  Private (Buyer)
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ buyer: req.user._id })
      .populate('product', 'name price images unit')
      .populate('farmer', 'farmName village district state')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user reviews',
      error: error.message,
    });
  }
};

// @desc    Get single review by ID
// @route   GET /api/reviews/:id
// @access  Public / Private
export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID format',
      });
    }

    const review = await Review.findById(id)
      .populate('buyer', 'name profileImage')
      .populate('product', 'name price images unit')
      .populate('farmer', 'farmName village district state');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    return res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching review',
      error: error.message,
    });
  }
};

// @desc    Edit a review (Owner buyer only)
// @route   PATCH /api/reviews/:id
// @access  Private (Buyer owner)
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID format',
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Ownership check
    if (review.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this review',
      });
    }

    const { rating, comment } = req.body;

    if (rating !== undefined) {
      if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be an integer between 1 and 5',
        });
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = String(comment).trim();
    }

    await review.save();

    // Recalculate ratings
    await recalculateRatings(review.product, review.farmer);

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating review',
      error: error.message,
    });
  }
};

// @desc    Delete a review (Owner buyer only)
// @route   DELETE /api/reviews/:id
// @access  Private (Buyer owner)
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID format',
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Ownership check
    if (review.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review',
      });
    }

    const productId = review.product;
    const farmerId = review.farmer;

    await Review.findByIdAndDelete(id);

    // Recalculate ratings
    await recalculateRatings(productId, farmerId);

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error deleting review',
      error: error.message,
    });
  }
};
