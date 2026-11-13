import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    clientName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Customer name cannot exceed 100 characters'],
      index: true,
    },
    clientPhone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true,
    },
    service: {
      type: String,
      required: [true, 'Care service is required'],
      trim: true,
      index: true,
    },
    startDate: {
      type: String, // YYYY-MM-DD
      required: [true, 'Start date is required'],
      index: true,
    },
    durationDays: {
      type: Number,
      required: [true, 'Duration in days is required'],
      min: [1, 'Duration must be at least 1 day'],
      default: 1,
    },
    endDate: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    timeSlot: {
      type: String,
      default: 'Full Day (24 Hours)',
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Service address is required'],
      trim: true,
      minlength: [5, 'Address must be at least 5 characters'],
    },
    requirements: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'In Progress', 'Completed', 'Cancelled'],
        message: '{VALUE} is not a valid booking status',
      },
      default: 'Pending',
      index: true,
    },
    // Reference to current assigned Staff
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      default: null,
      index: true,
    },
    // Historical snapshot of assigned staff at time of assignment
    assignedStaffSnapshot: {
      staffId: { type: String, default: '' },
      name: { type: String, default: '' },
      mobileNumber: { type: String, default: '' },
      gender: { type: String, default: '' },
    },
    assignmentDate: {
      type: Date,
      default: null,
    },
    assignedByAdmin: {
      adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
      name: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    approvalDate: {
      type: Date,
      default: null,
    },
    // Complete audit trail of booking status changes
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: String, default: 'System' },
        note: { type: String, default: '' },
      },
    ],
    // Complete audit trail of staff assignments & reassignments
    assignmentHistory: [
      {
        staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
        staffId: { type: String, default: '' },
        staffName: { type: String, default: '' },
        staffMobile: { type: String, default: '' },
        assignedAt: { type: Date, default: Date.now },
        assignedBy: { type: String, default: 'Admin' },
        reason: { type: String, default: 'Initial Assignment' },
      },
    ],
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for fast searching and filtering
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ service: 1, createdAt: -1 });
bookingSchema.index({ assignedStaff: 1, status: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
