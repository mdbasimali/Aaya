import mongoose from 'mongoose';
import Staff from '../models/Staff.js';
import { encryptAadhaar } from '../utils/cryptoUtils.js';
import { createNotification } from '../services/notificationService.js';

// Helper to sanitize and validate 10-digit Indian mobile number
const isValidMobile = (mobile) => /^[6-9]\d{9}$/.test(String(mobile).trim());

// Helper to validate 12-digit numeric Aadhaar
const isValidAadhaar = (aadhaar) => /^\d{12}$/.test(String(aadhaar).replace(/[\s-]/g, ''));

/**
 * @desc    Create a new staff member
 * @route   POST /api/admin/staff
 * @access  Private (Admin)
 */
export const createStaff = async (req, res, next) => {
  try {
    const { name, address, mobileNumber, aadhaarNumber, staffId, age, gender } = req.body;

    // 1. Basic validation
    if (!name || !address || !mobileNumber || !aadhaarNumber || !staffId || age === undefined || !gender) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Name, Address, Mobile Number, Aadhaar Number, Staff ID, Age, Gender) are required.',
      });
    }

    const trimmedName = String(name).trim();
    const trimmedAddress = String(address).trim();
    const trimmedMobile = String(mobileNumber).trim();
    const trimmedStaffId = String(staffId).trim().toUpperCase();
    const cleanAadhaar = String(aadhaarNumber).replace(/[\s-]/g, '');
    const numAge = Number(age);
    const validGenders = ['Male', 'Female', 'Other'];

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 100 characters long.',
      });
    }

    if (trimmedAddress.length < 5 || trimmedAddress.length > 300) {
      return res.status(400).json({
        success: false,
        message: 'Address must be between 5 and 300 characters long.',
      });
    }

    if (!isValidMobile(trimmedMobile)) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number must be a valid 10-digit Indian phone number starting with 6-9.',
      });
    }

    if (!isValidAadhaar(cleanAadhaar)) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar card number must be exactly 12 numeric digits.',
      });
    }

    if (trimmedStaffId.length < 2 || trimmedStaffId.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Staff ID must be between 2 and 20 alphanumeric characters.',
      });
    }

    if (Number.isNaN(numAge) || numAge < 18 || numAge > 100) {
      return res.status(400).json({
        success: false,
        message: 'Age must be a valid number between 18 and 100.',
      });
    }

    if (!validGenders.includes(gender)) {
      return res.status(400).json({
        success: false,
        message: 'Gender must be one of: Male, Female, Other.',
      });
    }

    // 2. Check for duplicate staff ID
    const existingStaff = await Staff.findOne({ staffId: trimmedStaffId });
    if (existingStaff) {
      return res.status(409).json({
        success: false,
        message: `Staff ID "${trimmedStaffId}" is already assigned to another staff member. Please use a unique ID.`,
      });
    }

    // 3. Encrypt sensitive Aadhaar number securely
    const encryptedAadhaar = encryptAadhaar(cleanAadhaar);
    const aadhaarLast4 = cleanAadhaar.slice(-4);

    // 4. Create and save new staff record
    const newStaff = await Staff.create({
      name: trimmedName,
      address: trimmedAddress,
      mobileNumber: trimmedMobile,
      aadhaarNumber: encryptedAadhaar,
      aadhaarLast4,
      staffId: trimmedStaffId,
      age: numAge,
      gender,
    });

    // Auto-create real activity notification
    await createNotification({
      title: 'New Staff Added',
      message: `Staff member "${newStaff.name}" (ID: ${newStaff.staffId}) was registered.`,
      type: 'staff',
      action: 'staff_added',
      link: '/staff',
      metadata: { staffId: newStaff.staffId, id: newStaff._id },
    });

    return res.status(201).json({
      success: true,
      message: 'Staff member added successfully.',
      data: newStaff.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all staff members with pagination, search, and overview statistics
 * @route   GET /api/admin/staff
 * @access  Private (Admin)
 */
export const getAllStaff = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '10', 10)));
    const search = req.query.search ? String(req.query.search).trim() : '';

    const filter = {};
    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { name: searchRegex },
        { staffId: searchRegex },
        { mobileNumber: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    const [staffList, totalFiltered, overallCounts] = await Promise.all([
      Staff.find(filter)
        .select('-aadhaarNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      Staff.countDocuments(filter),
      Staff.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            female: { $sum: { $cond: [{ $eq: ['$gender', 'Female'] }, 1, 0] } },
            male: { $sum: { $cond: [{ $eq: ['$gender', 'Male'] }, 1, 0] } },
            other: { $sum: { $cond: [{ $eq: ['$gender', 'Other'] }, 1, 0] } },
          },
        },
      ]),
    ]);

    // Ensure virtuals (like aadhaarMasked) are present in lean response
    const sanitizedStaffList = staffList.map((item) => ({
      ...item,
      id: item._id,
      aadhaarMasked: item.aadhaarLast4 ? `XXXX-XXXX-${item.aadhaarLast4}` : 'XXXX-XXXX-XXXX',
    }));

    const stats = overallCounts[0] || {
      total: 0,
      female: 0,
      male: 0,
      other: 0,
    };

    return res.status(200).json({
      success: true,
      data: sanitizedStaffList,
      pagination: {
        total: totalFiltered,
        page,
        limit,
        totalPages: Math.ceil(totalFiltered / limit) || 1,
        hasNextPage: page < Math.ceil(totalFiltered / limit),
        hasPrevPage: page > 1,
      },
      stats: {
        totalStaff: stats.total,
        femaleStaff: stats.female,
        maleStaff: stats.male,
        otherStaff: stats.other,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single staff member by ID
 * @route   GET /api/admin/staff/:id
 * @access  Private (Admin)
 */
export const getStaffById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff record ID format.',
      });
    }

    const staff = await Staff.findById(id).select('-aadhaarNumber');
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: staff.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a staff member's details
 * @route   PUT /api/admin/staff/:id
 * @access  Private (Admin)
 */
