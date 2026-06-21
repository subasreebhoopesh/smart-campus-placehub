const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const Student = require('../models/Student');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const Application = require('../models/Application');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for profile photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'admin-photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get admin dashboard stats
router.get('/stats', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    // Get total students count
    const totalStudents = await Student.countDocuments();
    
    // Get total companies count
    const totalCompanies = await Company.countDocuments();
    
    // Get active drives count (upcoming or ongoing)
    const activeDrives = await PlacementDrive.countDocuments({
      status: { $in: ['upcoming', 'ongoing'] }
    });
    
    // Get placed students count (students with at least one selected application)
    const placedStudents = await Application.distinct('studentId', {
      status: 'selected'
    });
    
    // Calculate placement rate
    const placementRate = totalStudents > 0 
      ? ((placedStudents.length / totalStudents) * 100).toFixed(1)
      : 0;
    
    // Get previous month stats for comparison (simplified - using 30 days ago)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const studentsLastMonth = await Student.countDocuments({
      createdAt: { $lt: thirtyDaysAgo }
    });
    
    const companiesLastMonth = await Company.countDocuments({
      createdAt: { $lt: thirtyDaysAgo }
    });
    
    const drivesLastMonth = await PlacementDrive.countDocuments({
      status: { $in: ['upcoming', 'ongoing'] },
      createdAt: { $lt: thirtyDaysAgo }
    });
    
    // Calculate changes
    const studentChange = studentsLastMonth > 0 
      ? (((totalStudents - studentsLastMonth) / studentsLastMonth) * 100).toFixed(1)
      : 0;
    
    const companyChange = companiesLastMonth > 0
      ? (((totalCompanies - companiesLastMonth) / companiesLastMonth) * 100).toFixed(1)
      : 0;
    
    const driveChange = activeDrives - drivesLastMonth;

    const stats = {
      totalStudents,
      totalCompanies,
      activeDrives,
      placementRate: parseFloat(placementRate),
      placedStudents: placedStudents.length,
      changes: {
        students: parseFloat(studentChange),
        companies: parseFloat(companyChange),
        drives: driveChange
      }
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// Get placement summary report
router.get('/placement-summary', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    // Get all students with their branch info
    const students = await Student.find().populate('userId', 'email');
    
    // Get all applications with selected status
    const placedApplications = await Application.find({ status: 'selected' })
      .populate('studentId')
      .populate('driveId');
    
    // Group students by branch
    const branchStats = {};
    
    students.forEach(student => {
      const branch = student.branch;
      if (!branchStats[branch]) {
        branchStats[branch] = {
          branch,
          eligible: 0,
          placed: 0,
          packages: []
        };
      }
      branchStats[branch].eligible++;
    });
    
    // Count placed students and collect package data
    placedApplications.forEach(app => {
      if (app.studentId && app.studentId.branch) {
        const branch = app.studentId.branch;
        if (branchStats[branch]) {
          branchStats[branch].placed++;
          
          // Add package from drive if available (assuming it's already in LPA)
          if (app.driveId && app.driveId.packageOffered) {
            branchStats[branch].packages.push(app.driveId.packageOffered);
          }
        }
      }
    });
    
    // Calculate averages and format data
    const reportData = Object.values(branchStats).map(stat => {
      const avgPackage = stat.packages.length > 0
        ? (stat.packages.reduce((sum, p) => sum + p, 0) / stat.packages.length).toFixed(1)
        : 0;
      
      const highestPackage = stat.packages.length > 0
        ? Math.max(...stat.packages)
        : 0;
      
      return {
        branch: stat.branch,
        eligible: stat.eligible,
        placed: stat.placed,
        placementPercentage: stat.eligible > 0 
          ? ((stat.placed / stat.eligible) * 100).toFixed(1)
          : 0,
        avgPackage: parseFloat(avgPackage),
        highestPackage
      };
    });
    
    // Calculate totals
    const totalEligible = reportData.reduce((sum, d) => sum + d.eligible, 0);
    const totalPlaced = reportData.reduce((sum, d) => sum + d.placed, 0);
    const allPackages = Object.values(branchStats).flatMap(s => s.packages);
    const avgPackage = allPackages.length > 0
      ? (allPackages.reduce((sum, p) => sum + p, 0) / allPackages.length).toFixed(1)
      : 0;
    const highestPackage = allPackages.length > 0
      ? Math.max(...allPackages)
      : 0;
    
    res.json({
      success: true,
      summary: {
        totalEligible,
        totalPlaced,
        avgPackage: parseFloat(avgPackage),
        highestPackage,
        placementRate: totalEligible > 0 
          ? ((totalPlaced / totalEligible) * 100).toFixed(1)
          : 0
      },
      branchData: reportData
    });
  } catch (error) {
    console.error('Get placement summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch placement summary' });
  }
});

