import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

// @desc    Get notifications for authenticated user
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.user._id })
      .populate('relatedOrder')
      .populate('relatedProduct', 'name price images')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching notifications',
      error: error.message,
    });
  }
};

// @desc    Get unread notification count for authenticated user
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      receiver: req.user._id,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching unread notification count',
      error: error.message,
    });
  }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID format',
      });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // Ownership check
    if (notification.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify another user\'s notification',
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error marking notification as read',
      error: error.message,
    });
  }
};

// @desc    Mark all notifications for authenticated user as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { receiver: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error marking all notifications as read',
      error: error.message,
    });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID format',
      });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // Ownership check
    if (notification.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete another user\'s notification',
      });
    }

    await Notification.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error deleting notification',
      error: error.message,
    });
  }
};
