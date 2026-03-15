const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Get student profile
router.get('/profile', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const userId = req.user.id;

    const [students] = await db.query(
      `SELECT s.*, u.name, u.email 
       FROM students s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.user_id = ?`,
      [userId]
    );

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const profile = {
      ...students[0],
      skills: JSON.parse(students[0].skills || '[]')
    };

    res.json({ success: true, profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// Update student profile
router.put('/profile', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { cgpa, skills, tenthPercentage, twelfthPercentage, phone } = req.body;

    await db.query(
      `UPDATE students SET 
       cgpa = ?, skills = ?, tenth_percentage = ?, twelfth_percentage = ?, phone = ? 
       WHERE user_id = ?`,
      [cgpa, JSON.stringify(skills), tenthPercentage, twelfthPercentage, phone, userId]
    );

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// Get all students (Admin only)
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const [students] = await db.query(
      `SELECT s.*, u.name, u.email 
       FROM students s 
       JOIN users u ON s.user_id = u.id 
       ORDER BY s.id DESC`
    );

    const formattedStudents = students.map(student => ({
      ...student,
      skills: JSON.parse(student.skills || '[]')
    }));

    res.json({ success: true, students: formattedStudents });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
});

module.exports = router;
