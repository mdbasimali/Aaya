import { config } from '../config/env.js';

// eslint-disable-next-line no-unused-vars
export const errorMiddleware = (err, req, res, next) => {
  const statusCode =
    typeof err.statusCode === 'number' && err.statusCode >= 400
      ? err.statusCode
      : 500;

  const publicMessage =
    statusCode < 500
      ? err.message || 'An error occurred.'
      : config.IS_PROD
        ? 'Something went wrong. Please try again later.'
        : err.message || 'Internal Server Error';

  if (statusCode >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} → ${statusCode}`, err);
  } else {
    console.warn(`[WARN] ${req.method} ${req.originalUrl} → ${statusCode}: ${err.message}`);
  }

  const body = { success: false, message: publicMessage };
  if (!config.IS_PROD && err.stack) body.stack = err.stack;

  res.status(statusCode).json(body);
};
