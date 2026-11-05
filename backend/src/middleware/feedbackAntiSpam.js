import rateLimit from 'express-rate-limit';

// In-memory IP cooldown store (10 minutes cooldown after successful submission)
const COOLDOWN_DURATION_MS = 10 * 60 * 1000;
const ipCooldownMap = new Map();

// Periodic cleanup every 15 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamp] of ipCooldownMap.entries()) {
    if (now - timestamp > COOLDOWN_DURATION_MS) {
      ipCooldownMap.delete(ip);
    }
  }
}, 15 * 60 * 1000).unref();

export const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    '127.0.0.1'
  );
};

export const recordIpCooldown = (ip) => {
  ipCooldownMap.set(ip, Date.now());
};

// Check if IP is in cooldown
export const checkIpCooldown = (req, res, next) => {
  const ip = getClientIp(req);
  const lastTime = ipCooldownMap.get(ip);
  if (lastTime && Date.now() - lastTime < COOLDOWN_DURATION_MS) {
    return res.status(429).json({
      success: false,
      message: 'Too many feedback submissions. Please try again later.',
    });
  }
  next();
};

// 15-minute rate limiter (max 5 submissions per IP)
export const feedbackRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
  keyGenerator: (req) => getClientIp(req),
  handler(_req, res) {
    res.status(429).json({
      success: false,
      message: 'Too many feedback submissions. Please try again later.',
    });
  },
});

// Honeypot check
export const checkHoneypot = (req, res, next) => {
  const { website } = req.body;
  if (website && typeof website === 'string' && website.trim() !== '') {
    // Silently drop bot submissions without alerting the bot
    return res.status(200).json({
      success: true,
      message: 'Thank you for your feedback!',
    });
  }
  next();
};

// Basic spam content filter
export const isSpamContent = (message) => {
  if (!message || typeof message !== 'string') return true;

  // 1. Check for excessive links (> 2 links)
  const linkMatches = message.match(/https?:\/\/|www\.[a-z0-9]/gi);
  if (linkMatches && linkMatches.length > 2) {
    return true;
  }

  // 2. Check for extremely repetitive single characters (8 or more in a row)
  if (/(.)\1{7,}/i.test(message)) {
    return true;
  }

  // 3. Check for repetitive identical words in a row (e.g. "great great great great great")
  if (/\b(\w+)\s+\1\s+\1\s+\1\s+\1\b/i.test(message)) {
    return true;
  }

  return false;
};

// Helper to normalize message for duplicate detection
export const normalizeFeedbackMessage = (msg) => {
  return msg
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
};
