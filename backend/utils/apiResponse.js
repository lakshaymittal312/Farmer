export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, extraProps = {}) => {
  const response = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...extraProps,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (res, statusCode = 500, message = 'Internal server error', errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors !== null && { errors }),
  };
  return res.status(statusCode).json(response);
};
