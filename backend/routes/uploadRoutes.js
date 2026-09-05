import express from 'express';
import { uploadImages } from '../controllers/uploadController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, upload.array('images', 5), uploadImages);
router.post('/single', protect, upload.single('image'), uploadImages);

export default router;
