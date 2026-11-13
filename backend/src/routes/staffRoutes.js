import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} from '../controllers/staffController.js';

const router = Router();

// Protect all staff management endpoints with Admin JWT authentication
router.use(authMiddleware);

router.route('/')
  .post(createStaff)
  .get(getAllStaff);

router.route('/:id')
  .get(getStaffById)
  .put(updateStaff)
  .delete(deleteStaff);

export default router;

