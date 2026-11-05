import multer from 'multer';
import { config } from '../config/env.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(new Error('Unsupported file type. Allowed: JPEG, PNG, WebP, MP4, WebM, MOV.'), {
        statusCode: 400,
      })
    );
  }
};

// Use the larger of the two limits as the hard cap — per-type validation in the controller
const MAX_UPLOAD_BYTES = config.VIDEO_MAX_SIZE_BYTES;

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

// Wraps multer to convert its errors into clean 400/413 responses
const handleMulterError = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (!err) return next();

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: `File too large. Maximum allowed: images ${config.IMAGE_MAX_SIZE_MB} MB, videos ${config.VIDEO_MAX_SIZE_MB} MB.`,
      });
    }
    if (err.statusCode === 400) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  });
};

export const uploadSingle = handleMulterError(upload.single('file'));

export const isImageType = (mimetype) => ALLOWED_IMAGE_TYPES.includes(mimetype);
export const isVideoType = (mimetype) => ALLOWED_VIDEO_TYPES.includes(mimetype);
