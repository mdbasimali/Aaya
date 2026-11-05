export const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const status = res.statusCode;
    const level  = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';
    console.log(`[${level}] ${new Date().toISOString()} ${req.method} ${req.originalUrl} → ${status} (${Date.now() - start}ms)`);
  });
  next();
};
