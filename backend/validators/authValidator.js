import { body } from 'express-validator';
import { validateRequest } from '../middleware/validationMiddleware.js';

export const registerValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('role')
    .optional()
    .isIn(['farmer', 'buyer'])
    .withMessage('Role must be either farmer or buyer'),
  validateRequest,
];

export const loginValidationRules = [
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateRequest,
];
