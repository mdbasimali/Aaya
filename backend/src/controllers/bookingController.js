import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Staff from '../models/Staff.js';
import { createNotification } from '../services/notificationService.js';

// ── Timezone Helper (Asia/Kolkata) ──────────────────────────────────────────
const getKolkataDateStrings = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const todayStr = formatter.format(now); // "YYYY-MM-DD"
  const currentYear = parseInt(todayStr.split('-')[0], 10);
  const currentMonth = parseInt(todayStr.split('-')[1], 10);

  return { todayStr, currentYear, currentMonth };
};

// Helper to compute end date given start date (YYYY-MM-DD) and duration in days
const calculateEndDate = (startDateStr, durationDays) => {
  const parts = startDateStr.split('-');
  const start = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const end = new Date(start);
  end.setDate(start.getDate() + Math.max(1, Number(durationDays)) - 1);

  const y = end.getFullYear();
  const m = String(end.getMonth() + 1).padStart(2, '0');
  const d = String(end.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Generate clean unique Booking ID: e.g. "RAC-BK-2611-9482"
const generateBookingId = () => {
  const dateCode = new Date().toISOString().slice(2, 7).replace('-', '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RAC-BK-${dateCode}-${rand}`;
};

/**
 * @desc    Submit a new customer booking (Public or Admin)
 * @route   POST /api/bookings
 * @access  Public
 */
export const createBooking = async (req, res, next) => {
  try {
    const {
      clientName,
      clientPhone,
      service,
      startDate,
      durationDays = 1,
      timeSlot = 'Full Day (24 Hours)',
      address,
      requirements = '',
      notes = '',
    } = req.body;

    if (!clientName || !clientPhone || !service || !startDate || !address) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone number, service, start date, and address are required.',
      });
    }

    const trimmedPhone = String(clientPhone).replace(/[\s\-().+]/g, '');
    const numDays = Math.max(1, parseInt(durationDays, 10) || 1);
    const trimmedStartDate = String(startDate).trim();
    const endDateStr = calculateEndDate(trimmedStartDate, numDays);
    const bookingId = generateBookingId();

    const booking = await Booking.create({
      bookingId,
      clientName: String(clientName).trim(),
      clientPhone: trimmedPhone,
      service: String(service).trim(),
      startDate: trimmedStartDate,
      durationDays: numDays,
      endDate: endDateStr,
      timeSlot: String(timeSlot || 'Full Day (24 Hours)').trim(),
      address: String(address).trim(),
      requirements: String(requirements || '').trim(),
      notes: String(notes || '').trim(),
      status: 'Pending',
      statusHistory: [
        {
          status: 'Pending',
          changedAt: new Date(),
          changedBy: 'Customer',
          note: 'Booking requested via website',
        },
      ],
    });

    // Auto-create real activity notification for Admin Dashboard
    await createNotification({
      title: 'New Booking Received',
      message: `Booking #${booking.bookingId} from ${booking.clientName} for ${booking.service} (Starting: ${booking.startDate}).`,
      type: 'booking',
      action: 'booking_received',
      link: '/bookings',
      metadata: { bookingId: booking.bookingId, id: booking._id },
    });

    return res.status(201).json({
      success: true,
      message: 'Booking submitted successfully.',
      data: booking.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order overview statistics in Asia/Kolkata timezone
 * @route   GET /api/bookings/stats
 * @access  Private (Admin)
 */
export const getOrdersOverviewStats = async (req, res, next) => {
  try {
    const { todayStr, currentYear, currentMonth } = getKolkataDateStrings();
    const requestedYear = parseInt(req.query.year, 10) || currentYear;
    const requestedMonth = parseInt(req.query.month, 10) || currentMonth;

    // ISO prefix for month: "YYYY-MM"
    const monthPrefix = `${requestedYear}-${String(requestedMonth).padStart(2, '0')}`;

    const [
      allCounts,
      todayCount,
      monthlyCount,
    ] = await Promise.all([
      Booking.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      // Today in Kolkata timezone based on creation date or start date
      Booking.countDocuments({
        createdAt: {
          $gte: new Date(`${todayStr}T00:00:00+05:30`),
          $lte: new Date(`${todayStr}T23:59:59+05:30`),
        },
      }),
      // Monthly count
      Booking.countDocuments({
        createdAt: {
          $gte: new Date(`${monthPrefix}-01T00:00:00+05:30`),
          $lte: new Date(`${requestedYear}-${String(requestedMonth).padStart(2, '0')}-31T23:59:59+05:30`),
        },
      }),
    ]);

    const statusMap = {
      Pending: 0,
      Approved: 0,
      'In Progress': 0,
      Completed: 0,
      Cancelled: 0,
    };

    let totalOrders = 0;
    allCounts.forEach((c) => {
      if (statusMap[c._id] !== undefined) {
        statusMap[c._id] = c.count;
      }
      totalOrders += c.count;
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        todayOrders: todayCount,
        monthlyOrders: monthlyCount,
        pendingOrders: statusMap.Pending,
        approvedOrders: statusMap.Approved,
        inProgressOrders: statusMap['In Progress'],
        completedOrders: statusMap.Completed,
        cancelledOrders: statusMap.Cancelled,
        month: requestedMonth,
        year: requestedYear,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders with pagination, search, status, and tab filters
 * @route   GET /api/bookings
 * @access  Private (Admin)
 */
export const getBookings = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '10', 10)));
    const { tab, search, service, status, date, month, year } = req.query;

    const filter = {};
    const { todayStr, currentYear, currentMonth } = getKolkataDateStrings();

    // Tab-based primary filtering
    if (tab === 'today') {
      filter.createdAt = {
        $gte: new Date(`${todayStr}T00:00:00+05:30`),
        $lte: new Date(`${todayStr}T23:59:59+05:30`),
      };
    } else if (tab === 'pending') {
      filter.status = 'Pending';
    } else if (tab === 'monthly') {
      const qYear = parseInt(year, 10) || currentYear;
      const qMonth = parseInt(month, 10) || currentMonth;
      const prefix = `${qYear}-${String(qMonth).padStart(2, '0')}`;
      filter.createdAt = {
        $gte: new Date(`${prefix}-01T00:00:00+05:30`),
        $lte: new Date(`${qYear}-${String(qMonth).padStart(2, '0')}-31T23:59:59+05:30`),
      };
    }

    // Specific Status filter (if not using pending tab)
    if (status && status !== 'all' && tab !== 'pending') {
      filter.status = status;
    }

    // Service filter
    if (service && service !== 'all') {
      filter.service = service;
    }

    // Date filter (matching startDate)
    if (date) {
      filter.startDate = date;
    }

    // Search query across Booking ID, Customer Name, and Phone Number
    if (search && String(search).trim()) {
      const q = String(search).trim();
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { bookingId: regex },
        { clientName: regex },
        { clientPhone: regex },
      ];
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('assignedStaff', 'name staffId mobileNumber gender age address isActive')
        .lean(),
      Booking.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: bookings.map((b) => ({ ...b, id: b._id })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get complete individual booking details
 * @route   GET /api/bookings/:id
 * @access  Private (Admin)
 */
export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = mongoose.isValidObjectId(id) ? { _id: id } : { bookingId: id.toUpperCase() };

    const booking = await Booking.findOne(query)
      .populate('assignedStaff', 'name staffId mobileNumber gender age address isActive')
      .populate('assignmentHistory.staff', 'name staffId mobileNumber');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: booking.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check staff availability for a specific booking's date range
 * @route   GET /api/bookings/:id/staff-availability
 * @access  Private (Admin)
 */
export const getStaffAvailabilityForBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const targetStart = booking.startDate;
    const targetEnd = booking.endDate;

    // Fetch all active staff members (excluding private Aadhaar)
    const staffList = await Staff.find({ isActive: { $ne: false } })
      .select('-aadhaarNumber')
      .sort({ name: 1 })
      .lean();

    // Find all active bookings that overlap with this date window
    // An active booking overlaps if: booking.startDate <= targetEnd && booking.endDate >= targetStart
    const conflictingBookings = await Booking.find({
      _id: { $ne: booking._id },
      status: { $in: ['Approved', 'In Progress'] },
      assignedStaff: { $ne: null },
      startDate: { $lte: targetEnd },
      endDate: { $gte: targetStart },
    })
      .select('bookingId clientName service startDate endDate assignedStaff')
      .lean();

    // Map conflicts by staff ID
    const conflictMap = new Map();
    conflictingBookings.forEach((cb) => {
      const staffKey = String(cb.assignedStaff);
      if (!conflictMap.has(staffKey)) {
        conflictMap.set(staffKey, []);
      }
      conflictMap.get(staffKey).push(cb);
    });

    // Check availability status for each staff
    const evaluatedStaff = staffList.map((s) => {
      const conflicts = conflictMap.get(String(s._id)) || [];
      const isAvailable = conflicts.length === 0;

      return {
        id: s._id,
        _id: s._id,
        name: s.name,
        staffId: s.staffId,
        mobileNumber: s.mobileNumber,
        gender: s.gender,
        age: s.age,
        address: s.address,
        isAvailable,
        availabilityStatus: isAvailable ? 'Available' : 'Already Assigned',
        conflicts: conflicts.map((c) => ({
          bookingId: c.bookingId,
          clientName: c.clientName,
          service: c.service,
          startDate: c.startDate,
          endDate: c.endDate,
        })),
      };
    });

    return res.status(200).json({
      success: true,
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        service: booking.service,
        clientName: booking.clientName,
        startDate: targetStart,
        endDate: targetEnd,
        durationDays: booking.durationDays,
      },
      staff: evaluatedStaff,
      totalAvailable: evaluatedStaff.filter((s) => s.isAvailable).length,
      totalStaff: evaluatedStaff.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve booking with mandatory staff assignment
 * @route   PUT /api/bookings/:id/approve
 * @access  Private (Admin)
 */
export const approveBookingWithStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { staffId } = req.body;

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: 'A staff member must be selected to approve this booking.',
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Booking cannot be approved from current status: ${booking.status}.`,
      });
    }

    // Verify staff exists and is active
    const staffQuery = mongoose.isValidObjectId(staffId)
      ? { _id: staffId }
      : { staffId: String(staffId).toUpperCase() };

    const staff = await Staff.findOne(staffQuery);
    if (!staff || staff.isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Selected staff member does not exist or is inactive.',
      });
    }

    // Verify staff availability against overlapping dates
    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      status: { $in: ['Approved', 'In Progress'] },
      assignedStaff: staff._id,
      startDate: { $lte: booking.endDate },
      endDate: { $gte: booking.startDate },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Staff member "${staff.name}" (${staff.staffId}) is already assigned to active booking #${conflict.bookingId} from ${conflict.startDate} to ${conflict.endDate}.`,
      });
    }

    const adminName = req.admin?.name || 'Admin';
    const now = new Date();

    // Assign staff and approve atomically
    booking.assignedStaff = staff._id;
    booking.assignedStaffSnapshot = {
      staffId: staff.staffId,
      name: staff.name,
      mobileNumber: staff.mobileNumber,
      gender: staff.gender,
    };
    booking.assignmentDate = now;
    booking.approvalDate = now;
    booking.assignedByAdmin = {
      adminId: req.admin?._id,
      name: adminName,
      email: req.admin?.email || '',
    };
    booking.status = 'Approved';

    booking.statusHistory.push({
      status: 'Approved',
      changedAt: now,
      changedBy: adminName,
      note: `Approved and assigned to ${staff.name} (ID: ${staff.staffId})`,
    });

    booking.assignmentHistory.push({
      staff: staff._id,
      staffId: staff.staffId,
      staffName: staff.name,
      staffMobile: staff.mobileNumber,
      assignedAt: now,
      assignedBy: adminName,
      reason: 'Initial assignment on booking approval',
    });

    await booking.save();

    // Create real activity notification
    await createNotification({
      title: 'Booking Approved',
      message: `Booking #${booking.bookingId} for ${booking.clientName} was approved and assigned to ${staff.name} (${staff.staffId}).`,
      type: 'booking',
      action: 'booking_approved',
      link: '/bookings',
      metadata: { bookingId: booking.bookingId, staffId: staff.staffId },
    });

    return res.status(200).json({
      success: true,
      message: `Booking #${booking.bookingId} successfully approved and assigned to ${staff.name}.`,
      data: booking.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reassign staff for an existing approved/in-progress booking
 * @route   PUT /api/bookings/:id/reassign
 * @access  Private (Admin)
 */
export const reassignStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { staffId, reason = 'Staff reassignment by Admin' } = req.body;

    if (!staffId) {
      return res.status(400).json({ success: false, message: 'Please select a new staff member.' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (!['Approved', 'In Progress'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Staff can only be reassigned on Approved or In Progress bookings.',
      });
    }

    const staffQuery = mongoose.isValidObjectId(staffId)
      ? { _id: staffId }
      : { staffId: String(staffId).toUpperCase() };

    const newStaff = await Staff.findOne(staffQuery);
    if (!newStaff || newStaff.isActive === false) {
      return res.status(400).json({ success: false, message: 'Selected staff member is invalid or inactive.' });
    }

    // Check availability of new staff
    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      status: { $in: ['Approved', 'In Progress'] },
      assignedStaff: newStaff._id,
      startDate: { $lte: booking.endDate },
      endDate: { $gte: booking.startDate },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Staff member "${newStaff.name}" is already assigned to active booking #${conflict.bookingId}.`,
      });
    }

    const adminName = req.admin?.name || 'Admin';
    const now = new Date();

    // Update assignment
    booking.assignedStaff = newStaff._id;
    booking.assignedStaffSnapshot = {
      staffId: newStaff.staffId,
      name: newStaff.name,
      mobileNumber: newStaff.mobileNumber,
      gender: newStaff.gender,
    };
    booking.assignmentDate = now;

    booking.assignmentHistory.push({
      staff: newStaff._id,
      staffId: newStaff.staffId,
      staffName: newStaff.name,
      staffMobile: newStaff.mobileNumber,
      assignedAt: now,
      assignedBy: adminName,
      reason: String(reason).trim(),
    });

    booking.statusHistory.push({
      status: booking.status,
      changedAt: now,
      changedBy: adminName,
      note: `Staff reassigned to ${newStaff.name} (ID: ${newStaff.staffId}). Reason: ${reason}`,
    });

    await booking.save();

    await createNotification({
      title: 'Booking Staff Reassigned',
      message: `Staff for booking #${booking.bookingId} was reassigned to ${newStaff.name} (${newStaff.staffId}).`,
      type: 'booking',
      action: 'booking_status_updated',
      link: '/bookings',
      metadata: { bookingId: booking.bookingId, staffId: newStaff.staffId },
    });

    return res.status(200).json({
      success: true,
      message: `Staff successfully reassigned to ${newStaff.name}.`,
      data: booking.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update booking status (In Progress, Completed, Cancelled)
 * @route   PUT /api/bookings/:id/status
 * @access  Private (Admin)
 */
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note = '' } = req.body;

    const validStatuses = ['In Progress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}. Use the approval endpoint for approvals.`,
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Status transition rules
    if (status === 'In Progress' && booking.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Only Approved bookings can be transitioned to In Progress.',
      });
    }

    if (status === 'Completed' && booking.status !== 'In Progress') {
      return res.status(400).json({
        success: false,
        message: 'Only In Progress bookings can be marked as Completed.',
      });
    }

    const adminName = req.admin?.name || 'Admin';
    const now = new Date();
    booking.status = status;

    booking.statusHistory.push({
      status,
      changedAt: now,
      changedBy: adminName,
      note: note || `Status updated to ${status}`,
    });

    await booking.save();

    let notifTitle = 'Booking Status Updated';
    let notifAction = 'booking_status_updated';
    if (status === 'Cancelled') {
      notifTitle = 'Booking Rejected';
      notifAction = 'booking_rejected';
    }

    await createNotification({
      title: notifTitle,
      message: `Booking #${booking.bookingId} (${booking.clientName}) was marked as ${status}.`,
      type: 'booking',
      action: notifAction,
      link: '/bookings',
      metadata: { bookingId: booking.bookingId, status },
    });

    return res.status(200).json({
      success: true,
      message: `Booking #${booking.bookingId} status updated to ${status}.`,
      data: booking.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};
