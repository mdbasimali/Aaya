const PORT     = parseInt(process.env.PORT || '5000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD  = NODE_ENV === 'production';

// Safely normalize origin: extracts scheme + host + port, removes path (e.g. /login) and trailing slashes
const normalizeOrigin = (urlStr) => {
  if (!urlStr || typeof urlStr !== 'string') return '';
  const trimmed = urlStr.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.origin;
  } catch {
    return trimmed.replace(/\/+$/, '');
  }
};

const rawFrontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL;
const rawAdminUrl = process.env.ADMIN_URL;

// Production validation: require FRONTEND_URL and ADMIN_URL in production
if (IS_PROD) {
  const missing = [];
  if (!rawFrontendUrl) missing.push('FRONTEND_URL');
  if (!rawAdminUrl) missing.push('ADMIN_URL');

  if (missing.length > 0) {
    console.error(`[CONFIG] Missing required production environment variable(s): ${missing.join(', ')}`);
    process.exit(1);
  }
}

const FRONTEND_URL = normalizeOrigin(rawFrontendUrl || (IS_PROD ? '' : 'http://localhost:5173'));
const ADMIN_URL    = normalizeOrigin(rawAdminUrl || (IS_PROD ? '' : 'http://localhost:5001'));

const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
const RATE_LIMIT_MAX       = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);

const JWT_SECRET     = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

if (!JWT_SECRET) {
  console.error('[CONFIG] JWT_SECRET is not defined. Add it to your .env file.');
  process.exit(1);
}

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY    = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('[CONFIG] Cloudinary credentials are not fully configured. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env.');
  process.exit(1);
}

// File size limits (MB → bytes)
const IMAGE_MAX_SIZE_MB = parseInt(process.env.IMAGE_MAX_SIZE_MB || '10', 10);
const VIDEO_MAX_SIZE_MB = parseInt(process.env.VIDEO_MAX_SIZE_MB || '100', 10);
const IMAGE_MAX_SIZE_BYTES = IMAGE_MAX_SIZE_MB * 1024 * 1024;
const VIDEO_MAX_SIZE_BYTES = VIDEO_MAX_SIZE_MB * 1024 * 1024;

export const config = {
  PORT,
  NODE_ENV,
  IS_PROD,
  FRONTEND_URL,
  CLIENT_URL: FRONTEND_URL, // backwards compatibility
  ADMIN_URL,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  IMAGE_MAX_SIZE_MB,
  VIDEO_MAX_SIZE_MB,
  IMAGE_MAX_SIZE_BYTES,
  VIDEO_MAX_SIZE_BYTES,
};
