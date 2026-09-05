import { validationResult } from 'express-validator';

// Middleware to evaluate express-validator results
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    return res.status(400).json({
      success: false,
      message: formattedErrors.map((e) => e.message).join(', '),
      errors: formattedErrors,
    });
  }
  next();
};
