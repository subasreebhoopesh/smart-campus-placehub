const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Simple in-memory notification storage (for testing)
// In production, this would use MongoDB
let notifications = [];

// Get all notifications for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    console.log('GET /notifications - User ID:', userId);
    console.log('GET /notifications - Total notifications in memory:', notifications.length);
    
    // Log all recipient IDs for debugging
    if (notifications.length > 0) {
      console.log('GET /notifications - Sample recipient IDs:', notifications.slice(0, 3).map(n => n.recipientId));
    }
    
    const userNotifications = notifications.filter(n => n.recipientId === userId);
    console.log('GET /notifications - User notifications found:', userNotifications.length);
    
    if (userNotifications.length > 0) {
      console.log('GET /notifications - Sample notification:', JSON.stringify(userNotifications[0], null, 2));
    }
    
    const unreadCount = userNotifications.filter(n => !n.isRead).length;
    console.log('GET /notifications - Unread count:', unreadCount);
    
    res.json({
      success: true,
      notifications: userNotifications,
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
    const userId = req.user.id.toString();
    const userNotifications = notifications.filter(n => n.recipientId === userId);
    const unreadCount = userNotifications.filter(n => !n.isRead).length;
    
    res.json({ success: true, unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch unread count' });
  }
});

// Mark notification as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const notification = notifications.find(n => n._id === req.params.id && n.recipientId === userId);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    notification.isRead = true;
    notification.readAt = new Date();
    
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    notifications.forEach(n => {
      if (n.recipientId === userId && !n.isRead) {
        n.isRead = true;
        n.readAt = new Date();
      }
    });
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const index = notifications.findIndex(n => n._id === req.params.id && n.recipientId === userId);
    
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    notifications.splice(index, 1);
    
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
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

    // Get all users from database
    const User = require('../models/User');
    const query = targetRole && targetRole !== 'all' ? { role: targetRole } : {};
    const users = await User.find(query).select('_id role');

    console.log(`Broadcasting to ${users.length} users with role: ${targetRole || 'all'}`);

    // Create notifications for each user
    let count = 0;
    users.forEach(user => {
      const recipientId = user._id.toString();
      const notification = {
        _id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        recipientId: recipientId,
        recipientRole: user.role,
        senderId: req.user.id,
        senderRole: 'admin',
        title,
        message,
        type: type || 'system',
        priority: priority || 'medium',
        isRead: false,
        createdAt: new Date(),
        readAt: null
      };
      notifications.push(notification);
      console.log(`Created notification for user ${recipientId} (${user.role})`);
      count++;
    });

    console.log(`Created ${count} notifications`);
    console.log('Sample notification:', notifications[notifications.length - 1]);

    res.json({
      success: true,
      message: `Notification broadcast to ${count} user(s)`,
      count
    });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({ success: false, message: 'Failed to broadcast notification' });
  }
});

module.exports = router;
