import mongoose from 'mongoose';

const safeUri = (uri = '') => {
  try {
    const parsed = new URL(uri);
    if (parsed.password) {
      parsed.password = '***';
      parsed.username = '***';
    }
    return parsed.toString();
  } catch {
    return uri.replace(/:\/\/[^@]+@/, '://***@');
  }
};

mongoose.connection.on('connected',    () => console.log('[DB] Connected.'));
mongoose.connection.on('error',    (err) => console.error(`[DB] Error: ${err.message}`));
mongoose.connection.on('disconnected', () => console.warn('[DB] Disconnected.'));
mongoose.connection.on('reconnected',  () => console.log('[DB] Reconnected.'));

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined. Add it to your .env file.');

  console.log(`[DB] Connecting to ${safeUri(uri)} ...`);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
  });
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.connection.close();
  console.log('[DB] Connection closed.');
};

export const getDBStatus = () => {
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  return states[mongoose.connection.readyState] ?? 'unknown';
};
