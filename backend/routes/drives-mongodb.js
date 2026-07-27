const express = require('express');
const router = express.Router();
const PlacementDrive = require('../models/PlacementDrive');
const Company = require('../models/Company');
const Assessment = require('../models/Assessment');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { generateQuestions } = require('../utils/questionBank');

/**
 * Map job role to relevant skill topics for MCQ generation
 */
function mapJobRoleToSkills(jobRole) {
  const role = (jobRole || '').toLowerCase();
  if (/software engineer|full stack|web developer/.test(role)) {
    return ['javascript', 'react', 'data structures'];
  }
  if (/backend developer|java developer/.test(role)) {
    return ['java', 'sql', 'data structures'];
  }
  if (/python developer|data analyst|ml engineer/.test(role)) {
    return ['python', 'sql', 'data structures'];
  }
  if (/database administrator/.test(role)) {
    return ['sql', 'mongodb'];
  }
  if (/frontend developer/.test(role)) {
    return ['javascript', 'react'];
  }
  return ['javascript', 'data structures', 'default'];
}

/**
 * Notify all applied students about the scheduled assessment
 */
async function notifyStudentsOfAssessment(driveId, assessment, companyName, scheduledStart, scheduledEnd) {
  try {
    const Application = require('../models/Application');
    const Student = require('../models/Student');
    const { createNotification } = require('../utils/notificationHelper');

    const applications = await Application.find({
      driveId,
      status: { $in: ['applied', 'shortlisted', 'pending'] }
    }).populate({ path: 'studentId', populate: { path: 'userId', select: 'name email _id' } });

    const startStr = new Date(scheduledStart).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const endStr = new Date(scheduledEnd).toLocaleTimeString('en-IN', { timeStyle: 'short' });

    for (const app of applications) {
      const userId = app.studentId?.userId?._id?.toString();
      if (!userId) continue;

      await createNotification({
        recipientId: userId,
        title: '📝 Online Test Scheduled!',
        message: `${companyName} has scheduled an online MCQ test for you. Test window: ${startStr} to ${endStr}. Click to take the test before time runs out!`,
        type: 'assessment',
        priority: 'urgent',
        relatedId: assessment._id.toString(),
        relatedType: 'assessment'
      });
    }

    // Mark notification as sent
    await Assessment.findByIdAndUpdate(assessment._id, { notificationSent: true });
    console.log(`Notified ${applications.length} students about assessment for drive ${driveId}`);
  } catch (err) {
    console.error('notifyStudentsOfAssessment error:', err);
  }
}

// Get all drives
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, branch } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (branch) query.eligibleBranches = branch;

    const drives = await PlacementDrive.find(query)
      .populate('companyId', 'name requiredSkills')
      .sort({ driveDate: -1 });

    // Format response to match frontend expectations
    // Filter out drives with deleted companies and format the rest
    const formattedDrives = drives
      .filter(drive => drive.companyId)
      .map(drive => ({
        id: drive._id,
        company_id: drive.companyId._id,
        company_name: drive.companyId.name,
        required_skills: drive.companyId.requiredSkills || [],
        job_role: drive.jobRole,
        drive_date: drive.driveDate,
        eligible_branches: drive.eligibleBranches.join(','),
        min_cgpa: drive.minCgpa,
        package_offered: drive.packageOffered,
        description: drive.description,
        status: drive.status,
        registered_students: drive.registeredStudents,
        selected_students: drive.selectedStudents,
        required_students: drive.requiredStudents || 1,
        created_at: drive.createdAt
      }));

    res.json(formattedDrives);
  } catch (error) {
    console.error('Get drives error:', error);
    res.status(500).json({ message: 'Failed to fetch drives' });
  }
});

// Get single drive
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id).populate('companyId');
    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }
    res.json(drive);
  } catch (error) {
    console.error('Get drive error:', error);
    res.status(500).json({ message: 'Failed to fetch drive' });
  }
});

