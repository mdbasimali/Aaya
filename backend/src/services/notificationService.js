import Notification from '../models/Notification.js';

/**
 * Creates and saves an activity notification to MongoDB
 * Failures are logged without interrupting the parent operation.
 */
export const createNotification = async ({
  title,
  message,
  type,
  action,
  link = '/dashboard',
  metadata = {},
}) => {
  try {
    const notification = await Notification.create({
      title,
      message,
      type,
      action,
      link,
      metadata,
    });
    return notification;
  } catch (error) {
    console.error('[NOTIFICATION SERVICE] Error creating activity notification:', error.message);
    return null;
  }
};

/**
 * Retrieves latest notifications with pagination and unread counts
 */
export const getRecentNotifications = async (limit = 20, page = 1) => {
  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(),
    Notification.countDocuments({ isRead: false }),
  ]);

  return {
    notifications: notifications.map((n) => ({ ...n, id: n._id })),
    total,
    unreadCount,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

/**
 * Marks a single notification as read
 */
export const markNotificationAsRead = async (id) => {
  return Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
};

/**
 * Marks all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
  return Notification.updateMany({ isRead: false }, { isRead: true });
};

