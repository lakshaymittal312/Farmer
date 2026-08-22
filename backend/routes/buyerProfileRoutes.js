import express from 'express';
import {
  createBuyerProfile,
  getLoggedInBuyerProfile,
  getBuyerProfileById,
  updateBuyerProfile,
  deleteBuyerProfile,
  addDeliveryAddress,
  updateDeliveryAddress,
  deleteDeliveryAddress,
  setDefaultDeliveryAddress,
  addWishlistItem,
  removeWishlistItem,
} from '../controllers/buyerProfileController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Specific routes
router.post('/', protect, createBuyerProfile);
router.get('/me', protect, getLoggedInBuyerProfile);
router.put('/me', protect, updateBuyerProfile);
router.delete('/me', protect, deleteBuyerProfile);

// Address Management
router.post('/addresses', protect, addDeliveryAddress);
router.put('/addresses/:addressId', protect, updateDeliveryAddress);
router.delete('/addresses/:addressId', protect, deleteDeliveryAddress);
router.patch('/addresses/:addressId/default', protect, setDefaultDeliveryAddress);
router.put('/addresses/:addressId/default', protect, setDefaultDeliveryAddress);

// Wishlist Management
router.post('/wishlist', protect, addWishlistItem);
router.delete('/wishlist/:productId', protect, removeWishlistItem);

// Parameterized Profile Routes
router.get('/:id', getBuyerProfileById);
router.put('/:id', protect, updateBuyerProfile);
router.delete('/:id', protect, deleteBuyerProfile);

export default router;
