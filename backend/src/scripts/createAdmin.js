/**
 * scripts/createAdmin.js
 *
 * One-time admin seeding script. Run via:
 *   npm run create-admin
 *
 * Reads credentials from environment variables:
 *   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
 *
 * Will NOT create a duplicate admin if one already exists with the same email.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';

const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

const run = async () => {
  if (!MONGODB_URI) {
    console.error('[CREATE-ADMIN] MONGODB_URI is not set. Check your .env file.');
    process.exit(1);
  }
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('[CREATE-ADMIN] ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must all be set in .env.');
    process.exit(1);
  }

  console.log('[CREATE-ADMIN] Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
  });
  console.log('[CREATE-ADMIN] Connected.');

  const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();
  const existing = await Admin.findOne({ email: normalizedEmail });

  if (existing) {
    existing.name = ADMIN_NAME.trim();
    existing.password = ADMIN_PASSWORD;
    await existing.save();
    console.log(`[CREATE-ADMIN] ✅ Admin "${normalizedEmail}" password updated from .env successfully.`);
    await mongoose.connection.close();
    process.exit(0);
  }

  await Admin.create({
    name: ADMIN_NAME.trim(),
    email: normalizedEmail,
    password: ADMIN_PASSWORD, // hashed by pre-save hook in Admin model
  });

  console.log(`[CREATE-ADMIN] ✅ Admin "${ADMIN_NAME.trim()}" created successfully.`);
  console.log(`[CREATE-ADMIN] Email: ${normalizedEmail}`);

  await mongoose.connection.close();
  console.log('[CREATE-ADMIN] Disconnected. Done.');
  process.exit(0);
};

run().catch((err) => {
  console.error('[CREATE-ADMIN] Unexpected error:', err.message);
  process.exit(1);
});
