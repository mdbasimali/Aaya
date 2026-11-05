import cloudinary from '../config/cloudinary.js';
import { config } from '../config/env.js';

const GALLERY_FOLDER = 'reeyansh-aya-care/gallery';

const uploadStream = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });

export const uploadImage = (buffer) =>
  uploadStream(buffer, {
    resource_type: 'image',
    folder: GALLERY_FOLDER,
    overwrite: false,
  });

export const uploadVideo = (buffer) =>
  uploadStream(buffer, {
    resource_type: 'video',
    folder: GALLERY_FOLDER,
    overwrite: false,
  });

export const deleteMedia = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  const resType = resourceType === 'video' ? 'video' : 'image';
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resType,
    invalidate: true,
  });

  // Cloudinary destroy returns { result: 'ok' } or { result: 'not found' }
  if (result.result !== 'ok' && result.result !== 'not found') {
    throw new Error(`Cloudinary delete returned unexpected status: ${result.result}`);
  }

  return result;
};

export const deleteAsset = deleteMedia;
