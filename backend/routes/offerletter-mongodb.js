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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  }
});

// Admin: Upload offer letter for a selected application
router.post('/upload/:applicationId', authMiddleware, requireRole('admin'), upload.single('offerLetter'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const application = await Application.findById(req.params.applicationId);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.status !== 'selected') {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Offer letter can only be uploaded for selected students' });
    }

    // Delete old offer letter if exists
    if (application.offerLetterPath) {
      const oldPath = path.join(__dirname, '..', application.offerLetterPath);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    application.offerLetterPath = `/uploads/offer-letters/${req.file.filename}`;
    application.offerLetterUploadedAt = new Date();
    await application.save();

    res.json({ message: 'Offer letter uploaded successfully', path: application.offerLetterPath });
  } catch (error) {
    console.error('Offer letter upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: error.message || 'Upload failed' });
  }
});

// Admin: Delete offer letter
router.delete('/:applicationId', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.offerLetterPath) {
      const filePath = path.join(__dirname, '..', application.offerLetterPath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      application.offerLetterPath = undefined;
      application.offerLetterUploadedAt = undefined;
      await application.save();
    }

    res.json({ message: 'Offer letter deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

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
