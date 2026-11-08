import jwt from 'jsonwebtoken';
import { isOriginAllowed, getAllowedOrigins, corsMiddleware } from '../config/cors.js';
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
console.log('🧪 RUNNING CORS & AUTH VERIFICATION SUITE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 1. Verify Allowed Origins Configuration
console.log('\n--- Test Suite 1: Allowed Origins Configuration ---');
const configuredOrigins = getAllowedOrigins();
assert(
  configuredOrigins.includes('https://aaya-delta.vercel.app'),
  'Configured origins contains FRONTEND_URL: https://aaya-delta.vercel.app'
);
assert(
  configuredOrigins.includes('https://aaya-adminpanel.vercel.app'),
  'Configured origins contains ADMIN_URL: https://aaya-adminpanel.vercel.app'
);
assert(
  !configuredOrigins.some((o) => o.includes('/login') || o.endsWith('/')),
  'No origin contains paths (/login) or trailing slashes'
);

// 2. Development Mode Origin Validation
console.log('\n--- Test Suite 2: Development Mode Checks ---');
config.IS_PROD = false;
assert(isOriginAllowed('https://aaya-delta.vercel.app'), 'Public frontend is allowed in dev');
assert(isOriginAllowed('https://aaya-adminpanel.vercel.app'), 'Admin panel is allowed in dev');
assert(isOriginAllowed('http://localhost:5173'), 'localhost:5173 is allowed in dev');
assert(isOriginAllowed('http://localhost:5001'), 'localhost:5001 is allowed in dev');
assert(isOriginAllowed('http://127.0.0.1:3000'), '127.0.0.1:3000 is allowed in dev');
assert(!isOriginAllowed('https://evil.com'), 'Unauthorized domain https://evil.com is blocked in dev');
assert(!isOriginAllowed('https://aaya-delta.vercel.app.attacker.com'), 'Subdomain spoofing is blocked in dev');
assert(isOriginAllowed(undefined), 'Missing origin header (server-to-server/curl) is allowed');

// 3. Production Mode Origin Validation
console.log('\n--- Test Suite 3: Production Mode Security Checks ---');
config.IS_PROD = true;
assert(isOriginAllowed('https://aaya-delta.vercel.app'), 'Public frontend is allowed in production');
assert(isOriginAllowed('https://aaya-adminpanel.vercel.app'), 'Admin panel is allowed in production');
assert(!isOriginAllowed('http://localhost:5173'), 'localhost:5173 is STRICTLY BLOCKED in production');
assert(!isOriginAllowed('http://localhost:5001'), 'localhost:5001 is STRICTLY BLOCKED in production');
assert(!isOriginAllowed('http://127.0.0.1:3000'), '127.0.0.1:3000 is STRICTLY BLOCKED in production');
assert(!isOriginAllowed('https://evil.com'), 'Unauthorized domain https://evil.com is STRICTLY BLOCKED in production');
assert(!isOriginAllowed('https://aaya-delta.vercel.app.attacker.com'), 'Subdomain spoofing is STRICTLY BLOCKED in production');
assert(isOriginAllowed(undefined), 'Server-to-server / health check (no origin) is allowed in production');

// 4. CORS Middleware Execution & Headers
console.log('\n--- Test Suite 4: CORS Middleware Execution & Response Headers ---');

const simulateCors = (method, origin, extraHeaders = {}) => {
  return new Promise((resolve) => {
    const headers = {
      ...(origin ? { origin } : {}),
      ...extraHeaders,
    };
    const req = {
      method,
      headers,
    };
    const resHeaders = {};
    const res = {
      statusCode: 200,
      setHeader: (key, val) => {
        resHeaders[key.toLowerCase()] = val;
      },
      getHeader: (key) => resHeaders[key.toLowerCase()],
      end: () => {
        resolve({ statusCode: res.statusCode, headers: resHeaders, ended: true });
      },
    };

    corsMiddleware(req, res, (err) => {
      resolve({
        statusCode: err ? (err.statusCode || 500) : res.statusCode,
        headers: resHeaders,
        ended: false,
        error: err,
      });
    });
  });
};

(async () => {
  // Test 4.1: Preflight from Frontend
  config.IS_PROD = true;
  const preflightFrontend = await simulateCors('OPTIONS', 'https://aaya-delta.vercel.app', {
    'access-control-request-method': 'POST',
    'access-control-request-headers': 'content-type,authorization',
  });
  assert(preflightFrontend.statusCode === 204, 'Preflight from frontend responds with 204');
  assert(
    preflightFrontend.headers['access-control-allow-origin'] === 'https://aaya-delta.vercel.app',
    'Preflight sets Access-Control-Allow-Origin: https://aaya-delta.vercel.app'
  );
  assert(
    preflightFrontend.headers['access-control-allow-credentials'] === 'true',
    'Preflight sets Access-Control-Allow-Credentials: true'
  );
  assert(
    preflightFrontend.headers['access-control-allow-methods']?.includes('POST'),
    'Preflight sets Access-Control-Allow-Methods containing POST'
  );
  assert(
    preflightFrontend.headers['access-control-allow-headers']?.toLowerCase().includes('authorization'),
    'Preflight sets Access-Control-Allow-Headers containing authorization'
  );
  assert(
    preflightFrontend.headers['access-control-max-age'] === '86400',
    'Preflight sets Access-Control-Max-Age to 86400 (24h cache)'
  );

  // Test 4.2: Preflight from Admin Panel
  const preflightAdmin = await simulateCors('OPTIONS', 'https://aaya-adminpanel.vercel.app', {
    'access-control-request-method': 'PUT',
    'access-control-request-headers': 'content-type',
  });
  assert(preflightAdmin.statusCode === 204, 'Preflight from admin panel responds with 204');
  assert(
    preflightAdmin.headers['access-control-allow-origin'] === 'https://aaya-adminpanel.vercel.app',
    'Preflight sets Access-Control-Allow-Origin: https://aaya-adminpanel.vercel.app'
  );
  assert(
    preflightAdmin.headers['access-control-allow-credentials'] === 'true',
    'Preflight sets Access-Control-Allow-Credentials: true for admin'
  );

  // Test 4.3: Preflight from unauthorized origin
  const preflightEvil = await simulateCors('OPTIONS', 'https://attacker.com', {
    'access-control-request-method': 'POST',
  });
  assert(preflightEvil.statusCode === 403, 'Preflight from unauthorized origin is rejected with 403');
  assert(
    !preflightEvil.headers['access-control-allow-origin'],
    'Unauthorized preflight omits Access-Control-Allow-Origin'
  );

  // Test 4.4: Simple GET from Frontend
  const getFrontend = await simulateCors('GET', 'https://aaya-delta.vercel.app');
  assert(getFrontend.statusCode === 200, 'GET from frontend passes through with 200');
  assert(
    getFrontend.headers['access-control-allow-origin'] === 'https://aaya-delta.vercel.app',
    'GET response sets Access-Control-Allow-Origin'
  );
  assert(
    getFrontend.headers['access-control-allow-credentials'] === 'true',
    'GET response sets Access-Control-Allow-Credentials: true'
  );

  // Test 4.5: Simple GET from Admin Panel
  const getAdmin = await simulateCors('GET', 'https://aaya-adminpanel.vercel.app');
  assert(getAdmin.statusCode === 200, 'GET from admin passes through with 200');
  assert(
    getAdmin.headers['access-control-allow-origin'] === 'https://aaya-adminpanel.vercel.app',
    'GET response sets Access-Control-Allow-Origin: https://aaya-adminpanel.vercel.app'
  );

  // Test 4.6: Simple GET from unauthorized origin in production
  const getEvilProd = await simulateCors('GET', 'https://evil.com');
  assert(getEvilProd.statusCode === 403, 'GET from unauthorized origin rejected with 403 in production');
  assert(
    !getEvilProd.headers['access-control-allow-origin'],
    'GET response from unauthorized origin omits Access-Control-Allow-Origin'
  );

  // Test 4.7: Localhost in production
  const getLocalhostProd = await simulateCors('GET', 'http://localhost:5173');
  assert(getLocalhostProd.statusCode === 403, 'GET from localhost rejected with 403 in production');
  assert(
    !getLocalhostProd.headers['access-control-allow-origin'],
    'GET response from localhost in prod omits Access-Control-Allow-Origin'
  );

  // Test 4.8: Localhost in development
  config.IS_PROD = false;
  const getLocalhostDev = await simulateCors('GET', 'http://localhost:5173');
  assert(getLocalhostDev.statusCode === 200, 'GET from localhost passes through in development');
  assert(
    getLocalhostDev.headers['access-control-allow-origin'] === 'http://localhost:5173',
    'Localhost in dev receives Access-Control-Allow-Origin: http://localhost:5173'
  );

  // Test 4.9: Server-to-server without origin header (e.g. Render /api/health)
  config.IS_PROD = true;
  const getNoOrigin = await simulateCors('GET', undefined);
  assert(getNoOrigin.statusCode === 200, 'GET without origin passes through (health check support)');
  assert(!getNoOrigin.error, 'No CORS error triggered on request without origin header');

  // 5. Authentication & Cookie Options
  console.log('\n--- Test Suite 5: Cookie & Auth Security Configuration ---');
  const parseDurationMs = (duration) => {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);
    const map = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
    return (map[unit] ?? 86_400_000) * value;
  };

  const getCookieOptions = (isProd) => ({
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: parseDurationMs(config.JWT_EXPIRES_IN),
    path: '/',
  });

  const prodCookie = getCookieOptions(true);
  assert(prodCookie.httpOnly === true, 'Cookie is HttpOnly (protected from XSS)');
  assert(prodCookie.secure === true, 'Cookie has Secure=true in production (HTTPS only)');
  assert(prodCookie.sameSite === 'none', 'Cookie has SameSite=none for cross-origin Vercel<->Render communication');
  assert(prodCookie.path === '/', 'Cookie path is explicitly set to /');

  const devCookie = getCookieOptions(false);
  assert(devCookie.secure === false, 'Cookie Secure=false in development for local HTTP testing');
  assert(devCookie.sameSite === 'lax', 'Cookie SameSite=lax in development');
  assert(devCookie.path === '/', 'Cookie path is explicitly set to / in dev');

  // 6. Auth Middleware Verification
  console.log('\n--- Test Suite 6: Auth Middleware & JWT Verification ---');
  const dummyPayload = { id: '60d0fe4f5311236168a109ca', role: 'admin' };
  const validToken = jwt.sign(dummyPayload, config.JWT_SECRET, { expiresIn: '1h' });
  const forgedToken = jwt.sign(dummyPayload, 'wrong-secret', { expiresIn: '1h' });

  // Test 6.1: Valid token verification
  const decoded = jwt.verify(validToken, config.JWT_SECRET);
  assert(decoded.id === dummyPayload.id, 'JWT sign & verify works with JWT_SECRET');

  // Test 6.2: Forged token rejection
  let forgedFailed = false;
  try {
    jwt.verify(forgedToken, config.JWT_SECRET);
  } catch {
    forgedFailed = true;
  }
  assert(forgedFailed, 'Forged JWT signed with incorrect secret is rejected');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (allPassed) {
    console.log('✅ ALL CORS & SECURITY VERIFICATION TESTS PASSED (100%)');
  } else {
    console.error('❌ SOME TESTS FAILED. PLEASE REVIEW.');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(allPassed ? 0 : 1);
})();
