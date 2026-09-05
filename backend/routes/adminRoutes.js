import express from 'express';
import {
  getUsers,
  updateUserStatus,
  getFarmers,
  verifyFarmer,
  getBuyers,
  getAdminProducts,
  getAdminOrders,
  getAnalyticsSummary,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply protect & admin authorize to all admin routes
router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/farmers', getFarmers);
router.put('/farmers/:id/verify', verifyFarmer);
router.patch('/farmers/:id/verify', verifyFarmer);
router.get('/buyers', getBuyers);
router.get('/products', getAdminProducts);
router.get('/orders', getAdminOrders);
router.get('/analytics', getAnalyticsSummary);
router.get('/dashboard-stats', getAnalyticsSummary);
router.get('/reports/summary', getAnalyticsSummary);

export default router;
