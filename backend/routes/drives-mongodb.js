const express = require('express');
const router = express.Router();
const PlacementDrive = require('../models/PlacementDrive');
const Company = require('../models/Company');
const { authMiddleware, requireRole } = require('../middleware/auth');

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
