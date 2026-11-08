import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import Admin from '../models/Admin.js';

export const authMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.admin_token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

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
