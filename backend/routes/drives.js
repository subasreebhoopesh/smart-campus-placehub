const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Get all drives
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, branch } = req.query;
    
    let query = `
      SELECT d.*, c.name as company_name 
      FROM placement_drives d 
      JOIN companies c ON d.company_id = c.id 
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND d.status = ?';
      params.push(status);
    }

    if (branch) {
      query += ' AND FIND_IN_SET(?, d.eligible_branches) > 0';
      params.push(branch);
    }

    query += ' ORDER BY d.drive_date DESC';

    const [drives] = await db.query(query, params);
    
    res.json(drives);
  } catch (error) {
    console.error('Get drives error:', error);
    res.status(500).json({ message: 'Failed to fetch drives' });
  }
});

// Create drive (Admin only)
router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const {
      companyId, jobRole, driveDate, eligibleBranches,
      minCgpa, packageOffered, description
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO placement_drives 
       (company_id, job_role, drive_date, eligible_branches, min_cgpa, package_offered, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [companyId, jobRole, driveDate, JSON.stringify(eligibleBranches), 
       minCgpa, packageOffered, description]
    );

    res.json({ success: true, drive: { id: result.insertId } });
  } catch (error) {
    console.error('Create drive error:', error);
    res.status(500).json({ success: false, message: 'Failed to create drive' });
  }
});

// Update drive
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const {
      companyId, jobRole, driveDate, eligibleBranches,
      minCgpa, packageOffered, description, status
    } = req.body;

    await db.query(
      `UPDATE placement_drives SET 
       company_id = ?, job_role = ?, drive_date = ?, eligible_branches = ?, 
       min_cgpa = ?, package_offered = ?, description = ?, status = ? 
       WHERE id = ?`,
      [companyId, jobRole, driveDate, JSON.stringify(eligibleBranches),
       minCgpa, packageOffered, description, status, req.params.id]
    );

    res.json({ success: true, message: 'Drive updated successfully' });
  } catch (error) {
    console.error('Update drive error:', error);
    res.status(500).json({ success: false, message: 'Failed to update drive' });
  }
});

// Delete drive
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM placement_drives WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Drive deleted successfully' });
  } catch (error) {
    console.error('Delete drive error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete drive' });
  }
});

module.exports = router;
