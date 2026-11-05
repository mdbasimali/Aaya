export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

export const formatBytes = (bytes) => {
  if (!bytes || bytes <= 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'Please select a file.' };
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type) || file.name.toLowerCase().endsWith('.mov');

  if (!isImage && !isVideo) {
    return { valid: false, error: 'Unsupported file type.' };
  }

  if (isImage && file.size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: 'File size is too large.' };
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE_BYTES) {
    return { valid: false, error: 'File size is too large.' };
  }

  return { valid: true, mediaType: isImage ? 'image' : 'video' };
};
