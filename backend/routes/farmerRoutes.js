import express from 'express';
import {
  createFarmerProfile,
  getLoggedInFarmerProfile,
  updateFarmerProfile,
  getFarmerDashboardStats,
} from '../controllers/farmerProfileController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('farmer'));

router.post('/profile', createFarmerProfile);
router.get('/profile', getLoggedInFarmerProfile);
router.put('/profile', updateFarmerProfile);
router.get('/dashboard-stats', getFarmerDashboardStats);

export default router;
