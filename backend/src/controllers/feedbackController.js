import mongoose from 'mongoose';
import Feedback from '../models/Feedback.js';
import {
  getClientIp,
  recordIpCooldown,
  isSpamContent,
  normalizeFeedbackMessage,
} from '../middleware/feedbackAntiSpam.js';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const parsePagination = (query, defaultLimit = 6, maxLimit = 50) => {
  const page  = Math.max(1, parseInt(query.page, 10)  || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};

// ── Public: Submit Feedback ──────────────────────────────────────────────────

export const submitFeedback = async (req, res, next) => {
  try {
    const { name, rating, message } = req.body;

    // 1. Name validation
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 100 characters.',
      });
    }

    // 2. Rating validation
    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.',
      });
    }

    // 3. Message validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Feedback message is required.' });
    }
    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 5 || trimmedMessage.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Feedback message must be between 5 and 1000 characters.',
      });
    }

    // 4. Basic spam content check
    if (isSpamContent(trimmedMessage)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid feedback message.',
      });
    }

    // 5. Duplicate feedback check (within past 24 hours)
    const normalized = normalizeFeedbackMessage(trimmedMessage);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const duplicate = await Feedback.findOne({
      normalizedMessage: normalized,
      createdAt: { $gte: oneDayAgo },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'This feedback has already been submitted.',
      });
    }

    // 6. Save feedback (isApproved is ALWAYS false for new submissions)
    await Feedback.create({
      name: trimmedName,
      rating: numRating,
      message: trimmedMessage,
      normalizedMessage: normalized,
      isApproved: false,
    });

    // 7. Enforce IP cooldown
    const clientIp = getClientIp(req);
    recordIpCooldown(clientIp);

    return res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
    });
  } catch (err) {
    next(err);
  }
};

// ── Public: Get Approved Feedbacks ───────────────────────────────────────────

export const getPublicFeedbacks = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, 6, 50);
    const filter = { isApproved: true };

    const [data, total] = await Promise.all([
      Feedback.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('name rating message createdAt'),
      Feedback.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Admin: Get Feedbacks (all, pending, approved) ────────────────────────────

export const getAdminFeedbacks = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, 20, 100);
    const { status = 'all' } = req.query;

    const filter = {};
    if (status === 'pending')  filter.isApproved = false;
    if (status === 'approved') filter.isApproved = true;

    const [data, total] = await Promise.all([
      Feedback.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-normalizedMessage -__v'),
      Feedback.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Admin: Update Approval Status ───────────────────────────────────────────

export const updateFeedbackStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid feedback ID.' });
    }

    const { isApproved } = req.body;
    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isApproved must be a boolean (true or false).',
      });
    }

    const updated = await Feedback.findByIdAndUpdate(
      id,
      { isApproved, updatedAt: Date.now() },
      { new: true }
    ).select('-normalizedMessage -__v');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Feedback not found.' });
    }

    return res.status(200).json({
      success: true,
      message: isApproved ? 'Feedback approved.' : 'Feedback hidden.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// ── Admin: Permanent Delete ─────────────────────────────────────────────────

export const deleteFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid feedback ID.' });
    }

    const deleted = await Feedback.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Feedback not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Feedback deleted permanently.',
    });
  } catch (err) {
    next(err);
  }
};
