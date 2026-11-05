export const notFoundMiddleware = (req, _res, next) => {
  const error = new Error('API route not found');
  error.statusCode = 404;
  next(error);
};