export const updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff record ID format.',
      });
    }

    const staff = await Staff.findById(id).select('+aadhaarNumber');
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found.',
      });
    }

    const { name, address, mobileNumber, aadhaarNumber, staffId, age, gender } = req.body;

    // Check staffId uniqueness if updated
    if (staffId) {
      const trimmedStaffId = String(staffId).trim().toUpperCase();
      if (trimmedStaffId !== staff.staffId) {
        if (trimmedStaffId.length < 2 || trimmedStaffId.length > 20) {
          return res.status(400).json({
            success: false,
            message: 'Staff ID must be between 2 and 20 alphanumeric characters.',
          });
        }
        const duplicate = await Staff.findOne({ staffId: trimmedStaffId, _id: { $ne: id } });
        if (duplicate) {
          return res.status(409).json({
            success: false,
            message: `Staff ID "${trimmedStaffId}" is already assigned to another staff member.`,
          });
        }
        staff.staffId = trimmedStaffId;
      }
    }

    if (name) {
      const trimmedName = String(name).trim();
      if (trimmedName.length < 2 || trimmedName.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Name must be between 2 and 100 characters long.',
        });
      }
      staff.name = trimmedName;
    }

    if (address) {
      const trimmedAddress = String(address).trim();
      if (trimmedAddress.length < 5 || trimmedAddress.length > 300) {
        return res.status(400).json({
          success: false,
          message: 'Address must be between 5 and 300 characters long.',
        });
      }
      staff.address = trimmedAddress;
    }

    if (mobileNumber) {
      const trimmedMobile = String(mobileNumber).trim();
      if (!isValidMobile(trimmedMobile)) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number must be a valid 10-digit Indian phone number starting with 6-9.',
        });
      }
      staff.mobileNumber = trimmedMobile;
    }

    if (age !== undefined) {
      const numAge = Number(age);
      if (Number.isNaN(numAge) || numAge < 18 || numAge > 100) {
        return res.status(400).json({
          success: false,
          message: 'Age must be a valid number between 18 and 100.',
        });
      }
      staff.age = numAge;
    }

    if (gender) {
      const validGenders = ['Male', 'Female', 'Other'];
      if (!validGenders.includes(gender)) {
        return res.status(400).json({
          success: false,
          message: 'Gender must be one of: Male, Female, Other.',
        });
      }
      staff.gender = gender;
    }

    // If a new 12-digit Aadhaar number is provided (not masked), re-encrypt it
    if (aadhaarNumber) {
      const cleanAadhaar = String(aadhaarNumber).replace(/[\s-]/g, '');
      // Only update if not already masked (i.e. contains full digits)
      if (!cleanAadhaar.includes('X') && !cleanAadhaar.includes('*')) {
        if (!isValidAadhaar(cleanAadhaar)) {
          return res.status(400).json({
            success: false,
            message: 'Aadhaar card number must be exactly 12 numeric digits.',
          });
        }
        staff.aadhaarNumber = encryptAadhaar(cleanAadhaar);
        staff.aadhaarLast4 = cleanAadhaar.slice(-4);
      }
    }

    await staff.save();

    await createNotification({
      title: 'Staff Information Updated',
      message: `Staff record "${staff.name}" (ID: ${staff.staffId}) was updated.`,
      type: 'staff',
      action: 'staff_updated',
      link: '/staff',
      metadata: { staffId: staff.staffId, id: staff._id },
    });

    return res.status(200).json({
      success: true,
      message: 'Staff member updated successfully.',
      data: staff.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a staff member
 * @route   DELETE /api/admin/staff/:id
 * @access  Private (Admin)
 */
export const deleteStaff = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff record ID format.',
      });
    }

    const staff = await Staff.findByIdAndDelete(id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found.',
      });
    }

    await createNotification({
      title: 'Staff Deleted',
      message: `Staff member "${staff.name}" (ID: ${staff.staffId}) was removed.`,
      type: 'staff',
      action: 'staff_deleted',
      link: '/staff',
      metadata: { staffId: staff.staffId },
    });

    return res.status(200).json({
      success: true,
      message: `Staff member "${staff.name}" (ID: ${staff.staffId}) deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

