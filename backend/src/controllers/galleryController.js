import mongoose from 'mongoose';
import Gallery from '../models/Gallery.js';
import { uploadImage, uploadVideo, deleteAsset, deleteMedia } from '../services/cloudinaryService.js';
import { isImageType, isVideoType } from '../middleware/uploadMiddleware.js';
import { config } from '../config/env.js';
import { createNotification } from '../services/notificationService.js';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const parsePagination = (query, defaultLimit = 12, maxLimit = 50) => {
  const page  = Math.max(1, parseInt(query.page, 10)  || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};

const safeData = (item) => ({
  id:                 item._id,
  title:              item.title,
  description:        item.description,
  mediaType:          item.mediaType,
  mediaUrl:           item.mediaUrl,
  thumbnailUrl:       item.thumbnailUrl,
  isActive:           item.isActive,
  createdAt:          item.createdAt,
  updatedAt:          item.updatedAt,
});

// ── Public ────────────────────────────────────────────────────────────────────

export const getGalleryItems = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = { isActive: true };

    const [data, total] = await Promise.all([
      Gallery.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-__v -cloudinaryPublicId -resourceType'),
      Gallery.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

export const getGalleryItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid gallery item ID.' });

    const item = await Gallery.findOne({ _id: id, isActive: true }).select('-__v -cloudinaryPublicId -resourceType');
    if (!item) return res.status(404).json({ success: false, message: 'Gallery item not found.' });

    return res.status(200).json({ success: true, data: item });
  } catch (err) { next(err); }
};

// ── Admin: Create with file upload ───────────────────────────────────────────

export const createGalleryItem = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    // Require a file
    if (!file) {
      return res.status(400).json({ success: false, message: 'A file is required.' });
    }

    // Validate text fields
    if (title && title.length > 150) {
      return res.status(400).json({ success: false, message: 'Title cannot exceed 150 characters.' });
    }
    if (description && description.length > 500) {
      return res.status(400).json({ success: false, message: 'Description cannot exceed 500 characters.' });
    }

    // Determine type from MIME — never trust the client
    let mediaType;
    if (isImageType(file.mimetype)) {
      if (file.size > config.IMAGE_MAX_SIZE_BYTES) {
        return res.status(413).json({ success: false, message: `Image too large. Maximum: ${config.IMAGE_MAX_SIZE_MB} MB.` });
      }
      mediaType = 'image';
    } else if (isVideoType(file.mimetype)) {
      if (file.size > config.VIDEO_MAX_SIZE_BYTES) {
        return res.status(413).json({ success: false, message: `Video too large. Maximum: ${config.VIDEO_MAX_SIZE_MB} MB.` });
      }
      mediaType = 'video';
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported file type.' });
    }

    // Upload to Cloudinary
    let uploadResult;
    try {
      uploadResult = mediaType === 'image'
        ? await uploadImage(file.buffer)
        : await uploadVideo(file.buffer);
    } catch {
      return res.status(502).json({ success: false, message: 'File upload failed. Please try again.' });
    }

    // Derive thumbnail for videos (Cloudinary poster frame)
    const thumbnailUrl = mediaType === 'video'
      ? uploadResult.secure_url.replace(/\.[^/.]+$/, '.jpg')
      : null;

    // Save to MongoDB — if this fails, clean up Cloudinary
    let item;
    try {
      item = await Gallery.create({
        title:              title?.trim(),
        description:        description?.trim(),
        mediaType,
        mediaUrl:           uploadResult.secure_url,
        thumbnailUrl,
        cloudinaryPublicId: uploadResult.public_id,
        resourceType:       mediaType,
      });
    } catch (dbErr) {
      // Rollback: remove the uploaded asset so no orphans are left
      await deleteAsset(uploadResult.public_id, mediaType);
      return next(dbErr);
    }

    await createNotification({
      title: 'Gallery Media Added',
      message: `New ${mediaType} "${item.title || 'Untitled'}" was uploaded to the gallery.`,
      type: 'gallery',
      action: 'gallery_added',
      link: '/gallery',
      metadata: { galleryId: item._id, mediaType },
    });

    return res.status(201).json({
      success: true,
      message: 'Gallery item uploaded successfully.',
      data: safeData(item),
    });
  } catch (err) { next(err); }
};

// ── Admin: Update (with optional media replacement) ───────────────────────────

