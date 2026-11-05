import { Router } from 'express';
import {
  submitFeedback,
  getPublicFeedbacks,
} from '../controllers/feedbackController.js';
import {
  feedbackRateLimiter,
  checkIpCooldown,
  checkHoneypot,
} from '../middleware/feedbackAntiSpam.js';

const router = Router();

router.post(
  '/',
  feedbackRateLimiter,
  checkIpCooldown,
  checkHoneypot,
  submitFeedback
);

router.get('/', getPublicFeedbacks);

export default router;
