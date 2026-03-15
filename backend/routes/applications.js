const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Apply for drive (Student only)
router.post('/', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { driveId } = req.body;
    const userId = req.user.id;

    // Get student ID
    const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [userId]);
    if (students.length === 0) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    const studentId = students[0].id;

    // Get drive details
    const [drives] = await db.query('SELECT company_id FROM placement_drives WHERE id = ?', [driveId]);
    if (drives.length === 0) {
      return res.status(404).json({ message: 'Drive not found' });
    }
    const companyId = drives[0].company_id;

    // Check if already applied
    const [existing] = await db.query(
      'SELECT id FROM applications WHERE student_id = ? AND drive_id = ?',
      [studentId, driveId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already applied for this drive' });
    }

    // Create application
    const [result] = await db.query(
      'INSERT INTO applications (student_id, drive_id, company_id, status) VALUES (?, ?, ?, ?)',
      [studentId, driveId, companyId, 'applied']
    );

    res.json({ id: result.insertId, status: 'applied' });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ message: 'Failed to apply' });
  }
});

// Get student applications
router.get('/student', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get student ID
    const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [userId]);
    if (students.length === 0) {
      return res.json([]);
    }
    const studentId = students[0].id;

    // Get applications
    const [applications] = await db.query(
      `SELECT a.*, c.name as company_name, d.job_role, d.drive_date, d.package_offered
       FROM applications a
       JOIN companies c ON a.company_id = c.id
       JOIN placement_drives d ON a.drive_id = d.id
       WHERE a.student_id = ?
       ORDER BY a.applied_date DESC`,
      [studentId]
    );

    res.json(applications);
  } catch (error) {
    console.error('Get student applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

// Get HR applications
router.get('/hr', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, companyId } = req.query;

    // Get HR company
    let hrCompanyId = companyId;
    if (!hrCompanyId) {
      const [hr] = await db.query('SELECT company_id FROM hr WHERE user_id = ? LIMIT 1', [userId]);
      if (hr.length === 0) {
        return res.json({ success: true, applications: [] });
      }
      hrCompanyId = hr[0].company_id;
    }

    // Build query
    let query = `
      SELECT a.*, 
             u.name as student_name, u.email as student_email,
             s.roll_number, s.branch, s.cgpa, s.skills, s.resume_url,
             d.job_role, d.drive_date
      FROM applications a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN placement_drives d ON a.drive_id = d.id
      WHERE a.company_id = ?
    `;
    const params = [hrCompanyId];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.applied_date DESC';

    const [applications] = await db.query(query, params);

    // Parse skills JSON
    const formattedApplications = applications.map(app => ({
      ...app,
      skills: JSON.parse(app.skills || '[]')
    }));

    res.json({ success: true, applications: formattedApplications });
  } catch (error) {
    console.error('Get HR applications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
});

// Update application status (HR only)
router.put('/:id/status', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const applicationId = req.params.id;

    await db.query(
      'UPDATE applications SET status = ?, remarks = ? WHERE id = ?',
      [status, remarks, applicationId]
    );

    res.json({ message: 'Application status updated' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

module.exports = router;
