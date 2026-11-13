import mongoose from 'mongoose';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import notificationRoutes from '../routes/notificationRoutes.js';
import Notification from '../models/Notification.js';
import Admin from '../models/Admin.js';
import {
  createNotification,
  getRecentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notificationService.js';

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
  console.log('🧪 TESTING NOTIFICATION & RECENT ACTIVITY SYSTEM');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('  Database connected for testing.');

  const mockAdminEmail = `admin_notif_${Date.now()}@example.com`;
  const mockAdmin = await Admin.create({
    name: 'Notification Tester',
    email: mockAdminEmail,
    password: 'Password123!',
    isActive: true,
  });

  const validToken = jwt.sign({ id: mockAdmin._id, email: mockAdmin.email }, config.JWT_SECRET, {
    expiresIn: '1h',
  });

  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/admin/notifications', notificationRoutes);

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

  try {
    // 1. Auth check
    console.log('\n--- 1. Authentication Security ---');
    const unauth = await makeRequest('GET', '/api/admin/notifications');
    assert(unauth.status === 401, 'Unauthenticated request to /notifications is rejected with 401');

    const authHeaders = { Authorization: `Bearer ${validToken}` };

    // 2. Activity generation
    console.log('\n--- 2. Create Real Activity Notifications ---');
    const n1 = await createNotification({
      title: 'New Staff Added',
      message: 'Staff member "Sunita Mondal" (ID: STF-88) was registered.',
      type: 'staff',
      action: 'staff_added',
      link: '/staff',
    });
    assert(Boolean(n1?._id), 'Staff added notification persisted to MongoDB');

    const n2 = await createNotification({
      title: 'New Customer Feedback Received',
      message: 'Rina Mukherjee submitted a 5-star feedback review.',
      type: 'feedback',
      action: 'feedback_received',
      link: '/feedback',
    });
    assert(Boolean(n2?._id), 'Feedback received notification persisted to MongoDB');

    const n3 = await createNotification({
      title: 'New Booking Received',
      message: 'Booking request from Amit Das for Newborn Baby Care.',
      type: 'booking',
      action: 'booking_received',
      link: '/bookings',
    });
    assert(Boolean(n3?._id), 'Booking received notification persisted to MongoDB');

    // 3. Query notifications
    console.log('\n--- 3. Fetching Notifications & Unread Count ---');
    const listRes = await makeRequest('GET', '/api/admin/notifications?limit=10', null, authHeaders);
    assert(listRes.status === 200, 'GET /api/admin/notifications returns 200 OK');
    assert(Array.isArray(listRes.data?.data), 'Notifications data is an array');
    assert(listRes.data?.unreadCount >= 3, 'Unread count reflects new unread activities');
    assert(listRes.data?.data[0].title === 'New Booking Received', 'Newest notification is first in list');

    // 4. Mark single as read
    console.log('\n--- 4. Mark Single Notification as Read ---');
    const readRes = await makeRequest('PATCH', `/api/admin/notifications/${n3._id}/read`, null, authHeaders);
    assert(readRes.status === 200, 'PATCH /:id/read returns 200 OK');
    const updatedN3 = await Notification.findById(n3._id);
    assert(updatedN3.isRead === true, 'Notification isRead is updated to true in MongoDB');

    // 5. Mark all as read
    console.log('\n--- 5. Mark All Notifications as Read ---');
    const readAllRes = await makeRequest('PATCH', '/api/admin/notifications/read-all', null, authHeaders);
    assert(readAllRes.status === 200, 'PATCH /read-all returns 200 OK');
    const remainingUnread = await Notification.countDocuments({ isRead: false });
    assert(remainingUnread === 0, 'Remaining unread count is 0 after markAllRead');

    // Clean up
    await Notification.deleteMany({ _id: { $in: [n1._id, n2._id, n3._id] } });
    await Admin.findByIdAndDelete(mockAdmin._id);
  } finally {
    await mongoose.disconnect();
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (allPassed) {
    console.log('✅ ALL NOTIFICATION SYSTEM INTEGRATION TESTS PASSED!');
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

