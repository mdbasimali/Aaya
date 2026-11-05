import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  mediaType: {
    type: String,
    enum: { values: ['image', 'video'], message: 'mediaType must be "image" or "video"' },
    required: [true, 'mediaType is required'],
  },
  mediaUrl: {
    type: String,
    required: [true, 'mediaUrl is required'],
    trim: true,
  },
  thumbnailUrl: {
    type: String,
    trim: true,
  },
  // Cloudinary tracking — required for uploaded assets, optional for legacy URL-only records
  cloudinaryPublicId: {
    type: String,
    trim: true,
  },
  resourceType: {
    type: String,
    enum: ['image', 'video'],
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

gallerySchema.index({ mediaType: 1 });
gallerySchema.index({ isActive: 1, createdAt: -1 });

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;