export const updateGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid gallery item ID.' });

    const existing = await Gallery.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Gallery item not found.' });

    const { title, description, isActive } = req.body;
    const file = req.file;

    if (title && title.length > 150) {
      return res.status(400).json({ success: false, message: 'Title cannot exceed 150 characters.' });
    }
    if (description && description.length > 500) {
      return res.status(400).json({ success: false, message: 'Description cannot exceed 500 characters.' });
    }

    const updates = { updatedAt: Date.now() };
    if (title       !== undefined) updates.title       = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (isActive    !== undefined) updates.isActive    = Boolean(isActive);

    let newUpload = null;

    // Handle media replacement
    if (file) {
      let newMediaType;
      if (isImageType(file.mimetype)) {
        if (file.size > config.IMAGE_MAX_SIZE_BYTES) {
          return res.status(413).json({ success: false, message: `Image too large. Maximum: ${config.IMAGE_MAX_SIZE_MB} MB.` });
        }
        newMediaType = 'image';
      } else if (isVideoType(file.mimetype)) {
        if (file.size > config.VIDEO_MAX_SIZE_BYTES) {
          return res.status(413).json({ success: false, message: `Video too large. Maximum: ${config.VIDEO_MAX_SIZE_MB} MB.` });
        }
        newMediaType = 'video';
      } else {
        return res.status(400).json({ success: false, message: 'Unsupported file type.' });
      }

      try {
        newUpload = newMediaType === 'image'
          ? await uploadImage(file.buffer)
          : await uploadVideo(file.buffer);
      } catch {
        return res.status(502).json({ success: false, message: 'File upload failed. Please try again.' });
      }

      const newThumbnailUrl = newMediaType === 'video'
        ? newUpload.secure_url.replace(/\.[^/.]+$/, '.jpg')
        : null;

      updates.mediaType          = newMediaType;
      updates.mediaUrl           = newUpload.secure_url;
      updates.thumbnailUrl       = newThumbnailUrl;
      updates.cloudinaryPublicId = newUpload.public_id;
      updates.resourceType       = newMediaType;
    }

    // Update MongoDB BEFORE deleting old Cloudinary asset
    const item = await Gallery.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-__v');
    if (!item) {
      // DB update failed — remove the just-uploaded new asset to avoid orphans
      if (newUpload) await deleteAsset(newUpload.public_id, updates.mediaType);
      return res.status(404).json({ success: false, message: 'Gallery item not found.' });
    }

    // Now safely delete the OLD Cloudinary asset (only after DB confirmed success)
    if (newUpload && existing.cloudinaryPublicId) {
      await deleteAsset(existing.cloudinaryPublicId, existing.resourceType || 'image');
    }

    await createNotification({
      title: 'Gallery Content Updated',
      message: `Gallery item "${item.title || 'Untitled'}" details or status was updated.`,
      type: 'gallery',
      action: 'gallery_updated',
      link: '/gallery',
      metadata: { galleryId: item._id },
    });

    return res.status(200).json({
      success: true,
      message: 'Gallery item updated successfully.',
      data: safeData(item),
    });
  } catch (err) { next(err); }
};

// ── Admin: Permanent delete ───────────────────────────────────────────────────

export const deleteGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid gallery item ID.' });
    }

    const item = await Gallery.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    // If Cloudinary public ID exists, delete it first
    if (item.cloudinaryPublicId) {
      try {
        const resourceType = item.resourceType || item.mediaType || 'image';
        await deleteMedia(item.cloudinaryPublicId, resourceType);
      } catch (cloudErr) {
        console.error(`[GALLERY-DELETE] Cloudinary delete failed for "${item.cloudinaryPublicId}":`, cloudErr.message);
        return res.status(500).json({
          success: false,
          message: 'Unable to delete media. Please try again.',
        });
      }
    }

    // Permanently remove from MongoDB
    try {
      await Gallery.findByIdAndDelete(id);

      await createNotification({
        title: 'Gallery Content Deleted',
        message: `Gallery media "${item.title || 'Untitled'}" was deleted permanently.`,
        type: 'gallery',
        action: 'gallery_deleted',
        link: '/gallery',
        metadata: { galleryId: id },
      });
    } catch (dbErr) {
      console.error(`[GALLERY-DELETE] MongoDB delete failed for ID "${id}":`, dbErr.message);
      return res.status(500).json({
        success: false,
        message: 'Unable to delete media. Please try again.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Media deleted permanently.',
    });
  } catch (err) {
    next(err);
  }
};

// ── Admin: List (all statuses) ────────────────────────────────────────────────

export const getAdminGalleryItems = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, 20, 100);
    const { status = 'all' } = req.query;

    const filter = {};
    if (status === 'active')   filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    const [data, total] = await Promise.all([
      Gallery.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-__v'),
      Gallery.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};
