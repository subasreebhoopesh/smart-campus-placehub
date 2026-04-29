const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Student = require('../models/Student');
const PlacementDrive = require('../models/PlacementDrive');
const Company = require('../models/Company');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { calculateSkillMatch, getStatusBySkillMatch } = require('../utils/skillMatcher');
const { createNotification } = require('../utils/notificationHelper');
const { sendSelectionEmail, sendShortlistEmail, sendNewApplicationEmail, sendAdminPlacementEmail } = require('../utils/emailService');

// Apply for drive (Student only)
router.post('/', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { driveId } = req.body;
    const userId = req.user.id;

    // Get student
    const student = await Student.findOne({ userId }).populate('userId', 'name email');
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Check if resume is uploaded
    if (!student.resumeUrl) {
      return res.status(400).json({ 
        message: 'Resume required! Please upload your resume in your profile before applying.',
        requireResume: true
      });
    }

    // Check if skills are added
    if (!student.skills || student.skills.length === 0) {
      return res.status(400).json({ 
        message: 'Skills required! Please add your skills in your profile before applying.',
        requireSkills: true
      });
    }

    // Get drive
    const drive = await PlacementDrive.findById(driveId).populate('companyId');
    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }

    // Check if already applied
    const existing = await Application.findOne({ studentId: student._id, driveId });
    if (existing) {
      return res.status(400).json({ message: 'Already applied for this drive' });
    }

    // Get company to check required skills
    const company = await Company.findById(drive.companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Calculate skill match
    const skillMatch = calculateSkillMatch(student.skills, company.requiredSkills || []);
    const autoStatus = getStatusBySkillMatch(skillMatch.matchPercentage, skillMatch.totalMatched);
    const isAutoShortlisted = skillMatch.totalMatched >= 4 && skillMatch.matchPercentage >= 70;
    const isAutoSelected = skillMatch.totalMatched >= 4 && skillMatch.matchPercentage >= 75;

    console.log('Skill Match Result:', {
      studentSkills: student.skills,
      requiredSkills: company.requiredSkills,
      matchPercentage: skillMatch.matchPercentage,
      totalMatched: skillMatch.totalMatched,
      minimumSkillsRequired: 4,
      meetsMinimum: skillMatch.totalMatched >= 4,
      autoStatus,
      isAutoShortlisted,
      isAutoSelected
    });

    // Create application with skill match data
    const application = new Application({
      studentId: student._id,
      driveId,
      companyId: drive.companyId,
      status: autoStatus,
      skillMatchPercentage: skillMatch.matchPercentage,
      matchedSkills: skillMatch.matchedSkills,
      missingSkills: skillMatch.missingSkills,
      autoShortlisted: isAutoShortlisted
    });

    await application.save();

    // Update registered students count
    drive.registeredStudents += 1;
    
    // If auto-selected, also update selected students count
    if (isAutoSelected) {
      drive.selectedStudents = (drive.selectedStudents || 0) + 1;
    }
    
    await drive.save();

    // Send notifications based on status
    if (isAutoSelected) {
      // Send EMAIL to student
      await sendSelectionEmail(
        student.userId.email,
        student.userId.name,
        company.name,
        drive.jobRole,
        drive.packageOffered
      );

      // Notify student about auto-selection
      await createNotification({
        recipientId: userId,
        title: '🎊 Congratulations! Auto-Selected!',
        message: `Amazing! You have been automatically SELECTED for ${company.name} - ${drive.jobRole} based on ${skillMatch.matchPercentage}% skill match. Your skills perfectly align with the company requirements!`,
        type: 'placement',
        priority: 'high',
        relatedId: application._id.toString(),
        relatedType: 'application'
      });

      // Notify admin about auto-selection
      const User = require('../models/User');
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        // Send EMAIL to admin
        await sendAdminPlacementEmail(
          admin.email,
          student.userId.name,
          company.name,
          drive.jobRole,
          drive.packageOffered
        );

        await createNotification({
          recipientId: admin._id.toString(),
          title: '🎉 Student Auto-Selected!',
          message: `${student.userId.name} (${student.rollNumber}) was automatically SELECTED for ${company.name} - ${drive.jobRole} with ${skillMatch.matchPercentage}% skill match.`,
          type: 'placement',
          priority: 'high',
          relatedId: application._id.toString(),
          relatedType: 'application'
        });
      }

      // Notify HR about auto-selection
      const HR = require('../models/HR');
      const hrs = await HR.find({ companyId: company._id }).populate('userId');
      for (const hr of hrs) {
        if (hr.userId) {
          // Send EMAIL to HR
          await sendNewApplicationEmail(
            hr.userId.email,
            hr.userId.name,
            student.userId.name,
            drive.jobRole,
            skillMatch.matchPercentage
          );

          await createNotification({
            recipientId: hr.userId._id.toString(),
            title: '✨ Student Auto-Selected',
            message: `${student.userId.name} (${student.rollNumber}) was automatically selected for ${drive.jobRole} position with ${skillMatch.matchPercentage}% skill match.`,
            type: 'application',
            priority: 'high',
            relatedId: application._id.toString(),
            relatedType: 'application'
          });
        }
      }
    } else if (isAutoShortlisted) {
      // Send EMAIL to student
      await sendShortlistEmail(
        student.userId.email,
        student.userId.name,
        company.name,
        drive.jobRole
      );

      // Notify student about auto-shortlisting
      await createNotification({
        recipientId: userId,
        title: '🎉 Auto-Shortlisted!',
        message: `Congratulations! You have been automatically shortlisted for ${company.name} - ${drive.jobRole} based on ${skillMatch.matchPercentage}% skill match.`,
        type: 'application',
        priority: 'high',
        relatedId: application._id.toString(),
        relatedType: 'application'
      });

      // Notify admin about auto-shortlisting
      const User = require('../models/User');
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await createNotification({
          recipientId: admin._id.toString(),
          title: '✨ Student Auto-Shortlisted',
          message: `${student.userId.name} (${student.rollNumber}) was automatically shortlisted for ${company.name} - ${drive.jobRole} with ${skillMatch.matchPercentage}% skill match.`,
          type: 'application',
          priority: 'normal',
          relatedId: application._id.toString(),
          relatedType: 'application'
        });
      }

      // Notify HR about new application
      const HR = require('../models/HR');
      const hrs = await HR.find({ companyId: company._id }).populate('userId');
      for (const hr of hrs) {
        if (hr.userId) {
          // Send EMAIL to HR
          await sendNewApplicationEmail(
            hr.userId.email,
            hr.userId.name,
            student.userId.name,
            drive.jobRole,
            skillMatch.matchPercentage
          );
        }
      }
    } else {
      // For regular applications, still notify HR
      const HR = require('../models/HR');
      const hrs = await HR.find({ companyId: company._id }).populate('userId');
      for (const hr of hrs) {
        if (hr.userId) {
          // Send EMAIL to HR
          await sendNewApplicationEmail(
            hr.userId.email,
            hr.userId.name,
            student.userId.name,
            drive.jobRole,
            skillMatch.matchPercentage
          );
        }
      }
    }

    res.json({
      ...application.toObject(),
      autoShortlisted: isAutoShortlisted,
      autoSelected: isAutoSelected,
      skillMatchPercentage: skillMatch.matchPercentage,
      message: isAutoSelected
        ? `🎊 Congratulations! You have been automatically SELECTED with ${skillMatch.matchPercentage}% skill match!`
        : isAutoShortlisted 
        ? `Application submitted successfully! You have been auto-shortlisted with ${skillMatch.matchPercentage}% skill match.`
        : `Application submitted successfully! Skill match: ${skillMatch.matchPercentage}%`
    });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ message: 'Failed to apply' });
  }
});

