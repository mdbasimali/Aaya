import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    message: {
      type: String,
      required: [true, 'Feedback message is required'],
      trim: true,
      minlength: [5, 'Feedback message must be at least 5 characters'],
      maxlength: [1000, 'Feedback message cannot exceed 1000 characters'],
    },
    normalizedMessage: {
      type: String,
      required: true,
      select: false,
      index: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
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
  },
  {
    timestamps: true,
  }
);

// Compound index for fast approved listing and duplicate search
feedbackSchema.index({ isApproved: 1, createdAt: -1 });
feedbackSchema.index({ normalizedMessage: 1, createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
