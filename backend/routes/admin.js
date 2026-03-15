const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Get admin dashboard stats
router.get('/stats', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const [studentCount] = await db.query('SELECT COUNT(*) as count FROM students');
    const [placedCount] = await db.query(
      `SELECT COUNT(DISTINCT student_id) as count FROM applications WHERE status = 'selected'`
    );
    const [companyCount] = await db.query('SELECT COUNT(*) as count FROM companies');
    const [driveCount] = await db.query(
      `SELECT COUNT(*) as count FROM placement_drives WHERE status IN ('upcoming', 'ongoing')`
    );
    const [applicationCount] = await db.query('SELECT COUNT(*) as count FROM applications');

    const stats = {
      totalStudents: studentCount[0].count,
      placedStudents: placedCount[0].count,
      totalCompanies: companyCount[0].count,
      activeDrives: driveCount[0].count,
      totalApplications: applicationCount[0].count
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// Create HR credential
router.post('/hr', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { email, password, name, companyId } = req.body;

    // Check if user exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await db.query(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, 'hr']
    );

    const userId = result.insertId;

    // Link to company
    await db.query(
      'INSERT INTO hr (user_id, company_id) VALUES (?, ?)',
      [userId, companyId]
    );

    res.json({ success: true, message: 'HR credential created', userId });
  } catch (error) {
    console.error('Create HR error:', error);
    res.status(500).json({ success: false, message: 'Failed to create HR credential' });
  }
});

// Get all HR credentials
router.get('/hr', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const [hrList] = await db.query(
      `SELECT u.id, u.email, u.name, h.company_id, c.name as company_name
       FROM users u
       JOIN hr h ON u.id = h.user_id
       JOIN companies c ON h.company_id = c.id
       WHERE u.role = 'hr'
       ORDER BY u.id DESC`
    );

    res.json({ success: true, hrCredentials: hrList });
  } catch (error) {
    console.error('Get HR list error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch HR credentials' });
  }
});

// Delete HR credential
router.delete('/hr/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ? AND role = ?', [req.params.id, 'hr']);
    res.json({ success: true, message: 'HR credential deleted' });
  } catch (error) {
    console.error('Delete HR error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete HR credential' });
  }
});

module.exports = router;
