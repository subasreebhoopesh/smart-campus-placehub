const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Send message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { recipientId, subject, message, priority, relatedTo, relatedId } = req.body;

    const newMessage = new Message({
      senderId: req.user.id,
      recipientId,
      subject,
      message,
      priority: priority || 'normal',
      relatedTo: relatedTo || 'general',
      relatedId: relatedId || null,
      messageType: 'direct'
    });

    await newMessage.save();

    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Broadcast message (Admin only)
router.post('/broadcast', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { subject, message, recipientRole, priority } = req.body;

    // Get all users with specified role
    const recipients = await User.find({ role: recipientRole || 'student' });

    // Create message for each recipient
    const messages = recipients.map(recipient => ({
      senderId: req.user.id,
      recipientId: recipient._id,
      subject,
      message,
      priority: priority || 'normal',
      messageType: 'broadcast',
      relatedTo: 'general'
    }));

    await Message.insertMany(messages);

    res.json({ success: true, count: messages.length, message: 'Broadcast sent successfully' });
  } catch (error) {
    console.error('Broadcast message error:', error);
    res.status(500).json({ message: 'Failed to broadcast message' });
  }
});

// Get inbox messages
router.get('/inbox', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ recipientId: req.user.id })
      .populate('senderId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      senderName: msg.senderId?.name || 'System',
      senderEmail: msg.senderId?.email || '',
      senderRole: msg.senderId?.role || 'system',
      subject: msg.subject,
      message: msg.message,
      messageType: msg.messageType,
      isRead: msg.isRead,
      priority: msg.priority,
      relatedTo: msg.relatedTo,
      createdAt: msg.createdAt
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Get inbox error:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Get sent messages
router.get('/sent', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ senderId: req.user.id })
      .populate('recipientId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      recipientName: msg.recipientId?.name || 'Unknown',
      recipientEmail: msg.recipientId?.email || '',
      recipientRole: msg.recipientId?.role || '',
      subject: msg.subject,
      message: msg.message,
      messageType: msg.messageType,
      isRead: msg.isRead,
      priority: msg.priority,
      createdAt: msg.createdAt
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Get sent messages error:', error);
    res.status(500).json({ message: 'Failed to fetch sent messages' });
  }
});

// Mark message as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ success: true, message });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Failed to mark message as read' });
  }
});

// Get unread count
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipientId: req.user.id,
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Failed to get unread count' });
  }
});

// Get unread count for specific conversation
router.get('/unread-count/:userId', authMiddleware, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      senderId: req.params.userId,
      recipientId: req.user.id,
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Get conversation unread count error:', error);
    res.status(500).json({ message: 'Failed to get unread count' });
  }
});

// Delete message
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findOneAndDelete({
      _id: req.params.id,
      $or: [{ senderId: req.user.id }, { recipientId: req.user.id }]
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
});

// Get conversation with a user
router.get('/conversation/:userId', authMiddleware, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: req.user.id }
      ]
    })
    .populate('senderId', 'name email role')
    .populate('recipientId', 'name email role')
    .sort({ createdAt: 1 });

    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      senderName: msg.senderId?.name || 'Unknown',
      senderId: msg.senderId?._id,
      recipientName: msg.recipientId?.name || 'Unknown',
      recipientId: msg.recipientId?._id,
      subject: msg.subject,
      message: msg.message,
      isRead: msg.isRead,
      priority: msg.priority,
      createdAt: msg.createdAt,
      isMine: msg.senderId?._id.toString() === req.user.id
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Failed to fetch conversation' });
  }
});

// Get admin user ID (for students to chat with admin)
router.get('/admin-id', authMiddleware, async (req, res) => {
  try {
    const User = require('../models/User');
    const admin = await User.findOne({ role: 'admin' }).select('_id name email');
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json({ 
      success: true, 
      adminId: admin._id,
      adminName: admin.name,
      adminEmail: admin.email
    });
  } catch (error) {
    console.error('Get admin ID error:', error);
    res.status(500).json({ message: 'Failed to fetch admin ID' });
  }
});

module.exports = router;
