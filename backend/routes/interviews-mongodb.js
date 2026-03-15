const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Student = require('../models/Student');
const PlacementDrive = require('../models/PlacementDrive');
const Company = require('../models/Company');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { sendInterviewScheduleEmail } = require('../utils/emailService');
const { createNotification } = require('../utils/notificationHelper');

// Schedule interview (HR only)
router.post('/', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const { applicationId, interviewDate, interviewTime, venue, interviewType, notes } = req.body;

    // Get application details
    const application = await Application.findById(applicationId)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate({
        path: 'driveId',
        populate: { path: 'companyId', select: 'name' }
      });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Create interview
    const interview = new Interview({
      applicationId,
      studentId: application.studentId._id,
      driveId: application.driveId._id,
      companyId: application.driveId.companyId._id,
      interviewDate,
      interviewTime,
      venue,
      interviewType: interviewType || 'technical',
      notes: notes || '',
      createdBy: req.user.id
    });

    await interview.save();

    // Send email notification
    const student = application.studentId;
    const company = application.driveId.companyId;
    await sendInterviewScheduleEmail(
      student.userId.email,
      student.userId.name,
      company.name,
      new Date(interviewDate).toLocaleDateString(),
      interviewTime,
      venue
    );

    // Send in-app notification
    await createNotification({
      recipientId: student.userId._id.toString(),
      title: '📅 Interview Scheduled',
      message: `Your interview with ${company.name} has been scheduled for ${new Date(interviewDate).toLocaleDateString()} at ${interviewTime}. Venue: ${venue}`,
      type: 'interview',
      priority: 'high',
      relatedId: interview._id.toString(),
      relatedType: 'interview'
    });

    res.json({ success: true, interview });
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({ message: 'Failed to schedule interview' });
  }
});

// Get student interviews
router.get('/student', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const userId = req.user.id;
    const student = await Student.findOne({ userId });
    
    if (!student) {
      return res.json([]);
    }

    const interviews = await Interview.find({ studentId: student._id })
      .populate({
        path: 'driveId',
        populate: { path: 'companyId', select: 'name' }
      })
      .sort({ interviewDate: 1 });

    const formattedInterviews = interviews.map(interview => ({
      id: interview._id,
      companyName: interview.driveId?.companyId?.name || 'N/A',
      jobRole: interview.driveId?.jobRole || 'N/A',
      interviewDate: interview.interviewDate,
      interviewTime: interview.interviewTime,
      venue: interview.venue,
      interviewType: interview.interviewType,
      status: interview.status,
      notes: interview.notes
    }));

    res.json(formattedInterviews);
  } catch (error) {
    console.error('Get student interviews error:', error);
    res.status(500).json({ message: 'Failed to fetch interviews' });
  }
});

// Get HR interviews
router.get('/hr', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const userId = req.user.id;
    const HR = require('../models/HR');
    const hr = await HR.findOne({ userId });
    
    if (!hr) {
      return res.status(404).json({ message: 'HR profile not found' });
    }

    const interviews = await Interview.find({ companyId: hr.companyId })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate({
        path: 'driveId',
        select: 'jobRole'
      })
      .sort({ interviewDate: 1 });

    const formattedInterviews = interviews.map(interview => ({
      id: interview._id,
      studentName: interview.studentId?.userId?.name || 'N/A',
      studentEmail: interview.studentId?.userId?.email || 'N/A',
      rollNumber: interview.studentId?.rollNumber || 'N/A',
      jobRole: interview.driveId?.jobRole || 'N/A',
      interviewDate: interview.interviewDate,
      interviewTime: interview.interviewTime,
      venue: interview.venue,
      interviewType: interview.interviewType,
      status: interview.status,
      notes: interview.notes
    }));

    res.json(formattedInterviews);
  } catch (error) {
    console.error('Get HR interviews error:', error);
    res.status(500).json({ message: 'Failed to fetch interviews' });
  }
});

// Update interview status
router.put('/:id/status', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      { status, notes: notes || interview.notes },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json({ success: true, interview });
  } catch (error) {
    console.error('Update interview status error:', error);
    res.status(500).json({ message: 'Failed to update interview' });
  }
});

// Delete interview
router.delete('/:id', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json({ success: true, message: 'Interview deleted' });
  } catch (error) {
    console.error('Delete interview error:', error);
    res.status(500).json({ message: 'Failed to delete interview' });
  }
});

module.exports = router;