// Get student applications
router.get('/student', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Student Applications - User ID from token:', userId);
    console.log('Student Applications - User email:', req.user.email);

    // Get student
    const student = await Student.findOne({ userId });
    if (!student) {
      console.log('Student profile not found for user:', userId);
      return res.json([]);
    }

    console.log('Student found:', student.rollNumber, student.branch);
    console.log('Student _id:', student._id);

    // Get applications for THIS student only
    const applications = await Application.find({ studentId: student._id })
      .populate({
        path: 'driveId',
        populate: { path: 'companyId', select: 'name' }
      })
      .sort({ appliedDate: -1 });

    console.log(`Found ${applications.length} applications for student ${student.rollNumber}`);

    // Filter out applications with deleted drives and format response
    const formattedApplications = applications
      .filter(app => app.driveId && app.driveId.companyId) // Skip applications with deleted drives/companies
      .map(app => ({
        id: app._id,
        company_name: app.driveId.companyId.name,
        job_role: app.driveId.jobRole,
        package_offered: app.driveId.packageOffered,
        drive_date: app.driveId.driveDate,
        status: app.status,
        remarks: app.remarks || '',
        admin_remarks: app.adminRemarks || '',
        hr_remarks: app.hrRemarks || app.remarks || '',
        applied_date: app.appliedDate,
        skillMatchPercentage: app.skillMatchPercentage || 0,
        matchedSkills: app.matchedSkills || [],
        missingSkills: app.missingSkills || [],
        autoShortlisted: app.autoShortlisted || false,
        hasOfferLetter: !!app.offerLetterPath
      }));

    console.log('Returning applications:', formattedApplications.map(a => ({ id: a.id, company: a.company_name })));
    res.json(formattedApplications);
  } catch (error) {
    console.error('Get student applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

// Get HR applications (HR only)
router.get('/hr', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('HR Applications - User ID:', userId);

    // Get HR profile to find their company
    const HR = require('../models/HR');
    const hr = await HR.findOne({ userId });
    if (!hr) {
      console.log('HR profile not found for user:', userId);
      return res.status(404).json({ message: 'HR profile not found' });
    }

    console.log('HR Company ID:', hr.companyId);

    // Get all applications for this company's drives
    const applications = await Application.find({ companyId: hr.companyId })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate({
        path: 'driveId',
        select: 'jobRole driveDate packageOffered'
      })
      .sort({ appliedDate: -1 });

    console.log(`Found ${applications.length} applications for company ${hr.companyId}`);

    // Filter out applications with deleted drives and format response with student details
    const formattedApplications = applications
      .filter(app => app.driveId && app.studentId && app.studentId.userId) // Skip applications with deleted drives or students
      .map(app => {
        const student = app.studentId;
        const user = student.userId;
        
        return {
          id: app._id,
          studentId: student._id,
          studentName: user.name,
          studentEmail: user.email,
          rollNumber: student.rollNumber,
          branch: student.branch,
          cgpa: student.cgpa,
          skills: student.skills || [],
          resumeUrl: student.resumeUrl || '',
          appliedDate: app.appliedDate.toISOString().split('T')[0],
          status: app.status,
          remarks: app.remarks || '',
          companyId: app.companyId,
          driveId: app.driveId._id,
          jobRole: app.driveId.jobRole,
          phone: student.phone || '',
          linkedin: student.linkedin || '',
          github: student.github || '',
          tenthPercentage: student.tenthPercentage || 0,
          twelfthPercentage: student.twelfthPercentage || 0,
          projects: student.projects || [],
          skillMatchPercentage: app.skillMatchPercentage || 0,
          matchedSkills: app.matchedSkills || [],
          missingSkills: app.missingSkills || [],
          autoShortlisted: app.autoShortlisted || false
        };
      });

    console.log('Returning formatted applications:', formattedApplications.length);
    res.json(formattedApplications);
  } catch (error) {
    console.error('Get HR applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

// Update application status (HR only)
router.put('/:id/status', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const { status, remarks } = req.body;

    console.log('HR updating application status:', req.params.id);
    console.log('Status:', status, 'Remarks:', remarks);

    const application = await Application.findById(req.params.id)
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

    const previousStatus = application.status;
    
    // Update application
    application.status = status;
    application.remarks = remarks; // Keep for backward compatibility
    application.hrRemarks = remarks; // Explicit HR remarks
    await application.save();

    // Update PlacementDrive counts when status changes
    const drive = await PlacementDrive.findById(application.driveId);
    if (drive) {
      // Recalculate selected count from DB
      const selectedCount = await Application.countDocuments({ driveId: drive._id, status: 'selected' });
      const shortlistedCount = await Application.countDocuments({ driveId: drive._id, status: 'shortlisted' });
      drive.selectedStudents = selectedCount;
      // Auto-complete: if selected count reaches required students, mark as completed
      const required = drive.requiredStudents || 1;
      if (selectedCount >= required && drive.status !== 'completed') {
        drive.status = 'completed';
        console.log(`Drive ${drive._id} auto-completed: ${selectedCount}/${required} students selected`);
      }
      await drive.save();
    }

    // If status changed to "selected", send placement notification
    if (status === 'selected' && previousStatus !== 'selected') {
      const student = application.studentId;
      const drive = application.driveId;
      const company = drive.companyId;

      // Notify all admins about the placement
      const User = require('../models/User');
      const admins = await User.find({ role: 'admin' });
      
      for (const admin of admins) {
        await createNotification({
          recipientId: admin._id.toString(),
          title: '🎉 Student Placed!',
          message: `${student.userId.name} (${student.rollNumber}) has been placed at ${company.name} for ${drive.jobRole} position.`,
          type: 'placement',
          priority: 'high',
          relatedId: application._id.toString(),
          relatedType: 'application'
        });
      }

      // Notify the student
      await createNotification({
        recipientId: student.userId._id.toString(),
        title: '🎊 Congratulations! You are Selected!',
        message: `You have been selected for ${drive.jobRole} position at ${company.name}. Congratulations on your placement!`,
        type: 'placement',
        priority: 'high',
        relatedId: application._id.toString(),
        relatedType: 'application'
      });

      console.log('Placement notifications sent by HR');
    }

    console.log('Application updated by HR successfully');
    res.json(application);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

// Get all applications (Admin only)
router.get('/admin/all', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    console.log('Admin fetching all applications...');

    // Get all applications
    const applications = await Application.find()
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate({
        path: 'driveId',
        populate: { path: 'companyId', select: 'name' }
      })
      .sort({ appliedDate: -1 });

    console.log(`Found ${applications.length} total applications`);

    // Filter out applications with deleted drives/students and format response
    const formattedApplications = applications
      .filter(app => app.driveId && app.driveId.companyId && app.studentId && app.studentId.userId)
      .map(app => {
        const student = app.studentId;
        const user = student.userId;
        const drive = app.driveId;
        const company = drive.companyId;
        
        return {
          id: app._id,
          studentId: student._id,
          student_name: user.name,
          student_email: user.email,
          roll_number: student.rollNumber,
          branch: student.branch,
          cgpa: student.cgpa,
          skills: student.skills || [],
          company_name: company.name,
          job_role: drive.jobRole,
          package_offered: drive.packageOffered,
          drive_date: drive.driveDate,
          applied_date: app.appliedDate,
          status: app.status,
          remarks: app.remarks || '',
          admin_remarks: app.adminRemarks || '',
          hr_remarks: app.hrRemarks || app.remarks || '', // HR remarks
          skillMatchPercentage: app.skillMatchPercentage || 0,
          matchedSkills: app.matchedSkills || [],
          missingSkills: app.missingSkills || [],
          autoShortlisted: app.autoShortlisted || false
        };
      });

    console.log('Returning formatted applications:', formattedApplications.length);
    res.json(formattedApplications);
  } catch (error) {
    console.error('Get admin applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

// Admin respond to application (Admin only)
router.put('/admin/:id/respond', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;

    console.log('Admin responding to application:', req.params.id);
    console.log('Status:', status, 'Remarks:', adminRemarks);

    const application = await Application.findById(req.params.id)
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

    const previousStatus = application.status;
    
    // Update application
    application.status = status;
    application.adminRemarks = adminRemarks;
    application.remarks = adminRemarks; // Backward compatibility
    await application.save();

    // Update PlacementDrive selected count
    const driveDoc = await PlacementDrive.findById(application.driveId);
    if (driveDoc) {
      const selectedCount = await Application.countDocuments({ driveId: driveDoc._id, status: 'selected' });
      driveDoc.selectedStudents = selectedCount;
      const required = driveDoc.requiredStudents || 1;
      if (selectedCount >= required && driveDoc.status !== 'completed') {
        driveDoc.status = 'completed';
        console.log(`Drive ${driveDoc._id} auto-completed by admin: ${selectedCount}/${required}`);
      }
      await driveDoc.save();
    }

    // If status changed to "selected", send placement notification to admin
    if (status === 'selected' && previousStatus !== 'selected') {
      const student = application.studentId;
      const drive = application.driveId;
      const company = drive.companyId;

      // Notify all admins about the placement
      const User = require('../models/User');
      const admins = await User.find({ role: 'admin' });
      
      for (const admin of admins) {
        await createNotification({
          recipientId: admin._id.toString(),
          title: '🎉 Student Placed!',
          message: `${student.userId.name} (${student.rollNumber}) has been placed at ${company.name} for ${drive.jobRole} position.`,
          type: 'placement',
          priority: 'high',
          relatedId: application._id.toString(),
          relatedType: 'application'
        });
      }

      // Notify the student
      await createNotification({
        recipientId: student.userId._id.toString(),
        title: '🎊 Congratulations! You are Selected!',
        message: `You have been selected for ${drive.jobRole} position at ${company.name}. Congratulations on your placement!`,
        type: 'placement',
        priority: 'high',
        relatedId: application._id.toString(),
        relatedType: 'application'
      });

      console.log('Placement notifications sent to admin and student');
    }

    console.log('Application updated successfully');
    res.json({ success: true, application });
  } catch (error) {
    console.error('Admin respond error:', error);
    res.status(500).json({ message: 'Failed to send response' });
  }
});

module.exports = router;
