import express from 'express';
import {
  getLoggedInBuyerProfile,
  updateBuyerProfile,
  getBuyerDashboardStats,
} from '../controllers/buyerProfileController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('buyer'));

router.get('/profile', getLoggedInBuyerProfile);
router.put('/profile', updateBuyerProfile);
router.get('/dashboard-stats', getBuyerDashboardStats);

export default router;