// HR: Create drive for their own company
router.post('/hr', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const HR = require('../models/HR');
    const hrRecord = await HR.findOne({ userId: req.user.id }).populate('companyId');
    if (!hrRecord || !hrRecord.companyId) {
      return res.status(403).json({ message: 'HR record or company not found' });
    }

    const { jobRole, driveDate, eligibleBranches, minCgpa, packageOffered, description, requiredStudents, interviewRounds, assessmentSchedule } = req.body;

    if (!jobRole || !driveDate) {
      return res.status(400).json({ message: 'Job role and drive date are required' });
    }

    const branchesArray = typeof eligibleBranches === 'string'
      ? eligibleBranches.split(',').map(b => b.trim()).filter(Boolean)
      : (eligibleBranches || []);

    // Validate and normalise interview rounds
    const roundsArray = Array.isArray(interviewRounds) ? interviewRounds.map((r, i) => ({
      roundNumber: r.roundNumber || i + 1,
      roundType: r.roundType,
      description: r.description || ''
    })) : [];

    const drive = new PlacementDrive({
      companyId: hrRecord.companyId._id,
      jobRole,
      driveDate,
      eligibleBranches: branchesArray,
      minCgpa: parseFloat(minCgpa) || 0,
      packageOffered: parseFloat(packageOffered) || 0,
      description: description || '',
      requiredStudents: parseInt(requiredStudents) || 1,
      interviewRounds: roundsArray,
      status: 'upcoming'
    });

    await drive.save();
    await drive.populate('companyId', 'name');

    // Auto-create MCQ assessment if any round is "online_mcq"
    const hasMcqRound = roundsArray.some(r => r.roundType === 'online_mcq');
    let assessmentCreated = false;
    let assessmentId = null;

    if (hasMcqRound) {
      try {
        const skills = mapJobRoleToSkills(jobRole);
        const questions = generateQuestions(skills, 20, 0); // 20 MCQ, 0 coding
        const totalMarks = questions.reduce((sum, q) => sum + (q.points || 10), 0);

        // Parse schedule if provided
        const scheduledStart = assessmentSchedule?.startTime ? new Date(assessmentSchedule.startTime) : null;
        const scheduledEnd = assessmentSchedule?.endTime ? new Date(assessmentSchedule.endTime) : null;

        const assessment = new Assessment({
          driveId: drive._id,
          companyId: hrRecord.companyId._id,
          title: `${jobRole} - Online Assessment`,
          description: `Online MCQ assessment for ${jobRole} at ${hrRecord.companyId.name}. Topics: ${skills.join(', ')}.`,
          duration: 30, // 30 minutes
          totalMarks,
          passingMarks: Math.round(totalMarks * 0.5),
          questions,
          scheduledStart,
          scheduledEnd
        });

        await assessment.save();
        assessmentCreated = true;
        assessmentId = assessment._id;

        // If schedule is set, immediately notify all students who applied to this drive
        if (scheduledStart && scheduledEnd) {
          // Notify async — don't wait
          notifyStudentsOfAssessment(drive._id, assessment, hrRecord.companyId.name, scheduledStart, scheduledEnd)
            .catch(err => console.error('Notification error:', err));
        }
      } catch (assessErr) {
        console.error('Auto-create assessment error:', assessErr);
      }
    }

    res.status(201).json({
      success: true,
      message: `Drive created for ${hrRecord.companyId.name}${assessmentCreated ? '. Online MCQ assessment auto-generated.' : ''}`,
      drive,
      assessmentCreated
    });
  } catch (error) {
    console.error('HR create drive error:', error);
    res.status(500).json({ message: 'Failed to create drive: ' + error.message });
  }
});

// HR: Get drives for their company
router.get('/hr/my-drives', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const HR = require('../models/HR');
    const hrRecord = await HR.findOne({ userId: req.user.id });
    if (!hrRecord) return res.status(403).json({ message: 'HR record not found' });

    const drives = await PlacementDrive.find({ companyId: hrRecord.companyId })
      .populate('companyId', 'name requiredSkills')
      .sort({ driveDate: -1 });

    const formattedDrives = drives.filter(d => d.companyId).map(drive => ({
      id: drive._id,
      company_id: drive.companyId._id,
      company_name: drive.companyId.name,
      job_role: drive.jobRole,
      drive_date: drive.driveDate,
      eligible_branches: Array.isArray(drive.eligibleBranches) ? drive.eligibleBranches.join(', ') : '',
      min_cgpa: drive.minCgpa,
      package_offered: drive.packageOffered,
      description: drive.description,
      status: drive.status,
      registered_students: drive.registeredStudents,
      selected_students: drive.selectedStudents,
      created_at: drive.createdAt
    }));

    res.json({ success: true, drives: formattedDrives });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch drives' });
  }
});

// Create drive (Admin only)
router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { companyId, jobRole, driveDate, eligibleBranches, minCgpa, packageOffered, description, requiredStudents } = req.body;

    const branchesArray = typeof eligibleBranches === 'string' 
      ? eligibleBranches.split(',').map(b => b.trim())
      : eligibleBranches;

    const drive = new PlacementDrive({
      companyId,
      jobRole,
      driveDate,
      eligibleBranches: branchesArray,
      minCgpa,
      packageOffered,
      description,
      requiredStudents: parseInt(requiredStudents) || 1
    });

    await drive.save();
    await drive.populate('companyId', 'name');
    res.json(drive);
  } catch (error) {
    console.error('Create drive error:', error);
    res.status(500).json({ message: 'Failed to create drive' });
  }
});

// Update drive
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { companyId, jobRole, driveDate, eligibleBranches, minCgpa, packageOffered, description, status, requiredStudents } = req.body;

    const branchesArray = typeof eligibleBranches === 'string' 
      ? eligibleBranches.split(',').map(b => b.trim())
      : eligibleBranches;

    const drive = await PlacementDrive.findByIdAndUpdate(
      req.params.id,
      { companyId, jobRole, driveDate, eligibleBranches: branchesArray, minCgpa, packageOffered, description, status,
        ...(requiredStudents !== undefined && { requiredStudents: parseInt(requiredStudents) || 1 })
      },
      { new: true }
    ).populate('companyId');

    if (!drive) return res.status(404).json({ message: 'Drive not found' });
    res.json(drive);
  } catch (error) {
    console.error('Update drive error:', error);
    res.status(500).json({ message: 'Failed to update drive' });
  }
});

// Delete drive
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const drive = await PlacementDrive.findByIdAndDelete(req.params.id);
    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }
    res.json({ message: 'Drive deleted successfully' });
  } catch (error) {
    console.error('Delete drive error:', error);
    res.status(500).json({ message: 'Failed to delete drive' });
  }
});

module.exports = router;
