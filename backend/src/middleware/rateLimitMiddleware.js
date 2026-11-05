import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

export const globalApiLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler(_req, res) {
    res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
  },
});

export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler(_req, res) {
    res.status(429).json({ success: false, message: 'Too many login attempts. Please try again later.' });
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler(_req, res) {
    res.status(429).json({ success: false, message: 'Too many upload requests. Please try again later.' });
  },
});
