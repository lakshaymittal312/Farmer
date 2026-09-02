import express from 'express';
import {
  createReview,
  getProductReviews,
  getMyReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('buyer'), createReview);
router.get('/product/:productId', getProductReviews);
router.get('/my-reviews', protect, authorize('buyer'), getMyReviews);
router.get('/:id', getReviewById);
router.patch('/:id', protect, authorize('buyer'), updateReview);
router.delete('/:id', protect, authorize('buyer'), deleteReview);

export default router;
