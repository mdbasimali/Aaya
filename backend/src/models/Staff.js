import mongoose from 'mongoose';
import { maskAadhaar } from '../utils/cryptoUtils.js';

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Staff full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Full address is required'],
      trim: true,
      minlength: [5, 'Address must be at least 5 characters'],
      maxlength: [300, 'Address cannot exceed 300 characters'],
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
      index: true,
    },
    // Encrypted cipher format: "ivHex:authTagHex:encryptedHex"
    // Marked select: false so it is never accidentally retrieved in general queries
    aadhaarNumber: {
      type: String,
      required: [true, 'Aadhaar card number is required'],
      select: false,
    },
    // Stored for fast masked presentation ("XXXX-XXXX-1234") and searching
    aadhaarLast4: {
      type: String,
      required: [true, 'Aadhaar last 4 digits are required'],
      trim: true,
      match: [/^\d{4}$/, 'Aadhaar last 4 must be 4 digits'],
    },
    staffId: {
      type: String,
      required: [true, 'Staff ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [2, 'Staff ID must be at least 2 characters'],
      maxlength: [20, 'Staff ID cannot exceed 20 characters'],
      index: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [18, 'Staff member must be at least 18 years old'],
      max: [100, 'Age cannot exceed 100 years'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: '{VALUE} is not a supported gender (allowed: Male, Female, Other)',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        ret.id = ret._id;
        ret.aadhaarMasked = maskAadhaar(ret.aadhaarLast4);
        delete ret.aadhaarNumber; // Strictly never expose raw/encrypted Aadhaar in JSON output
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (_doc, ret) {
        ret.id = ret._id;
        ret.aadhaarMasked = maskAadhaar(ret.aadhaarLast4);
        delete ret.aadhaarNumber;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Virtual for masked Aadhaar
staffSchema.virtual('aadhaarMasked').get(function () {
  return maskAadhaar(this.aadhaarLast4);
});

// Text or compound index for fast search queries
staffSchema.index({ name: 'text', staffId: 'text', mobileNumber: 'text' });

const Staff = mongoose.model('Staff', staffSchema);

export default Staff;

