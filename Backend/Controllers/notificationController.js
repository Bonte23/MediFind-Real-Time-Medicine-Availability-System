const db = require('../config/db');

/**
 * Get all notifications for the authenticated user
 */
exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.user_id]
    );

    const unreadCount = notifications.filter(n => !n.is_read).length;

    res.json({
      success: true,
      unread_count: unreadCount,
      data: notifications.map(n => ({
        ...n,
        is_read: Boolean(n.is_read)
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark single notification as read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.execute('UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?', [id, req.user.user_id]);

    res.json({
      success: true,
      message: 'Notification marked as read.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all user notifications as read
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    await db.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.user_id]);

    res.json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a notification
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM notifications WHERE notification_id = ? AND user_id = ?', [id, req.user.user_id]);

    res.json({
      success: true,
      message: 'Notification deleted.'
    });
  } catch (error) {
    next(error);
  }
};
