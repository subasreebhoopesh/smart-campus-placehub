const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');
const Student = require('../models/Student');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Multer storage for offer letters
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/offer-letters');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'offer-' + unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  }
});

// ─── HR ROUTES ────────────────────────────────────────────────────────────────

// HR: Get selected students list for their company
router.get('/hr/list', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const HR = require('../models/HR');
    const hrRecord = await HR.findOne({ userId: req.user.id }).populate('companyId');
    if (!hrRecord) return res.status(403).json({ message: 'HR record not found' });

    // Fetch selected applications for this HR's company OR applications with null companyId
    const applications = await Application.find({
      status: 'selected',
      $or: [
        { companyId: hrRecord.companyId?._id },
        { companyId: null },
        { companyId: { $exists: false } }
      ]
    })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
      .populate('driveId', 'jobRole driveDate packageOffered')
      .populate('companyId', 'name')
      .sort({ updatedAt: -1 });

    const hrCompanyName = hrRecord.companyId?.name || '';

    const result = applications.map(app => ({
      id: app._id,
      studentName: app.studentId?.userId?.name || 'Unknown',
      studentEmail: app.studentId?.userId?.email || '',
      rollNumber: app.studentId?.rollNumber || '',
      branch: app.studentId?.branch || '',
      // Use HR company name for null-companyId apps so offer letter has correct branding
      companyName: app.companyId?.name || hrCompanyName,
      jobRole: app.driveId?.jobRole || 'Software Engineer',
      packageOffered: app.driveId?.packageOffered || 0,
      hasOfferLetter: !!app.offerLetterUploadedAt,
      offerLetterUploadedAt: app.offerLetterUploadedAt || null
    }));

    res.json(result);
  } catch (error) {
    console.error('HR list error:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// HR: Mark offer letter as sent (saves metadata so student can regenerate PDF)
router.post('/hr/send/:applicationId', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const HR = require('../models/HR');
    const hrRecord = await HR.findOne({ userId: req.user.id }).populate('companyId');
    if (!hrRecord) return res.status(403).json({ message: 'HR record not found' });

    const application = await Application.findOne({
      _id: req.params.applicationId,
      status: 'selected',
      $or: [
        { companyId: hrRecord.companyId },
        { companyId: null },
        { companyId: { $exists: false } }
      ]
    })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
      .populate('driveId', 'jobRole packageOffered driveDate')
      .populate('companyId', 'name');

    if (!application) {
      return res.status(404).json({ message: 'Application not found or student not selected' });
    }

    // Save offer letter metadata to the application
    application.offerLetterPath = 'generated'; // marks as sent
    application.offerLetterUploadedAt = new Date();
    // Store offer data as JSON in offerLetterPath for student to regenerate
    const offerData = {
      studentName: application.studentId?.userId?.name || '',
      studentEmail: application.studentId?.userId?.email || '',
      rollNumber: application.studentId?.rollNumber || '',
      branch: application.studentId?.branch || '',
      companyName: application.companyId?.name || hrRecord.companyId?.name || '',
      jobRole: application.driveId?.jobRole || '',
      packageOffered: application.driveId?.packageOffered || 0,
      sentAt: new Date().toISOString()
    };
    application.offerLetterPath = JSON.stringify(offerData);
    application.offerLetterUploadedAt = new Date();
    await application.save();

    // Send notification to student
    const { createNotification } = require('../utils/notificationHelper');
    await createNotification({
      recipientId: application.studentId?.userId?._id?.toString(),
      title: '🎉 Offer Letter Received!',
      message: `Your offer letter from ${application.companyId?.name} for ${application.driveId?.jobRole} is ready. Download it from My Applications page.`,
      type: 'placement',
      priority: 'high',
      relatedId: application._id.toString(),
      relatedType: 'application'
    });

    res.json({ success: true, message: 'Offer letter sent to student', offerData });
  } catch (error) {
    console.error('HR send offer letter error:', error);
    res.status(500).json({ message: error.message || 'Failed to send offer letter' });
  }
});

// Student: Get offer letter data for regenerating PDF
router.get('/student/offer/:applicationId', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const Student = require('../models/Student');
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const application = await Application.findOne({
      _id: req.params.applicationId,
      studentId: student._id
    });

    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (!application.offerLetterPath) return res.status(404).json({ message: 'No offer letter available' });

    try {
      const offerData = JSON.parse(application.offerLetterPath);
      res.json({ success: true, offerData });
    } catch {
      res.status(400).json({ message: 'Offer letter data not available' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to get offer letter data' });
  }
});

// HR: Upload offer letter for a selected student
router.post('/hr/upload/:applicationId', authMiddleware, requireRole('hr'), upload.single('offerLetter'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const HR = require('../models/HR');
    const hrRecord = await HR.findOne({ userId: req.user.id });
    if (!hrRecord) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: 'HR record not found' });
    }

    const application = await Application.findOne({
      _id: req.params.applicationId,
      companyId: hrRecord.companyId,
      status: 'selected'
    });

    if (!application) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Application not found or student not selected' });
    }

    // Delete old offer letter if exists
    if (application.offerLetterPath) {
      const oldPath = path.join(__dirname, '..', application.offerLetterPath);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    application.offerLetterPath = `/uploads/offer-letters/${req.file.filename}`;
    application.offerLetterUploadedAt = new Date();
    await application.save();

    res.json({ success: true, message: 'Offer letter uploaded successfully', path: application.offerLetterPath });
  } catch (error) {
    console.error('HR Offer letter upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: error.message || 'Upload failed' });
  }
});

// HR: Delete offer letter
router.delete('/hr/:applicationId', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const HR = require('../models/HR');
    const hrRecord = await HR.findOne({ userId: req.user.id });
    if (!hrRecord) return res.status(403).json({ message: 'HR record not found' });

    const application = await Application.findOne({
      _id: req.params.applicationId,
      companyId: hrRecord.companyId
    });
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.offerLetterPath) {
      const filePath = path.join(__dirname, '..', application.offerLetterPath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      application.offerLetterPath = undefined;
      application.offerLetterUploadedAt = undefined;
      await application.save();
    }

    res.json({ success: true, message: 'Offer letter deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

// ─── STUDENT ROUTES ───────────────────────────────────────────────────────────

// Student: Download their own offer letter
router.get('/download/:applicationId', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const application = await Application.findOne({
      _id: req.params.applicationId,
      studentId: student._id
    });

    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (!application.offerLetterPath) return res.status(404).json({ message: 'No offer letter available' });

    const filePath = path.join(__dirname, '..', application.offerLetterPath);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });

    res.download(filePath, 'offer-letter.pdf');
  } catch (error) {
    res.status(500).json({ message: 'Download failed' });
  }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

// Admin: Get all applications with offer letter status
router.get('/admin/list', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const applications = await Application.find({ status: 'selected' })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
      .populate('driveId', 'jobRole driveDate')
      .populate('companyId', 'name')
      .sort({ appliedDate: -1 });

    const result = applications.map(app => ({
      id: app._id,
      studentName: app.studentId?.userId?.name || 'Unknown',
      studentEmail: app.studentId?.userId?.email || '',
      rollNumber: app.studentId?.rollNumber || '',
      branch: app.studentId?.branch || '',
      companyName: app.companyId?.name || '',
      jobRole: app.driveId?.jobRole || '',
      driveDate: app.driveId?.driveDate,
      hasOfferLetter: !!app.offerLetterPath,
      offerLetterUploadedAt: app.offerLetterUploadedAt
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

module.exports = router;
