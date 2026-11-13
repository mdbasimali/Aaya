import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

/**
 * Global API rate limiter for general public requests.
 * - Skipped in development mode to prevent throttling during local testing.
 * - Skipped for authenticated admin requests (admin sessions are already secured by JWT).
 * - Enforces minimum 500 requests / 15 mins in production for normal public traffic.
 */
export const globalApiLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.IS_PROD ? Math.max(500, config.RATE_LIMIT_MAX) : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // 1. Skip completely in development mode
    if (!config.IS_PROD) return true;

    // 2. Skip for authenticated admin users so dashboard management is never throttled
    if (req.headers.authorization?.startsWith('Bearer ') || req.cookies?.admin_token) {
      return true;
    }

    return false;
  },
  handler(_req, res) {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please wait a few minutes and try again.',
    });
  },
});

/**
 * Strict rate limiter for Admin Login attempts (prevents brute-force attacks)
 */
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler(_req, res) {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please wait 15 minutes before trying again.',
    });
  },
});

/**
 * Media upload rate limiter
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler(_req, res) {
    res.status(429).json({
      success: false,
      message: 'Too many upload requests. Please try again later.',
    });
  },
});
