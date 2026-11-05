import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import Admin from '../models/Admin.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.admin_token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};