// Get admin profile
router.get('/profile', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    
    res.json({
      success: true,
      profile: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePhotoUrl: user.profilePhotoUrl || '',
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// Update admin profile
router.put('/profile', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    
    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'Current password is required to set new password' 
        });
      }
      
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }
    
    // Update name if provided
    if (name && name.trim()) {
      user.name = name.trim();
    }
    
    // Update email if provided and different
    if (email && email.trim() && email !== user.email) {
      // Check if email already exists
      const existingUser = await User.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: user._id }
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already in use' 
        });
      }
      
      user.email = email.toLowerCase().trim();
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePhotoUrl: user.profilePhotoUrl || '',
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// Upload admin profile photo
router.post('/profile-photo', authMiddleware, requireRole('admin'), upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo file uploaded' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Delete old photo if exists
    if (user.profilePhotoUrl) {
      const oldPhotoPath = path.join(__dirname, '..', user.profilePhotoUrl.replace('/uploads/', '/uploads/'));
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Save new photo URL
    const photoUrl = `/uploads/${req.file.filename}`;
    user.profilePhotoUrl = photoUrl;
    await user.save();

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      profilePhotoUrl: photoUrl
    });
  } catch (error) {
    console.error('Upload profile photo error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload photo' });
  }
});

// Get analytics data
router.get('/analytics', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const Student = require('../models/Student');
    const Application = require('../models/Application');
    const PlacementDrive = require('../models/PlacementDrive');
    const Company = require('../models/Company');

    // Get all students
    const allStudents = await Student.find({});
    const totalStudents = allStudents.length;

    // Get placed students (students with at least one 'selected' application)
    const placedApplications = await Application.find({ status: 'selected' }).distinct('studentId');
    const placedStudents = placedApplications.length;

    // Calculate placement rate
    const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0;

    // Get all selected applications with student data
    const selectedApps = await Application.find({ status: 'selected' })
      .populate('studentId')
      .populate('driveId');

    // Calculate average package
    let totalPackage = 0;
    let packageCount = 0;
    for (const app of selectedApps) {
      if (app.driveId && app.driveId.packageOffered) {
        totalPackage += app.driveId.packageOffered;
        packageCount++;
      }
    }
    const avgPackage = packageCount > 0 ? (totalPackage / packageCount).toFixed(1) : 0;

    // Get companies visited (unique companies with drives)
    const companiesVisited = await PlacementDrive.distinct('companyId');

    // Branch-wise placement data
    const branches = ['CSE', 'IT', 'ECE', 'EEE', 'MECH'];
    const branchWisePlacement = [];
    
    for (const branch of branches) {
      const branchStudents = allStudents.filter(s => s.branch === branch);
      const branchTotal = branchStudents.length;
      const branchPlaced = branchStudents.filter(s => 
        placedApplications.includes(s._id.toString())
      ).length;
      
      branchWisePlacement.push({
        branch,
        total: branchTotal,
        placed: branchPlaced,
        rate: branchTotal > 0 ? ((branchPlaced / branchTotal) * 100).toFixed(1) : 0
      });
    }

    // Monthly placements (last 6 months)
    const monthlyPlacements = [];
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate);
      monthDate.setMonth(currentDate.getMonth() - i);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      const monthApps = await Application.countDocuments({
        status: 'selected',
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      
      monthlyPlacements.push({
        month: months[5 - i] || monthDate.toLocaleString('default', { month: 'short' }),
        placements: monthApps
      });
    }

    // Package distribution
    const packageRanges = [
      { range: '0-5 LPA', min: 0, max: 5, count: 0 },
      { range: '5-10 LPA', min: 5, max: 10, count: 0 },
      { range: '10-15 LPA', min: 10, max: 15, count: 0 },
      { range: '15-20 LPA', min: 15, max: 20, count: 0 },
      { range: '20+ LPA', min: 20, max: 999, count: 0 }
    ];

    for (const app of selectedApps) {
      if (app.driveId && app.driveId.packageOffered) {
        const pkg = app.driveId.packageOffered;
        for (const range of packageRanges) {
          if (pkg >= range.min && pkg < range.max) {
            range.count++;
            break;
          }
        }
      }
    }

    // Top recruiters
    const companyHires = {};
    for (const app of selectedApps) {
      if (app.companyId) {
        const companyId = app.companyId.toString();
        companyHires[companyId] = (companyHires[companyId] || 0) + 1;
      }
    }

    const topRecruiters = [];
    const sortedCompanies = Object.entries(companyHires)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    for (const [companyId, hires] of sortedCompanies) {
      const company = await Company.findById(companyId);
      if (company) {
        topRecruiters.push({
          company: company.name,
          hires: hires
        });
      }
    }

    res.json({
      success: true,
      analytics: {
        summary: {
          totalPlacements: placedStudents,
          avgPackage: parseFloat(avgPackage),
          companiesVisited: companiesVisited.length,
          placementRate: parseFloat(placementRate)
        },
        branchWisePlacement,
        monthlyPlacements,
        packageDistribution: packageRanges,
        topRecruiters,
        totals: {
          eligible: totalStudents,
          placed: placedStudents,
          yetToPlace: totalStudents - placedStudents
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics data' });
  }
});

// Get all HR users with their company info
router.get('/hr-users', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const HR = require('../models/HR');
    const User = require('../models/User');
    const Company = require('../models/Company');

    // Get all HR records
    const hrRecords = await HR.find({}).populate('userId').populate('companyId');
    
    const hrUsers = hrRecords.filter(hr => hr.userId && hr.companyId).map(hr => ({
      id: hr._id.toString(),
      userId: hr.userId._id.toString(),
      name: hr.userId.name,
      email: hr.userId.email,
      companyId: hr.companyId._id.toString(),
      companyName: hr.companyId.name,
      createdAt: hr.createdAt
    }));

    res.json({
      success: true,
      hrUsers
    });
  } catch (error) {
    console.error('Get HR users error:', error);
    res.status(500).json({ message: 'Failed to fetch HR users' });
  }
});

