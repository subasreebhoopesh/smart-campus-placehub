const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const HR = require('../models/HR');
const Company = require('../models/Company');
const Application = require('../models/Application');

// Get HR's company required skills
router.get('/skills', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get HR profile
    const hr = await HR.findOne({ userId });
    if (!hr) {
      return res.status(404).json({ message: 'HR profile not found' });
    }

    // Get company
    const company = await Company.findById(hr.companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({
      success: true,
      skills: company.requiredSkills || [],
      companyName: company.name
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ message: 'Failed to fetch skills' });
  }
});

// Set HR's company required skills
router.post('/skills', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const { skills } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: 'Skills must be an array' });
    }

    // Get HR profile
    const hr = await HR.findOne({ userId });
    if (!hr) {
      return res.status(404).json({ message: 'HR profile not found' });
    }

    // Update company's required skills
    const company = await Company.findByIdAndUpdate(
      hr.companyId,
      { requiredSkills: skills },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({
      success: true,
      message: 'Required skills updated successfully',
      skills: company.requiredSkills,
      companyName: company.name
    });
  } catch (error) {
    console.error('Set skills error:', error);
    res.status(500).json({ message: 'Failed to update skills' });
  }
});

// Get HR dashboard stats
router.get('/stats', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get HR profile
    const hr = await HR.findOne({ userId });
    if (!hr) {
      return res.status(404).json({ message: 'HR profile not found' });
    }

    // Get applications for this company
    const totalApplications = await Application.countDocuments({ companyId: hr.companyId });
    const shortlisted = await Application.countDocuments({ 
      companyId: hr.companyId, 
      status: 'shortlisted' 
    });
    const selected = await Application.countDocuments({ 
      companyId: hr.companyId, 
      status: 'selected' 
    });
    const rejected = await Application.countDocuments({ 
      companyId: hr.companyId, 
      status: 'rejected' 
    });
    const onHold = await Application.countDocuments({ 
      companyId: hr.companyId, 
      status: 'on-hold' 
    });
    const pending = await Application.countDocuments({ 
      companyId: hr.companyId, 
      status: 'applied' 
    });

    // Get company info
    const company = await Company.findById(hr.companyId);

    res.json({
      success: true,
      stats: {
        totalApplications,
        shortlisted,
        selected,
        rejected,
        onHold,
        pending,
        requiredSkills: company?.requiredSkills?.length || 0
      }
    });
  } catch (error) {
    console.error('Get HR stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Get HR profile with company info, job openings, and statistics
router.get('/profile', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const userId = req.user.id;
    const User = require('../models/User');
    const PlacementDrive = require('../models/PlacementDrive');

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get HR profile
    const hr = await HR.findOne({ userId });
    if (!hr) {
      return res.status(404).json({ message: 'HR profile not found' });
    }

    // Get company info
    const company = await Company.findById(hr.companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get job openings (placement drives) for this company
    const jobOpenings = await PlacementDrive.find({ companyId: hr.companyId })
      .sort({ driveDate: -1 });

    // Calculate statistics
    const totalDrives = await PlacementDrive.countDocuments({ companyId: hr.companyId });
    const activeDrives = await PlacementDrive.countDocuments({ 
      companyId: hr.companyId, 
      status: { $in: ['upcoming', 'ongoing'] }
    });
    const totalApplications = await Application.countDocuments({ companyId: hr.companyId });
    const totalSelections = await Application.countDocuments({ 
      companyId: hr.companyId, 
      status: 'selected' 
    });

    res.json({
      success: true,
      data: {
        hrInfo: {
          name: user.name,
          email: user.email,
          createdAt: hr.createdAt
        },
        companyInfo: {
          name: company.name,
          industry: company.industry,
          website: company.website,
          contactEmail: company.contactEmail,
          contactPhone: company.contactPhone,
          description: company.description
        },
        jobOpenings: jobOpenings.map(job => ({
          _id: job._id,
          jobRole: job.jobRole,
          driveDate: job.driveDate,
          eligibleBranches: job.eligibleBranches,
          minCgpa: job.minCgpa,
          packageOffered: job.packageOffered,
          description: job.description,
          status: job.status,
          registeredStudents: job.registeredStudents,
          selectedStudents: job.selectedStudents
        })),
        statistics: {
          totalDrives,
          activeDrives,
          totalApplications,
          totalSelections
        }
      }
    });
  } catch (error) {
    console.error('Get HR profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile data' });
  }
});

