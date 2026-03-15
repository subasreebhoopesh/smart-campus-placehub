const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const Student = require('../models/Student');
const User = require('../models/User');
const { sendDocumentVerificationEmail } = require('../utils/emailService');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/documents');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed!'));
    }
  }
});

// Upload document (Student only)
router.post('/upload', authMiddleware, requireRole('student'), upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { documentType, documentName } = req.body;
    
    if (!documentType) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Document type is required' });
    }

    // Get student info
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Check if document already exists
    const existingDoc = await Document.findOne({
      student_id: student._id,
      document_type: documentType
    });

    if (existingDoc) {
      // Delete old file
      const oldFilePath = path.join(__dirname, '..', existingDoc.file_path);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      // Delete old document record
      await Document.findByIdAndDelete(existingDoc._id);
    }

    // Create new document record
    const document = new Document({
      student_id: student._id,
      user_id: req.user.id,
      document_type: documentType,
      document_name: documentName || req.file.originalname,
      file_path: `/uploads/documents/${req.file.filename}`,
      file_size: req.file.size,
      file_type: req.file.mimetype,
      status: 'pending'
    });

    await document.save();

    res.json({
      message: 'Document uploaded successfully',
      document: {
        id: document._id,
        document_type: document.document_type,
        document_name: document.document_name,
        status: document.status,
        uploaded_at: document.uploaded_at
      }
    });
  } catch (error) {
    console.error('Document upload error:', error);
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message || 'Failed to upload document' });
  }
});

// Get student's documents
router.get('/student', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const documents = await Document.find({ student_id: student._id })
      .sort({ uploaded_at: -1 })
      .select('-__v');

    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

// Get all documents (Admin only)
router.get('/admin/all', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const documents = await Document.find(query)
      .populate('user_id', 'name email')
      .populate('student_id', 'roll_number branch')
      .sort({ uploaded_at: -1 })
      .select('-__v');

    res.json(documents);
  } catch (error) {
    console.error('Get all documents error:', error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

// Verify/Reject document (Admin only)
router.put('/admin/:id/verify', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { status, remarks } = req.body;
    
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const document = await Document.findById(req.params.id)
      .populate('user_id', 'name email');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    document.status = status;
    document.remarks = remarks || '';
    document.verified_by = req.user.id;
    document.verified_at = new Date();

    await document.save();

    // Send email notification
    try {
      await sendDocumentVerificationEmail(
        document.user_id.email,
        document.user_id.name,
        status,
        remarks
      );
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Continue even if email fails
    }

    res.json({
      message: `Document ${status} successfully`,
      document
    });
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({ message: 'Failed to verify document' });
  }
});

// Delete document (Student only)
router.delete('/:id', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const document = await Document.findOne({
      _id: req.params.id,
      student_id: student._id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', document.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Failed to delete document' });
  }
});

// Download document
router.get('/download/:id', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check authorization
    const student = await Student.findOne({ userId: req.user.id });
    const isOwner = student && document.student_id.toString() === student._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filePath = path.join(__dirname, '..', document.file_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filePath, document.document_name);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ message: 'Failed to download document' });
  }
});

// Get document statistics (Admin only)
router.get('/admin/stats', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const stats = await Document.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      total: 0,
      pending: 0,
      verified: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    res.json(result);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

module.exports = router;
