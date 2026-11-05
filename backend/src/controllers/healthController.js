import { getDBStatus } from '../config/database.js';

export const getHealth = (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    database: getDBStatus(),
  });
};
