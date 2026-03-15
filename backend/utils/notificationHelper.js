const Notification = require('../models/Notification');

/**
 * Send notification to a user
 */
async function sendNotification({
  recipientId,
  recipientRole,
  senderId = null,
  senderRole = 'system',
  title,
  message,
  type = 'system',
  priority = 'medium',
  relatedId = null,
  relatedType = null
}) {
  try {
    const notification = await Notification.create({
      recipientId,
      recipientRole,
      senderId,
      senderRole,
      title,
      message,
      type,
      priority,
      relatedId,
      relatedType
    });
    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

/**
 * Send notification when application status changes
 */
async function notifyApplicationStatusChange(application, oldStatus, newStatus, adminId) {
  const statusMessages = {
    'shortlisted': {
      title: '🎉 Application Shortlisted!',
      message: `Congratulations! Your application has been shortlisted. Please prepare for the next round.`,
      priority: 'high'
    },
    'selected': {
      title: '🎊 Congratulations! You are Selected!',
      message: `Great news! You have been selected. Further details will be shared soon.`,
      priority: 'urgent'
    },
    'rejected': {
      title: 'Application Update',
      message: `Your application status has been updated. Keep applying to other opportunities!`,
      priority: 'medium'
    },
    'on-hold': {
      title: 'Application On Hold',
      message: `Your application is currently on hold. We will update you soon.`,
      priority: 'medium'
    }
  };

  const statusInfo = statusMessages[newStatus];
  if (!statusInfo) return;

  await sendNotification({
    recipientId: application.student_id || application.studentId,
    recipientRole: 'student',
    senderId: adminId,
    senderRole: 'admin',
    title: statusInfo.title,
    message: statusInfo.message,
    type: 'application',
    priority: statusInfo.priority,
    relatedId: application._id || application.id,
    relatedType: 'application'
  });
}

/**
 * Send notification when new drive is created
 */
async function notifyNewDrive(drive, studentIds) {
  const notifications = studentIds.map(studentId => ({
    recipientId: studentId,
    recipientRole: 'student',
    senderRole: 'admin',
    title: '📢 New Placement Drive!',
    message: `A new placement drive has been scheduled. Check it out and apply now!`,
    type: 'drive',
    priority: 'high',
    relatedId: drive._id || drive.id,
    relatedType: 'drive'
  }));

  await Notification.insertMany(notifications);
}

/**
 * Send notification when student applies to a drive
 */
async function notifyNewApplication(application, hrIds) {
  const notifications = hrIds.map(hrId => ({
    recipientId: hrId,
    recipientRole: 'hr',
    senderId: application.student_id || application.studentId,
    senderRole: 'student',
    title: '📝 New Application Received',
    message: `A new student has applied to your placement drive. Review the application now.`,
    type: 'application',
    priority: 'medium',
    relatedId: application._id || application.id,
    relatedType: 'application'
  }));

  await Notification.insertMany(notifications);
}

/**
 * Send reminder notification
 */
async function sendReminder(recipientId, recipientRole, title, message) {
  await sendNotification({
    recipientId,
    recipientRole,
    title,
    message,
    type: 'system',
    priority: 'medium'
  });
}

module.exports = {
  sendNotification,
  notifyApplicationStatusChange,
  notifyNewDrive,
  notifyNewApplication,
  sendReminder
};