// Create new HR user
router.post('/hr-users', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, password, companyId } = req.body;
    const User = require('../models/User');
    const HR = require('../models/HR');
    const Company = require('../models/Company');
    const bcrypt = require('bcryptjs');
    const mongoose = require('mongoose');

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Find company - handle both MongoDB ObjectId and name-based lookup
    let company = null;
    
    // Try by ObjectId first
    if (mongoose.Types.ObjectId.isValid(companyId)) {
      company = await Company.findById(companyId);
    }
    
    // If not found by ID, try by name (for hardcoded frontend data)
    if (!company) {
      // Frontend may send company name as the id from hardcoded data
      company = await Company.findOne({ name: { $regex: new RegExp('^' + companyId + '$', 'i') } });
    }

    // If still not found, create the company on the fly
    if (!company) {
      console.log(`Company not found for id "${companyId}", creating new company...`);
      company = new Company({
        name: companyId, // Use the companyId value as name if it's a string
        industry: 'Technology',
        website: '',
        contactPerson: name,
        contactEmail: email,
        contactPhone: '',
        jobRoles: [],
        packageOffered: { min: 0, max: 0 },
        requiredSkills: [],
        visitHistory: []
      });
      await company.save();
      console.log(`✅ Auto-created company: ${company.name}`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'hr'
    });
    await user.save();

    // Create HR record
    const hr = new HR({
      userId: user._id,
      companyId: company._id
    });
    await hr.save();

    res.json({
      success: true,
      message: 'HR user created successfully',
      hrUser: {
        id: hr._id.toString(),
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        companyId: company._id.toString(),
        companyName: company.name,
        createdAt: hr.createdAt
      }
    });
  } catch (error) {
    console.error('Create HR user error:', error);
    res.status(500).json({ message: 'Failed to create HR user: ' + error.message });
  }
});

