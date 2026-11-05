import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';
import { uploadLimiter } from '../middleware/rateLimitMiddleware.js';
import {
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  getAdminGalleryItems,
} from '../controllers/galleryController.js';
import {
  getAdminFeedbacks,
  updateFeedbackStatus,
  deleteFeedback,
} from '../controllers/feedbackController.js';

const router = Router();

// Temporary auth smoke-test — remove when admin panel is ready
router.get('/test', authMiddleware, (_req, res) => {
  res.status(200).json({ success: true, message: 'Admin authentication is working' });
});

// Gallery admin routes — all protected by authMiddleware
// POST uses upload rate limiter + multer middleware (multipart/form-data)
router.post('/gallery', authMiddleware, uploadLimiter, uploadSingle, createGalleryItem);
router.get('/gallery', authMiddleware, getAdminGalleryItems);
router.put('/gallery/:id', authMiddleware, uploadLimiter, uploadSingle, updateGalleryItem);
router.delete('/gallery/:id', authMiddleware, deleteGalleryItem);

// Feedback admin routes — all protected by authMiddleware
router.get('/feedback', authMiddleware, getAdminFeedbacks);
router.put('/feedback/:id/status', authMiddleware, updateFeedbackStatus);
router.delete('/feedback/:id', authMiddleware, deleteFeedback);

export default router;
