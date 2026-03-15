const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Get required skills
router.get('/skills', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get HR company
    const [hr] = await db.query('SELECT company_id FROM hr WHERE user_id = ? LIMIT 1', [userId]);
    if (hr.length === 0) {
      return res.json({ success: true, skills: [] });
    }

    const companyId = hr[0].company_id;

    // Get skills
    const [skills] = await db.query(
      'SELECT skill_name FROM required_skills WHERE company_id = ?',
      [companyId]
    );

    const skillNames = skills.map(s => s.skill_name);

    res.json({ success: true, skills: skillNames });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch skills' });
  }
});

// Set required skills
router.post('/skills', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { skills } = req.body;

    // Get HR company
    const [hr] = await db.query('SELECT company_id FROM hr WHERE user_id = ? LIMIT 1', [userId]);
    if (hr.length === 0) {
      return res.status(404).json({ success: false, message: 'HR profile not found' });
    }

    const companyId = hr[0].company_id;

    // Delete existing skills
    await db.query('DELETE FROM required_skills WHERE company_id = ?', [companyId]);

    // Insert new skills
    if (skills && skills.length > 0) {
      const values = skills.map(skill => [companyId, skill]);
      await db.query(
        'INSERT INTO required_skills (company_id, skill_name) VALUES ?',
        [values]
      );
    }

    res.json({ success: true, skills });
  } catch (error) {
    console.error('Set skills error:', error);
    res.status(500).json({ success: false, message: 'Failed to set skills' });
  }
});

// Get HR dashboard stats
router.get('/stats', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get HR company
    const [hr] = await db.query('SELECT company_id FROM hr WHERE user_id = ? LIMIT 1', [userId]);
    if (hr.length === 0) {
      return res.json({ success: true, stats: {} });
    }

    const companyId = hr[0].company_id;

    // Get stats
    const [stats] = await db.query(
      `SELECT 
         COUNT(*) as total_applications,
         SUM(CASE WHEN status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted,
         SUM(CASE WHEN status = 'selected' THEN 1 ELSE 0 END) as selected,
         SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
         SUM(CASE WHEN status = 'on-hold' THEN 1 ELSE 0 END) as on_hold
       FROM applications 
       WHERE company_id = ?`,
      [companyId]
    );

    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

module.exports = router;
