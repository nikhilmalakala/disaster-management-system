const Notification = require('../models/Notification');

/**
 * @desc    Get all notifications for the currently logged in user
 * @route   GET /api/notifications
 * @access  Private
 * @param   {Object} req - Express request object containing authenticated user info
 * @param   {Object} res - Express response object
 * @returns {Object} JSON response with array of user notifications (limit 50)
 */
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(50);
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Mark a specific notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 * @param   {Object} req - Express request object containing notification ID in params
 * @param   {Object} res - Express response object
 * @returns {Object} JSON response with updated notification data
 */
exports.markRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Mark all unread notifications as read for the current user
 * @route   PUT /api/notifications/read-all
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} JSON response confirming action success
 */
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id }, { read: true });
    res.json({ success: true, message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
