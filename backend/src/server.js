import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
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

const allowedOrigins = [
  config.CLIENT_URL,
  config.ADMIN_URL,
  'http://localhost:5173',
  'http://localhost:5001',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn(`[CORS] Rejected origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(requestLogger);
app.use('/api', globalApiLimiter);

app.use('/api/health', healthRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(config.PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`  🚀 Aaya Care API`);
      console.log(`  Env          : ${config.NODE_ENV}`);
      console.log(`  Listening    : http://localhost:${config.PORT}`);
      console.log(`  Allowed origins: ${allowedOrigins.join(', ')}`);
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
