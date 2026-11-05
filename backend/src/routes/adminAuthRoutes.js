import { Router } from 'express';
import { login, logout, getMe } from '../controllers/adminAuthController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminLoginLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

router.post('/login', adminLoginLimiter, login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);

export default router;
