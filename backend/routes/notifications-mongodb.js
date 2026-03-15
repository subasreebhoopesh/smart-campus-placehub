const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// Get all notifications for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user.id })
      .populate('senderId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.getUnreadCount(req.user.userId);

    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// Get unread notifications count
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const unreadCount = await Notification.getUnreadCount(req.user.id);
    res.json({ success: true, unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch unread count' });
  }
});

// Mark notification as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipientId: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await notification.markAsRead();

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user.id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipientId: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
});

// Send notification (admin/hr only)
router.post('/send', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { recipientIds, title, message, type, priority, relatedId, relatedType } = req.body;

    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Recipient IDs are required' });
    }

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const notifications = await Promise.all(
      recipientIds.map(async (recipientId) => {
        const recipient = await User.findById(recipientId);
        if (!recipient) return null;

        return await Notification.create({
          recipientId,
          recipientRole: recipient.role,
          senderId: req.user.id,
          senderRole: req.user.role,
          title,
          message,
          type: type || 'message',
          priority: priority || 'medium',
          relatedId,
          relatedType
        });
      })
    );

    const successCount = notifications.filter(n => n !== null).length;

    res.json({
      success: true,
      message: `Notification sent to ${successCount} recipient(s)`,
      count: successCount
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ success: false, message: 'Failed to send notification' });
  }
});

// Broadcast notification (admin only)
router.post('/broadcast', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { targetRole, title, message, type, priority } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const query = targetRole && targetRole !== 'all' ? { role: targetRole } : {};
    const users = await User.find(query).select('_id role');

    const notifications = await Promise.all(
      users.map(user => Notification.create({
        recipientId: user._id,
        recipientRole: user.role,
        senderId: req.user.id,
        senderRole: 'admin',
        title,
        message,
        type: type || 'system',
        priority: priority || 'medium'
      }))
    );

    res.json({
      success: true,
      message: `Notification broadcast to ${notifications.length} user(s)`,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({ success: false, message: 'Failed to broadcast notification' });
  }
});

module.exports = router;
