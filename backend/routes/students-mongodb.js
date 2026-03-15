const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Student = require('../models/Student');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'resume') {
      // Only allow PDF files for resume
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed for resume'));
      }
    } else if (file.fieldname === 'photo') {
      // Only allow image files for photo
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for profile photo'));
      }
    } else {
      cb(new Error('Invalid field name'));
    }
  }
});

// Get student profile
router.get('/profile', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const userId = req.user.id;
    const student = await Student.findOne({ userId });
    
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json({
      id: student._id,
      user_id: student.userId,
      roll_number: student.rollNumber,
      branch: student.branch,
      cgpa: student.cgpa,
      skills: student.skills,
      projects: student.projects || [],
      resume_url: student.resumeUrl,
      profile_photo_url: student.profilePhotoUrl,
      tenth_percentage: student.tenthPercentage,
      twelfth_percentage: student.twelfthPercentage,
      phone: student.phone,
      linkedin: student.linkedin,
      github: student.github,
      about: student.about
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update student profile
router.put('/profile', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Update User model (name and email)
    const User = require('../models/User');
    if (updates.name || updates.email) {
      const userUpdates = {};
      if (updates.name) userUpdates.name = updates.name;
      if (updates.email) userUpdates.email = updates.email;
      
      await User.findByIdAndUpdate(userId, userUpdates);
    }

    // Update Student model
    const student = await Student.findOneAndUpdate(
      { userId },
      {
        cgpa: updates.cgpa,
        skills: updates.skills,
        projects: updates.projects,
        tenthPercentage: updates.tenthPercentage,
        twelfthPercentage: updates.twelfthPercentage,
        phone: updates.phone,
        linkedin: updates.linkedin,
        github: updates.github,
        about: updates.about
      },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json({ success: true, student });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Upload resume
router.post('/resume', authMiddleware, requireRole('student'), upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const resumeUrl = `/uploads/${req.file.filename}`;

    // Update student record with resume URL
    const student = await Student.findOneAndUpdate(
      { userId },
      { resumeUrl },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json({ 
      success: true, 
      url: resumeUrl,
      message: 'Resume uploaded successfully' 
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ message: 'Failed to upload resume' });
  }
});

// Upload profile photo
router.post('/profile-photo', authMiddleware, requireRole('student'), upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const photoUrl = `/uploads/${req.file.filename}`;

    // Update student record with photo URL
    const student = await Student.findOneAndUpdate(
      { userId },
      { profilePhotoUrl: photoUrl },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json({ 
      success: true, 
      url: photoUrl,
      message: 'Profile photo uploaded successfully' 
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ message: 'Failed to upload photo' });
  }
});

// Get all students (Admin only)
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    console.log('Admin fetching all students with placement info...');
    
    const students = await Student.find().populate('userId', 'name email');
    
    // Get all selected applications for each student
    const Application = require('../models/Application');
    const PlacementDrive = require('../models/PlacementDrive');
    
    const studentsWithPlacements = await Promise.all(
      students.map(async (student) => {
        // Find if student has any selected application
        const selectedApplication = await Application.findOne({
          studentId: student._id,
          status: 'selected'
        })
          .populate({
            path: 'driveId',
            populate: { path: 'companyId', select: 'name' }
          })
          .sort({ appliedDate: -1 }); // Get most recent selection
        
        const placementStatus = selectedApplication ? 'placed' : 'unplaced';
        const company = selectedApplication?.driveId?.companyId?.name || null;
        const packageOffered = selectedApplication?.driveId?.packageOffered || null;
        
        return {
          id: student._id,
          userId: student.userId?._id, // Add userId for messaging
          name: student.userId?.name || 'Unknown',
          email: student.userId?.email || '',
          rollNumber: student.rollNumber,
          branch: student.branch,
          cgpa: student.cgpa || 0,
          skills: student.skills || [],
          phone: student.phone || '',
          placementStatus,
          company,
          package: packageOffered,
          tenthPercentage: student.tenthPercentage || 0,
          twelfthPercentage: student.twelfthPercentage || 0
        };
      })
    );
    
    console.log(`Returning ${studentsWithPlacements.length} students with placement info`);
    res.json(studentsWithPlacements);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

module.exports = router;