// Update HR user
router.put('/hr-users/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, companyId } = req.body;
    const User = require('../models/User');
    const HR = require('../models/HR');
    const Company = require('../models/Company');
    const bcrypt = require('bcryptjs');

    // Find HR record
    const hr = await HR.findById(id);
    if (!hr) {
      return res.status(404).json({ message: 'HR user not found' });
    }

    // Update user info
    const user = await User.findById(hr.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name;
    user.email = email;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();

    // Update company if changed
    if (companyId && companyId !== hr.companyId.toString()) {
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
      hr.companyId = companyId;
      await hr.save();
    }

    const company = await Company.findById(hr.companyId);

    res.json({
      success: true,
      message: 'HR user updated successfully',
      hrUser: {
        id: hr._id.toString(),
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        companyId: company._id.toString(),
        companyName: company.name,
        createdAt: hr.createdAt
      }
    });
  } catch (error) {
    console.error('Update HR user error:', error);
    res.status(500).json({ message: 'Failed to update HR user' });
  }
});

// Delete HR user
router.delete('/hr-users/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const User = require('../models/User');
    const HR = require('../models/HR');

    // Find and delete HR record
    const hr = await HR.findById(id);
    if (!hr) {
      return res.status(404).json({ message: 'HR user not found' });
    }

    // Delete user
    await User.findByIdAndDelete(hr.userId);
    
    // Delete HR record
    await HR.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'HR user deleted successfully'
    });
  } catch (error) {
    console.error('Delete HR user error:', error);
    res.status(500).json({ message: 'Failed to delete HR user' });
  }
});

module.exports = router;


// ========== DOCUMENT VERIFICATION ENDPOINTS ==========

// Get all students with document status
router.get('/students/documents', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const students = await Student.find()
      .populate('userId', 'name email')
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 });

    const formattedStudents = students.map(student => ({
      id: student._id,
      name: student.userId?.name || 'N/A',
      email: student.userId?.email || 'N/A',
      rollNumber: student.rollNumber,
      branch: student.branch,
      resumeUrl: student.resumeUrl || '',
      documentVerificationStatus: student.documentVerificationStatus || 'pending',
      verificationRemarks: student.verificationRemarks || '',
      verifiedBy: student.verifiedBy?.name || '',
      verifiedAt: student.verifiedAt || null
    }));

    res.json(formattedStudents);
  } catch (error) {
    console.error('Get students documents error:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// Verify/Reject student document
router.put('/students/:id/verify-document', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        documentVerificationStatus: status,
        verificationRemarks: remarks || '',
        verifiedBy: req.user.id,
        verifiedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Send email notification
    const { sendDocumentVerificationEmail } = require('../utils/emailService');
    await sendDocumentVerificationEmail(
      student.userId.email,
      student.userId.name,
      status,
      remarks
    );

    // Send in-app notification
    const { createNotification } = require('../utils/notificationHelper');
    await createNotification({
      recipientId: student.userId._id.toString(),
      title: status === 'verified' ? '✅ Documents Verified' : '⚠️ Document Verification Required',
      message: status === 'verified' 
        ? 'Your documents have been verified successfully. You are all set for placements!'
        : `Your documents need correction. Remarks: ${remarks}. Please update and resubmit.`,
      type: 'document',
      priority: status === 'verified' ? 'normal' : 'high'
    });

    res.json({ success: true, student });
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({ message: 'Failed to verify document' });
  }
});

// ========== STUDENT RANKING ENDPOINTS ==========

// Get ranked students (all or for specific company)
router.get('/students/ranked', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { companyId, limit } = req.query;
    
    // Get all students with populated data
    const students = await Student.find()
      .populate('userId', 'name email')
      .lean();

    let requiredSkills = [];
    
    // If company specified, get their required skills
    if (companyId) {
      const company = await Company.findById(companyId);
      if (company) {
        requiredSkills = company.requiredSkills || [];
      }
    }

    // Rank students
    const { rankStudents } = require('../utils/studentRanking');
    const rankedStudents = rankStudents(students, requiredSkills);

    // Apply limit if specified
    const limitedStudents = limit ? rankedStudents.slice(0, parseInt(limit)) : rankedStudents;

    // Format response
    const formattedStudents = limitedStudents.map(student => ({
      id: student._id,
      name: student.userId?.name || 'N/A',
      email: student.userId?.email || 'N/A',
      rollNumber: student.rollNumber,
      branch: student.branch,
      cgpa: student.cgpa,
      skills: student.skills || [],
      projects: student.projects || [],
      rankScore: student.rankScore,
      rank: student.rank
    }));

    res.json(formattedStudents);
  } catch (error) {
    console.error('Get ranked students error:', error);
    res.status(500).json({ message: 'Failed to fetch ranked students' });
  }
});

