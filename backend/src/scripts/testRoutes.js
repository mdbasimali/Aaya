import express from 'express';
import cookieParser from 'cookie-parser';
import healthRoutes from '../routes/healthRoutes.js';
import adminAuthRoutes from '../routes/adminAuthRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';
import galleryRoutes from '../routes/galleryRoutes.js';
import feedbackRoutes from '../routes/feedbackRoutes.js';
import { notFoundMiddleware } from '../middleware/notFoundMiddleware.js';
import { errorMiddleware } from '../middleware/errorMiddleware.js';
import { config } from '../config/env.js';

let allPassed = true;
const assert = (condition, description) => {
  if (condition) {
    console.log(`  [PASS] ${description}`);
  } else {
    console.error(`  [FAIL] ${description}`);
    allPassed = false;
  }
};

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 RUNNING ROUTE & HEALTH-CHECK VERIFICATION SUITE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());

// Replicate the exact routing in server.js
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Reeyansh Aya Care API is running',
    version: '1.0.0',
    environment: config.NODE_ENV,
    endpoints: {
      health: '/api/health',
      gallery: '/api/gallery',
      feedback: '/api/feedback',
      adminAuth: '/api/admin/auth',
      admin: '/api/admin',
    },
  });
});

app.get('/api', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Reeyansh Aya Care API v1',
    health: '/api/health',
  });
});

app.use('/api/gallery', galleryRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);

app.use('/gallery', galleryRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/admin/auth', adminAuthRoutes);
app.use('/admin', adminRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

// Helper to simulate request through the Express pipeline
const simulateRequest = (method, url, headers = {}, body = null) => {
  return new Promise((resolve) => {
    const reqHeaders = { ...headers };
    if (body) reqHeaders['content-type'] = 'application/json';

    const req = {
      method,
      url,
      originalUrl: url,
      headers: reqHeaders,
      body: body || {},
      query: {},
      socket: { remoteAddress: '127.0.0.1' },
      connection: { remoteAddress: '127.0.0.1' },
      cookies: headers.cookie
        ? Object.fromEntries(headers.cookie.split(';').map(c => c.trim().split('=')))
        : {},
    };

    let statusCode = 200;
    const resHeaders = {};
    let responseBody = null;

    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      setHeader: (k, v) => { resHeaders[k.toLowerCase()] = v; },
      getHeader: (k) => resHeaders[k.toLowerCase()],
      json: (data) => {
        responseBody = data;
        resolve({ statusCode, headers: resHeaders, body: responseBody });
      },
      send: (data) => {
        responseBody = data;
        resolve({ statusCode, headers: resHeaders, body: responseBody });
      },
      end: () => {
        resolve({ statusCode, headers: resHeaders, body: responseBody });
      },
    };

    app.handle(req, res);
  });
};

(async () => {
  // Test 1: Root endpoint (Render deployment root URL)
  console.log('\n--- Test 1: Root URL Check (Render Service Root) ---');
  const rootRes = await simulateRequest('GET', '/');
  assert(rootRes.statusCode === 200, 'GET / returns 200 OK');
  assert(rootRes.body.success === true, 'GET / body has success: true');
  assert(rootRes.body.message.includes('running'), 'GET / confirms API is running');

  // Test 2: Health check endpoints
  console.log('\n--- Test 2: Health Check Endpoints ---');
  const healthApiRes = await simulateRequest('GET', '/api/health');
  assert(healthApiRes.statusCode === 200, 'GET /api/health returns 200 OK');
  assert(healthApiRes.body.success === true, 'GET /api/health body has success: true');
  assert(healthApiRes.body.message === 'Server is healthy', 'GET /api/health confirms server is healthy');

  const healthRootRes = await simulateRequest('GET', '/health');
  assert(healthRootRes.statusCode === 200, 'GET /health returns 200 OK (Render dashboard compatible)');
  assert(healthRootRes.body.success === true, 'GET /health body has success: true');

  // Test 3: API info endpoint
  console.log('\n--- Test 3: API Info Endpoint ---');
  const apiRes = await simulateRequest('GET', '/api');
  assert(apiRes.statusCode === 200, 'GET /api returns 200 OK');
  assert(apiRes.body.success === true, 'GET /api body has success: true');

  // Test 4: Admin Auth routes mounted with /api
  console.log('\n--- Test 4: Admin Auth Route Endpoints (/api/admin/auth) ---');
  const loginMissing = await simulateRequest('POST', '/api/admin/auth/login', {}, {});
  assert(loginMissing.statusCode === 400, 'POST /api/admin/auth/login validates body (returns 400 on empty body, NOT 404)');
  assert(loginMissing.body.message.includes('Email is required'), 'Login returns expected validation error');

  const meUnauthorized = await simulateRequest('GET', '/api/admin/auth/me');
  assert(meUnauthorized.statusCode === 401, 'GET /api/admin/auth/me returns 401 Unauthorized without token (NOT 404)');

  const logoutRes = await simulateRequest('POST', '/api/admin/auth/logout');
  assert(logoutRes.statusCode === 200, 'POST /api/admin/auth/logout returns 200 OK');

  // Test 5: Fallback without /api prefix (for clients with misconfigured baseURL)
  console.log('\n--- Test 5: Non-API Fallback Routing Resilience ---');
  const fallbackLogin = await simulateRequest('POST', '/admin/auth/login', {}, {});
  assert(fallbackLogin.statusCode === 400, 'POST /admin/auth/login routes successfully without /api prefix');

  const fallbackMe = await simulateRequest('GET', '/admin/auth/me');
  assert(fallbackMe.statusCode === 401, 'GET /admin/auth/me routes successfully without /api prefix (returns 401, NOT 404)');

  // Test 6: notFoundMiddleware trigger on genuinely non-existent route
  console.log('\n--- Test 6: notFoundMiddleware Verification ---');
  const notFoundRes = await simulateRequest('GET', '/api/nonexistent-endpoint-12345');
  assert(notFoundRes.statusCode === 404, 'Unknown endpoint returns 404');
  assert(notFoundRes.body.success === false, 'Unknown endpoint has success: false');
  assert(notFoundRes.body.message === 'API route not found', 'Unknown endpoint returns "API route not found"');

  const notFoundRootRes = await simulateRequest('GET', '/random-unknown-page');
  assert(notFoundRootRes.statusCode === 404, 'Unknown root endpoint returns 404');
  assert(notFoundRootRes.body.message === 'API route not found', 'Unknown root returns "API route not found"');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (allPassed) {
    console.log('✅ ALL ROUTE & HEALTH-CHECK TESTS PASSED (100%)');
  } else {
    console.error('❌ SOME TESTS FAILED. PLEASE REVIEW.');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(allPassed ? 0 : 1);
})();
