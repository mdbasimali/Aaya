import mongoose from 'mongoose';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import bookingRoutes from '../routes/bookingRoutes.js';
import Booking from '../models/Booking.js';
import Staff from '../models/Staff.js';
import Admin from '../models/Admin.js';
import Notification from '../models/Notification.js';

let allPassed = true;
const assert = (condition, description) => {
  if (condition) {
    console.log(`  [PASS] ${description}`);
  } else {
    console.error(`  [FAIL] ${description}`);
    allPassed = false;
  }
};

async function runTests() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 TESTING COMPLETE BOOKING & STAFF ASSIGNMENT SYSTEM');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('  Database connected for testing.');

  // Create mock admin
  const mockAdmin = await Admin.create({
    name: 'Booking System Admin',
    email: `booking_admin_${Date.now()}@example.com`,
    password: 'Password123!',
    isActive: true,
  });

  const validToken = jwt.sign({ id: mockAdmin._id, email: mockAdmin.email }, config.JWT_SECRET, {
    expiresIn: '1h',
  });

  const authHeaders = { Authorization: `Bearer ${validToken}` };

  // Create 2 mock staff members
  const staff1 = await Staff.create({
    name: 'Rina Mondal',
    staffId: `STF-T1-${Date.now().toString().slice(-4)}`,
    mobileNumber: '9832101111',
    aadhaarNumber: 'a1:b2:c3',
    aadhaarLast4: '1111',
    age: 30,
    gender: 'Female',
    address: 'Rampurhat Bharsala',
    isActive: true,
  });

  const staff2 = await Staff.create({
    name: 'Gopal Barman',
    staffId: `STF-T2-${Date.now().toString().slice(-4)}`,
    mobileNumber: '9832102222',
    aadhaarNumber: 'a2:b3:c4',
    aadhaarLast4: '2222',
    age: 38,
    gender: 'Male',
    address: 'Rampurhat Station Road',
    isActive: true,
  });

  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/bookings', bookingRoutes);

  const makeRequest = (method, path, body = null, headers = {}) => {
    return new Promise((resolve) => {
      const server = app.listen(0, async () => {
        const port = server.address().port;
        try {
          const fetchOptions = {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
          };
          if (body) fetchOptions.body = JSON.stringify(body);
          const res = await fetch(`http://127.0.0.1:${port}${path}`, fetchOptions);
          const data = await res.json().catch(() => null);
          server.close(() => resolve({ status: res.status, data }));
        } catch (err) {
          server.close(() => resolve({ status: 500, error: err.message }));
        }
      });
    });
  };

  let testBookingId = null;
  let testBookingDbId = null;

  try {
    // 1. Customer creates a booking
    console.log('\n--- 1. Customer Booking Flow & Unique ID Generation ---');
    const createRes = await makeRequest('POST', '/api/bookings', {
      clientName: 'Debabrata Sen',
      clientPhone: '9832109999',
      service: 'Elderly Care',
      startDate: '2026-12-01',
      durationDays: 7,
      timeSlot: 'Full Day (24 Hours)',
      address: 'Bharsala, Rampurhat, Birbhum',
      requirements: 'Requires daily walking and blood pressure monitoring',
    });

    assert(createRes.status === 201, 'POST /api/bookings returns 201 Created');
    assert(createRes.data?.data?.bookingId?.startsWith('RAC-BK-'), 'Generated unique bookingId with RAC-BK- prefix');
    assert(createRes.data?.data?.status === 'Pending', 'Initial booking status is Pending');
    assert(createRes.data?.data?.endDate === '2026-12-07', 'Calculated endDate matches startDate + durationDays');

    testBookingId = createRes.data?.data?.bookingId;
    testBookingDbId = createRes.data?.data?.id || createRes.data?.data?._id;

    // Verify activity notification was created
    const notif = await Notification.findOne({ 'metadata.bookingId': testBookingId });
    assert(Boolean(notif), 'Dynamic notification "New Booking Received" was created in MongoDB');

    // 2. Overview stats in Kolkata timezone
    console.log('\n--- 2. Order Overview Statistics in Asia/Kolkata ---');
    const statsRes = await makeRequest('GET', '/api/bookings/stats', null, authHeaders);
    assert(statsRes.status === 200, 'GET /api/bookings/stats returns 200 OK');
    assert(statsRes.data?.stats?.totalOrders >= 1, 'Total orders count is >= 1');
    assert(statsRes.data?.stats?.pendingOrders >= 1, 'Pending orders count reflects newly created booking');

    // 3. Staff Availability Evaluation
    console.log('\n--- 3. Real-Time Staff Availability Evaluation ---');
    const availRes = await makeRequest(
      'GET',
      `/api/bookings/${testBookingDbId}/staff-availability`,
      null,
      authHeaders
    );
    assert(availRes.status === 200, 'GET /staff-availability returns 200 OK');
    const availStaff1 = availRes.data?.staff?.find((s) => s.staffId === staff1.staffId);
    assert(availStaff1?.isAvailable === true, 'Staff 1 is currently Available for requested dates');

    // 4. Approval requires staff assignment
    console.log('\n--- 4. Mandatory Staff Assignment on Approval ---');
    const emptyApproveRes = await makeRequest(
      'PUT',
      `/api/bookings/${testBookingDbId}/approve`,
      {},
      authHeaders
    );
    assert(emptyApproveRes.status === 400, 'Approve without staffId is rejected with 400');

    // 5. Approve booking with staff 1
    const approveRes = await makeRequest(
      'PUT',
      `/api/bookings/${testBookingDbId}/approve`,
      { staffId: staff1._id },
      authHeaders
    );
    assert(approveRes.status === 200, 'Approve with valid staff returns 200 OK');
    assert(approveRes.data?.data?.status === 'Approved', 'Booking status transitioned to Approved');
    assert(
      approveRes.data?.data?.assignedStaffSnapshot?.staffId === staff1.staffId,
      'Staff snapshot captured staffId'
    );
    assert(
      approveRes.data?.data?.statusHistory?.length >= 2,
      'Status history recorded Pending -> Approved transition'
    );
    assert(
      approveRes.data?.data?.assignmentHistory?.length >= 1,
      'Assignment history recorded initial staff assignment'
    );

    // 6. Overlapping booking conflict prevention
    console.log('\n--- 6. Conflict Detection & Double-Assignment Prevention ---');
    // Create second booking overlapping the exact same dates: 2026-12-03 to 2026-12-05
    const secondBookingRes = await makeRequest('POST', '/api/bookings', {
      clientName: 'Second Client',
      clientPhone: '9832108888',
      service: 'Newborn Baby Care',
      startDate: '2026-12-03',
      durationDays: 3,
      address: 'Rampurhat Market Road',
    });
    const secondBookingDbId = secondBookingRes.data?.data?.id || secondBookingRes.data?.data?._id;

    // Check staff availability for second booking
    const secondAvailRes = await makeRequest(
      'GET',
      `/api/bookings/${secondBookingDbId}/staff-availability`,
      null,
      authHeaders
    );
    const staff1ForSecond = secondAvailRes.data?.staff?.find((s) => s.staffId === staff1.staffId);
    assert(staff1ForSecond?.isAvailable === false, 'Staff 1 is marked Already Assigned for overlapping dates');
    assert(staff1ForSecond?.availabilityStatus === 'Already Assigned', 'Status tag is "Already Assigned"');

    // Attempting to approve second booking with Staff 1 should return 409 Conflict
    const conflictApproveRes = await makeRequest(
      'PUT',
      `/api/bookings/${secondBookingDbId}/approve`,
      { staffId: staff1._id },
      authHeaders
    );
    assert(conflictApproveRes.status === 409, 'Attempting double-assignment returns 409 Conflict');

    // 7. Staff Reassignment
    console.log('\n--- 7. Staff Reassignment & History Preservation ---');
    const reassignRes = await makeRequest(
      'PUT',
      `/api/bookings/${testBookingDbId}/reassign`,
      { staffId: staff2._id, reason: 'Client requested male caregiver' },
      authHeaders
    );
    assert(reassignRes.status === 200, 'Reassign staff returns 200 OK');
    assert(
      reassignRes.data?.data?.assignedStaffSnapshot?.staffId === staff2.staffId,
      'Staff snapshot updated to Staff 2'
    );
    assert(
      reassignRes.data?.data?.assignmentHistory?.length === 2,
      'Assignment history preserved old Staff 1 and added Staff 2'
    );

    // 8. Status Transitions: In Progress -> Completed
    console.log('\n--- 8. Status Lifecycle Transitions ---');
    const inProgressRes = await makeRequest(
      'PUT',
      `/api/bookings/${testBookingDbId}/status`,
      { status: 'In Progress' },
      authHeaders
    );
    assert(inProgressRes.status === 200, 'Transition Approved -> In Progress returns 200 OK');

    const completedRes = await makeRequest(
      'PUT',
      `/api/bookings/${testBookingDbId}/status`,
      { status: 'Completed' },
      authHeaders
    );
    assert(completedRes.status === 200, 'Transition In Progress -> Completed returns 200 OK');

    // 9. Clean up test records
    await Booking.deleteMany({ _id: { $in: [testBookingDbId, secondBookingDbId] } });
    await Staff.deleteMany({ _id: { $in: [staff1._id, staff2._id] } });
    await Admin.findByIdAndDelete(mockAdmin._id);
  } finally {
    await mongoose.disconnect();
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (allPassed) {
    console.log('✅ ALL BOOKING & STAFF ASSIGNMENT INTEGRATION TESTS PASSED!');
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});