// Get student rank breakdown
router.get('/students/:id/rank-breakdown', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { companyId } = req.query;
    
    const student = await Student.findById(req.params.id).lean();
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    let requiredSkills = [];
    if (companyId) {
      const company = await Company.findById(companyId);
      if (company) {
        requiredSkills = company.requiredSkills || [];
      }
    }

    const { getRankBreakdown } = require('../utils/studentRanking');
    const breakdown = getRankBreakdown(student, requiredSkills);

    res.json(breakdown);
  } catch (error) {
    console.error('Get rank breakdown error:', error);
    res.status(500).json({ message: 'Failed to get rank breakdown' });
  }
});

// Update student rank scores (batch update)
router.post('/students/update-ranks', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const students = await Student.find().lean();
    const { calculateRankScore } = require('../utils/studentRanking');

    const updates = students.map(student => ({
      updateOne: {
        filter: { _id: student._id },
        update: { rankScore: calculateRankScore(student) }
      }
    }));

    await Student.bulkWrite(updates);

    res.json({ success: true, message: `Updated ${students.length} student ranks` });
  } catch (error) {
    console.error('Update ranks error:', error);
    res.status(500).json({ message: 'Failed to update ranks' });
  }
});


// ========== RECENT ACTIVITIES ENDPOINT ==========

// Get recent activities (real data from MongoDB)
router.get('/recent-activities', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const activities = [];

    // Get recent placements (selected applications)
    const recentPlacements = await Application.find({ status: 'selected' })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name' }
      })
      .populate({
        path: 'driveId',
        populate: { path: 'companyId', select: 'name' }
      })
      .sort({ updatedAt: -1 })
      .limit(3);

    for (const placement of recentPlacements) {
      if (placement.studentId && placement.driveId && placement.driveId.companyId) {
        activities.push({
          id: placement._id.toString(),
          type: 'placement',
          message: `${placement.studentId.userId.name} got placed at ${placement.driveId.companyId.name} with ${placement.driveId.packageOffered} LPA package`,
          timestamp: placement.updatedAt
        });
      }
    }

    // Get recent drive creations
    const recentDrives = await PlacementDrive.find()
      .populate('companyId', 'name')
      .sort({ createdAt: -1 })
      .limit(3);

    for (const drive of recentDrives) {
      if (drive.companyId) {
        activities.push({
          id: drive._id.toString(),
          type: 'drive',
          message: `${drive.companyId.name} placement drive scheduled for ${new Date(drive.driveDate).toLocaleDateString()}`,
          timestamp: drive.createdAt
        });
      }
    }

    // Get recent registrations (applications)
    const recentApplications = await Application.find()
      .populate({
        path: 'driveId',
        populate: { path: 'companyId', select: 'name' }
      })
      .sort({ appliedDate: -1 })
      .limit(2);

    for (const app of recentApplications) {
      if (app.driveId && app.driveId.companyId) {
        const count = await Application.countDocuments({ driveId: app.driveId._id });
        activities.push({
          id: app._id.toString(),
          type: 'registration',
          message: `${count} students registered for ${app.driveId.companyId.name} placement drive`,
          timestamp: app.appliedDate
        });
      }
    }

    // Get recent company additions
    const recentCompanies = await Company.find()
      .sort({ createdAt: -1 })
      .limit(2);

    for (const company of recentCompanies) {
      activities.push({
        id: company._id.toString(),
        type: 'company',
        message: `${company.name} added as new recruiting partner`,
        timestamp: company.createdAt
      });
    }

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit to requested number
    const limitedActivities = activities.slice(0, parseInt(limit));

    res.json({
      success: true,
      activities: limitedActivities
    });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({ message: 'Failed to fetch recent activities' });
  }
});

