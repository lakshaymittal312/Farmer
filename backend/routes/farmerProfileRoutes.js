import express from 'express';
import {
  createFarmerProfile,
  getLoggedInFarmerProfile,
  getFarmerProfileById,
  updateFarmerProfile,
  updateVerificationStatus,
  deleteFarmerProfile,
  getVerifiedFarmers,
} from '../controllers/farmerProfileController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Specific routes MUST come before parameterized routes (e.g. /verified, /me before /:id)
router.post('/', protect, createFarmerProfile);
router.get('/me', protect, getLoggedInFarmerProfile);
router.get('/verified', getVerifiedFarmers);
router.put('/me', protect, updateFarmerProfile);
router.delete('/me', protect, deleteFarmerProfile);

// Admin-only route for verification status
router.patch('/:id/verification-status', protect, authorize('admin'), updateVerificationStatus);

// Parameterized routes
router.get('/:id', getFarmerProfileById);
router.put('/:id', protect, updateFarmerProfile);
router.delete('/:id', protect, deleteFarmerProfile);

export default router;
