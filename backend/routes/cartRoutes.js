import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cartController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply protection & buyer authorization to all cart routes
router.use(protect, authorize('buyer'));

router
  .route('/')
  .get(getCart)
  .delete(clearCart);

router
  .route('/items')
  .post(addToCart);

router
  .route('/items/:productId')
  .put(updateCartItem)
  .patch(updateCartItem)
  .delete(removeCartItem);

export default router;
