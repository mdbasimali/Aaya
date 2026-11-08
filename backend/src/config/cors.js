import cors from 'cors';
import { config } from './env.js';

// Matches standard local development origins: http://localhost:<port> or http://127.0.0.1:<port>
const LOCALHOST_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

// Matches Vercel production domains and deployment/preview URLs for aaya-adminpanel and aaya-delta
const VERCEL_DEPLOYMENT_REGEX = /^https:\/\/(aaya-adminpanel|aaya-delta)(-[a-z0-9-]+)?\.vercel\.app$/i;

// Matches official custom domains and subdomains (https://reeyanshayacare.in, https://admin.reeyanshayacare.in, etc.)
const CUSTOM_DOMAINS_REGEX = /^https:\/\/(www\.|admin\.)?reeyanshayacare\.(in|info)$/i;

/**
 * Returns array of permitted production origins from configuration.
 * @returns {string[]}
 */
export const getAllowedOrigins = () => {
  return [config.FRONTEND_URL, config.ADMIN_URL].filter(Boolean);
};

/**
 * Determine whether the requesting origin is authorized.
 * @param {string|undefined} origin
 * @returns {boolean}
 */
export const isOriginAllowed = (origin) => {
  // Allow non-browser requests without an Origin header (e.g. server-to-server, curl, Render health checks)
  if (!origin) {
    return true;
  }

  const normalizedOrigin = origin.trim().replace(/\/+$/, '');
  const allowedOrigins = getAllowedOrigins();

  // Allow explicitly configured origins
  if (allowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  // Allow official custom domains
  if (CUSTOM_DOMAINS_REGEX.test(normalizedOrigin)) {
    return true;
  }

  // Allow official Vercel production and deployment/preview URLs for aaya-adminpanel & aaya-delta
  if (VERCEL_DEPLOYMENT_REGEX.test(normalizedOrigin)) {
    return true;
  }

  // In development, allow localhost / 127.0.0.1
  if (!config.IS_PROD && LOCALHOST_REGEX.test(normalizedOrigin)) {
    return true;
  }

  return false;
};

/**
 * Production-ready Express CORS configuration.
 */
export const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    const err = new Error(`Origin ${origin} is not allowed by CORS policy.`);
    err.statusCode = 403;
    return callback(err);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  optionsSuccessStatus: 204,
  maxAge: 86400, // 24-hour preflight cache
};

export const corsMiddleware = cors(corsOptions);