// Get HR recent activity
router.get('/recent-activity', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const userId = req.user.id;
    const Student = require('../models/Student');
    const User = require('../models/User');

    // Get HR profile
    const hr = await HR.findOne({ userId });
    if (!hr) {
      return res.status(404).json({ message: 'HR profile not found' });
    }

    // Get recent applications (last 10) and populate student with user info
    const recentApplications = await Application.find({ companyId: hr.companyId })
      .sort({ appliedDate: -1 })
      .limit(10)
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'name email'
        },
        select: 'userId branch rollNumber'
      });

    // Format activity data
    const activities = recentApplications.map(app => {
      let activityType = 'application';
      let description = 'New application received';
      let color = 'green';
      let badge = 'New';

      if (app.status === 'shortlisted') {
        activityType = 'shortlist';
        description = 'Student shortlisted';
        color = 'blue';
        badge = 'Shortlisted';
      } else if (app.status === 'selected') {
        activityType = 'selection';
        description = 'Student selected';
        color = 'green';
        badge = 'Selected';
      } else if (app.status === 'rejected') {
        activityType = 'rejection';
        description = 'Application rejected';
        color = 'red';
        badge = 'Rejected';
      } else if (app.status === 'on-hold' || app.status === 'on hold') {
        activityType = 'hold';
        description = 'Application on hold';
        color = 'orange';
        badge = 'On Hold';
      }

      // Get student name from nested populate
      const studentName = app.studentId?.userId?.name || 'Unknown Student';
      const studentBranch = app.studentId?.branch || '';

      return {
        id: app._id,
        type: activityType,
        description,
        studentName: studentBranch ? `${studentName} (${studentBranch})` : studentName,
        timestamp: app.appliedDate || app.createdAt,
        color,
        badge
      };
    });

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Get HR recent activity error:', error);
    res.status(500).json({ message: 'Failed to fetch recent activity' });
  }
});

module.exports = router;


// ========== STUDENT RANKING FOR HR ==========

// Get top ranked students for company
router.get('/top-students', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, driveId } = req.query;

    // Get HR profile
    const HR = require('../models/HR');
    const hr = await HR.findOne({ userId });
    if (!hr) {
      return res.status(404).json({ message: 'HR profile not found' });
    }

    // Get company
    const Company = require('../models/Company');
    const company = await Company.findById(hr.companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get all students
    const Student = require('../models/Student');
    const students = await Student.find()
      .populate('userId', 'name email')
      .lean();

    // Get required skills (from drive if specified, otherwise from company)
    let requiredSkills = company.requiredSkills || [];
    if (driveId) {
      const PlacementDrive = require('../models/PlacementDrive');
      const drive = await PlacementDrive.findById(driveId);
      if (drive && drive.requiredSkills && drive.requiredSkills.length > 0) {
        requiredSkills = drive.requiredSkills;
      }
    }

    // Rank students
    const { getTopStudents } = require('../utils/studentRanking');
    const topStudents = getTopStudents(students, requiredSkills, parseInt(limit));

    // Format response
    const formattedStudents = topStudents.map(student => ({
      id: student._id,
      name: student.userId?.name || 'N/A',
      email: student.userId?.email || 'N/A',
      rollNumber: student.rollNumber,
      branch: student.branch,
      cgpa: student.cgpa,
      skills: student.skills || [],
      projects: student.projects || [],
      resumeUrl: student.resumeUrl || '',
      rankScore: student.rankScore,
      rank: student.rank,
      phone: student.phone || '',
      linkedin: student.linkedin || '',
      github: student.github || ''
    }));

    res.json(formattedStudents);
  } catch (error) {
    console.error('Get top students error:', error);
    res.status(500).json({ message: 'Failed to fetch top students' });
  }
});

// Get student rank breakdown for HR
router.get('/student/:id/rank-breakdown', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get HR profile
    const HR = require('../models/HR');
    const hr = await HR.findOne({ userId });
    if (!hr) {
      return res.status(404).json({ message: 'HR profile not found' });
    }

    // Get company
    const Company = require('../models/Company');
    const company = await Company.findById(hr.companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get student
    const Student = require('../models/Student');
    const student = await Student.findById(req.params.id).lean();
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { getRankBreakdown } = require('../utils/studentRanking');
    const breakdown = getRankBreakdown(student, company.requiredSkills || []);

    res.json(breakdown);
  } catch (error) {
    console.error('Get rank breakdown error:', error);
    res.status(500).json({ message: 'Failed to get rank breakdown' });
  }
});


// ========== HR PROFILE UPDATE ==========

// Update HR profile (including email)
router.put('/profile/update', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, notificationPreferences } = req.body;

    // Get HR profile
    const HR = require('../models/HR');
    const hr = await HR.findOne({ userId });
    if (!hr) {
      return res.status(404).json({ message: 'HR profile not found' });
    }

    // Update User information (name, email)
    const User = require('../models/User');
    const updateData = {};
    if (name) updateData.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use by another user' });
      }
      updateData.email = email;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: 'name email role' }
    );

    // You can add HR-specific fields here if needed
    // For now, HR profile is linked to User, so we update User

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update HR profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Get HR email preferences
router.get('/email-preferences', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const userId = req.user.id;
    const User = require('../models/User');
    const user = await User.findById(userId).select('email name emailNotifications');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      email: user.email,
      name: user.name,
      emailNotifications: user.emailNotifications !== false // Default to true
    });
  } catch (error) {
    console.error('Get email preferences error:', error);
    res.status(500).json({ message: 'Failed to fetch email preferences' });
  }
});

// Update HR email preferences
router.put('/email-preferences', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { emailNotifications } = req.body;

    const User = require('../models/User');
    const user = await User.findByIdAndUpdate(
      userId,
      { emailNotifications: emailNotifications !== false },
      { new: true, select: 'email name emailNotifications' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Email preferences updated',
      emailNotifications: user.emailNotifications
    });
  } catch (error) {
    console.error('Update email preferences error:', error);
    res.status(500).json({ message: 'Failed to update email preferences' });
  }
});
