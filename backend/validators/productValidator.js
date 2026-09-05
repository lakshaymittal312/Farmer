import { body } from 'express-validator';
import { validateRequest } from '../middleware/validationMiddleware.js';

export const productValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  body('category')
    .isMongoId()
    .withMessage('Valid category ID is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('unit')
    .isIn(['kg', 'quintal', 'dozen', 'piece', 'litre'])
    .withMessage('Invalid unit'),
  body('quantityAvailable')
    .isFloat({ min: 0 })
    .withMessage('Quantity available must be a non-negative number'),
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one image URL is required'),
  validateRequest,
];
