import express from 'express';
import {
  checkout,
  getOrders,
  getBuyerOrders,
  getFarmerOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  acceptOrder,
  rejectOrder,
  processOrder,
  shipOrder,
  deliverOrder,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply protection to all order routes
router.use(protect);

router
  .route('/')
  .post(authorize('buyer'), checkout)
  .get(getOrders);

router.get('/my-orders', authorize('buyer'), getBuyerOrders);
router.get('/farmer', authorize('farmer'), getFarmerOrders);
router.get('/:id', getOrderById);

router.put('/:id/status', updateOrderStatus);
router.patch('/:id/cancel', authorize('buyer'), cancelOrder);
router.patch('/:id/accept', authorize('farmer'), acceptOrder);
router.patch('/:id/reject', authorize('farmer'), rejectOrder);
router.patch('/:id/process', authorize('farmer'), processOrder);
router.patch('/:id/ship', authorize('farmer'), shipOrder);
router.patch('/:id/deliver', authorize('farmer', 'admin'), deliverOrder);

export default router;
