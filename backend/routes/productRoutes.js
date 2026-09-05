import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router
  .route('/')
  .post(protect, authorize('farmer'), createProduct)
  .get(getProducts);

router.patch('/:id/status', protect, authorize('farmer'), toggleProductStatus);

router
  .route('/:id')
  .get(getProductById)
  .put(protect, authorize('farmer'), updateProduct)
  .delete(protect, authorize('farmer'), deleteProduct);

export default router;
