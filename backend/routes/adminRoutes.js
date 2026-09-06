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
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
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
router.get('/reports', getAnalyticsSummary);
router.get('/reports/summary', getAnalyticsSummary);

// Category Management Routes for Admin
router.route('/categories')
  .get(getCategories)
  .post(createCategory);

router.route('/categories/:id')
  .get(getCategoryById)
  .put(updateCategory)
  .delete(deleteCategory);

export default router;
