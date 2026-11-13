import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createBooking,
  getOrdersOverviewStats,
  getBookings,
  getBookingById,
  getStaffAvailabilityForBooking,
  approveBookingWithStaff,
  reassignStaff,
  updateBookingStatus,
} from '../controllers/bookingController.js';

const router = Router();

// Public: Submit booking inquiry (or called by customer website modal)
router.post('/', createBooking);

// Protected Admin Routes
router.get('/stats', authMiddleware, getOrdersOverviewStats);
router.get('/', authMiddleware, getBookings);
router.get('/:id', authMiddleware, getBookingById);
router.get('/:id/staff-availability', authMiddleware, getStaffAvailabilityForBooking);
router.put('/:id/approve', authMiddleware, approveBookingWithStaff);
router.put('/:id/reassign', authMiddleware, reassignStaff);
router.put('/:id/status', authMiddleware, updateBookingStatus);

export default router;
