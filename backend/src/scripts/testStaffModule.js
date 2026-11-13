import mongoose from 'mongoose';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import staffRoutes from '../routes/staffRoutes.js';
import Staff from '../models/Staff.js';
import Admin from '../models/Admin.js';
import { encryptAadhaar, decryptAadhaar, maskAadhaar } from '../utils/cryptoUtils.js';

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
  console.log('🧪 TESTING STAFF MANAGEMENT MODULE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Connect to DB for tests
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('  Database connected for testing.');

  // Create mock admin for JWT authentication
  const mockAdminEmail = `testadmin_${Date.now()}@example.com`;
  const mockAdmin = await Admin.create({
    name: 'Test Admin',
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
  app.use('/api/admin/staff', staffRoutes);

  // Quick helper to make local mock requests without starting a network port
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
    // 1. Unauthorized Access Test
    console.log('\n--- 1. Security & Authentication Checks ---');
    const unauthRes = await makeRequest('GET', '/api/admin/staff');
    assert(unauthRes.status === 401, 'Unauthenticated GET /api/admin/staff is rejected with 401');

    const unauthPost = await makeRequest('POST', '/api/admin/staff', { name: 'Unauthorized' });
    assert(unauthPost.status === 401, 'Unauthenticated POST /api/admin/staff is rejected with 401');

    // 2. Encryption / Decryption unit checks
    console.log('\n--- 2. Aadhaar Encryption & Masking Checks ---');
    const rawAadhaar = '987654321098';
    const cipher = encryptAadhaar(rawAadhaar);
    assert(cipher.includes(':') && cipher.split(':').length === 3, 'Aadhaar cipher has IV:AuthTag:Ciphertext format');
    assert(decryptAadhaar(cipher) === rawAadhaar, 'AES-256-GCM decrypts back to original Aadhaar');
    assert(maskAadhaar('1098') === 'XXXX-XXXX-1098', 'Aadhaar masking properly formats last 4 digits');

    // 3. Validation checks
    console.log('\n--- 3. Input Validation Checks ---');
    const authHeaders = { Authorization: `Bearer ${validToken}` };

    const invalidMobileRes = await makeRequest(
      'POST',
      '/api/admin/staff',
      {
        name: 'Anita Roy',
        address: 'Rampurhat Bharsala',
        mobileNumber: '12345', // invalid
        aadhaarNumber: '123456789012',
        staffId: `STF-TEST-${Date.now()}`,
        age: 32,
        gender: 'Female',
      },
      authHeaders
    );
    assert(invalidMobileRes.status === 400, 'Invalid mobile number (not 10 digits) returns 400');

    const invalidAadhaarRes = await makeRequest(
      'POST',
      '/api/admin/staff',
      {
        name: 'Anita Roy',
        address: 'Rampurhat Bharsala',
        mobileNumber: '9876543210',
        aadhaarNumber: '1234', // invalid
        staffId: `STF-TEST-${Date.now()}`,
        age: 32,
        gender: 'Female',
      },
      authHeaders
    );
    assert(invalidAadhaarRes.status === 400, 'Invalid Aadhaar (not 12 digits) returns 400');

    const invalidAgeRes = await makeRequest(
      'POST',
      '/api/admin/staff',
      {
        name: 'Anita Roy',
        address: 'Rampurhat Bharsala',
        mobileNumber: '9876543210',
        aadhaarNumber: '123456789012',
        staffId: `STF-TEST-${Date.now()}`,
        age: 15, // under 18
        gender: 'Female',
      },
      authHeaders
    );
    assert(invalidAgeRes.status === 400, 'Invalid age (< 18) returns 400');

    // 4. Create Staff
    console.log('\n--- 4. Staff Creation & Non-Leakage of Sensitive Data ---');
    const uniqueStaffId = `STF-${Date.now().toString().slice(-4)}`;
    const createRes = await makeRequest(
      'POST',
      '/api/admin/staff',
      {
        name: 'Kalyani Das',
        address: 'Bharsala, Near BLRO Office, Rampurhat',
        mobileNumber: '9832109876',
        aadhaarNumber: '5566 7788 9900',
        staffId: uniqueStaffId,
        age: 36,
        gender: 'Female',
      },
      authHeaders
    );

    assert(createRes.status === 201, 'Create staff returns 201 Created');
    assert(createRes.data?.data?.aadhaarMasked === 'XXXX-XXXX-9900', 'Create response returns masked Aadhaar: XXXX-XXXX-9900');
    assert(createRes.data?.data?.aadhaarNumber === undefined, 'Raw/cipher Aadhaar is NEVER returned in response');
    const createdId = createRes.data?.data?.id || createRes.data?.data?._id;

    // Verify directly in MongoDB that Aadhaar is encrypted
    const dbRecord = await Staff.findById(createdId).select('+aadhaarNumber');
    assert(dbRecord.aadhaarNumber.includes(':'), 'Database stores AES-256-GCM cipher string, not plaintext');
    assert(decryptAadhaar(dbRecord.aadhaarNumber) === '556677889900', 'Encrypted DB record decrypts to original Aadhaar');

    // 5. Duplicate Staff ID Check
    console.log('\n--- 5. Duplicate Staff ID Rejection ---');
    const dupRes = await makeRequest(
      'POST',
      '/api/admin/staff',
      {
        name: 'Another Staff',
        address: 'Rampurhat Village',
        mobileNumber: '9123456780',
        aadhaarNumber: '998877665544',
        staffId: uniqueStaffId, // duplicate
        age: 28,
        gender: 'Female',
      },
      authHeaders
    );
    assert(dupRes.status === 409, 'Duplicate staffId is rejected with 409 Conflict');

    // 6. Get All Staff with Pagination & Search
    console.log('\n--- 6. Staff List, Search & Pagination ---');
    const listRes = await makeRequest('GET', '/api/admin/staff?page=1&limit=10', null, authHeaders);
    assert(listRes.status === 200, 'GET /api/admin/staff returns 200 OK');
    assert(Array.isArray(listRes.data?.data), 'Response data contains staff array');
    assert(listRes.data?.pagination?.total >= 1, 'Pagination reflects total count');
    assert(listRes.data?.stats?.totalStaff >= 1, 'Summary stats returns totalStaff count');
    assert(listRes.data?.data[0].aadhaarNumber === undefined, 'List items omit aadhaarNumber');
    assert(typeof listRes.data?.data[0].aadhaarMasked === 'string', 'List items have aadhaarMasked');

    // Search query test
    const searchRes = await makeRequest(
      'GET',
      `/api/admin/staff?search=${encodeURIComponent('Kalyani')}`,
      null,
      authHeaders
    );
    assert(searchRes.status === 200, 'Search query returns 200 OK');
    assert(
      searchRes.data?.data?.some((s) => s.staffId === uniqueStaffId),
      'Search finds created staff by name'
    );

    // 7. Get Single Staff
    console.log('\n--- 7. Get Individual Staff ---');
    const getSingleRes = await makeRequest('GET', `/api/admin/staff/${createdId}`, null, authHeaders);
    assert(getSingleRes.status === 200, 'GET /api/admin/staff/:id returns 200 OK');
    assert(getSingleRes.data?.data?.name === 'Kalyani Das', 'Individual staff name matches');
    assert(getSingleRes.data?.data?.aadhaarMasked === 'XXXX-XXXX-9900', 'Individual staff has masked Aadhaar');

    // 8. Update Staff
    console.log('\n--- 8. Update Staff Details ---');
    const updateRes = await makeRequest(
      'PUT',
      `/api/admin/staff/${createdId}`,
      {
        name: 'Kalyani Das (Senior Aya)',
        address: 'Rampurhat Bharsala, Ward 5',
        mobileNumber: '9832109877',
      },
      authHeaders
    );
    assert(updateRes.status === 200, 'PUT /api/admin/staff/:id returns 200 OK');
    assert(updateRes.data?.data?.name === 'Kalyani Das (Senior Aya)', 'Updated name is saved');
    assert(updateRes.data?.data?.mobileNumber === '9832109877', 'Updated mobile number is saved');

    // 9. Delete Staff
    console.log('\n--- 9. Delete Staff Record ---');
    const deleteRes = await makeRequest('DELETE', `/api/admin/staff/${createdId}`, null, authHeaders);
    assert(deleteRes.status === 200, 'DELETE /api/admin/staff/:id returns 200 OK');

    const verifyDeleted = await makeRequest('GET', `/api/admin/staff/${createdId}`, null, authHeaders);
    assert(verifyDeleted.status === 404, 'Deleted staff is no longer found (404)');

    // Clean up mock admin
    await Admin.findByIdAndDelete(mockAdmin._id);
  } finally {
    await mongoose.disconnect();
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (allPassed) {
    console.log('✅ ALL STAFF MANAGEMENT UNIT & INTEGRATION TESTS PASSED!');
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

