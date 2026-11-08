import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { config } from '../config/env.js';

const parseDurationMs = (duration) => {
  const unit = duration.slice(-1);
  const value = parseInt(duration.slice(0, -1), 10);
  const map = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return (map[unit] ?? 86_400_000) * value;
};

const getCookieOptions = (req) => {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https' || config.IS_PROD;
  return {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    maxAge: parseDurationMs(config.JWT_EXPIRES_IN),
    path: '/',
  };
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Fetch admin — explicitly include password for comparison
    const admin = await Admin.findOne({ email: normalizedEmail }).select('+password');

    // Always run bcrypt compare to prevent timing attacks (even if no admin found)
    const dummyHash = '$2b$12$invalidhashusedtopreventimingtimingattacks00000000000';
    const isMatch = admin
      ? await admin.comparePassword(password)
      : await import('bcryptjs').then((b) => b.default.compare(password, dummyHash));

    if (!admin || !isMatch || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: admin._id, role: admin.role }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    });

    res.cookie('admin_token', token, getCookieOptions(req));

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token, // Return token for cross-origin SPAs (works across all browsers including Brave & Safari)
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https' || config.IS_PROD;
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    path: '/',
  });
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getMe = (req, res) => {
  const { _id, name, email, role } = req.admin;
  return res.status(200).json({
    success: true,
    admin: { id: _id, name, email, role },
  });
};
