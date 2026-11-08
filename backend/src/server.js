import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import { corsMiddleware, getAllowedOrigins } from './config/cors.js';
import { connectDB, disconnectDB } from './config/database.js';
import { globalApiLimiter } from './middleware/rateLimitMiddleware.js';
import { notFoundMiddleware } from './middleware/notFoundMiddleware.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { requestLogger } from './middleware/requestLogger.js';
import healthRoutes from './routes/healthRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';

const app = express();
app.set('trust proxy', 1);

app.use(helmet());

app.use(corsMiddleware);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(requestLogger);

// Health check endpoints (exempt from general rate limiter for continuous monitoring & Render probes)
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);

// Root informational endpoints for Render root URL check and browser inspection
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

// Apply rate limiting to API routes
app.use('/api', globalApiLimiter);

// Primary API routes
app.use('/api/gallery', galleryRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);

// Resilient fallback aliases for clients whose base URL omits the /api prefix
app.use('/gallery', globalApiLimiter, galleryRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/admin/auth', adminAuthRoutes);
app.use('/admin', adminRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(config.PORT, () => {
      const origins = getAllowedOrigins();
      const originLog = config.IS_PROD
        ? origins.join(', ')
        : `${origins.join(', ')} (plus localhost/* in development)`;

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`  🚀 Aaya Care API`);
      console.log(`  Env          : ${config.NODE_ENV}`);
      console.log(`  Listening    : http://localhost:${config.PORT}`);
      console.log(`  Allowed origins: ${originLog}`);
      console.log(`  Health check : http://localhost:${config.PORT}/api/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  } catch (err) {
    console.error('[STARTUP] Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`\n[SHUTDOWN] ${signal} — shutting down gracefully...`);

  const forceExit = setTimeout(() => {
    console.error('[SHUTDOWN] Forced exit after 15 s.');
    process.exit(1);
  }, 15_000);
  forceExit.unref();

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    }
    await disconnectDB();
    clearTimeout(forceExit);
    process.exit(0);
  } catch (err) {
    console.error('[SHUTDOWN] Error:', err.message);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
  shutdown('uncaughtException');
});

startServer();
