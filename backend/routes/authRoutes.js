import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { registerValidationRules, loginValidationRules } from '../validators/authValidator.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerValidationRules, registerUser);
router.post('/login', loginValidationRules, loginUser);
router.get('/me', protect, getMe);

export default router;
