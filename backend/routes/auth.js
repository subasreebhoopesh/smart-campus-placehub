const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, role, rollNumber, branch, companyId } = req.body;

    // Check if user exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, role]
    );

    const userId = result.insertId;

    // If student, create student profile
    if (role === 'student' && rollNumber && branch) {
      await db.query(
        'INSERT INTO students (user_id, roll_number, branch, skills) VALUES (?, ?, ?, ?)',
        [userId, rollNumber, branch, JSON.stringify([])]
      );
    }

    // If HR, link to company
    if (role === 'hr' && companyId) {
      await db.query(
        'INSERT INTO hr (user_id, company_id) VALUES (?, ?)',
        [userId, companyId]
      );
    }

    res.json({ success: true, message: 'Registration successful', userId });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Get additional data based on role
    let additionalData = {};

    if (user.role === 'hr') {
      // Get HR companies
      const [hrCompanies] = await db.query(
        `SELECT c.id, c.name FROM hr h 
         JOIN companies c ON h.company_id = c.id 
         WHERE h.user_id = ?`,
        [user.id]
      );
      additionalData.companies = hrCompanies;
    }

    if (user.role === 'student') {
      // Get student profile
      const [students] = await db.query(
        'SELECT * FROM students WHERE user_id = ?',
        [user.id]
      );
      if (students.length > 0) {
        additionalData.studentProfile = students[0];
      }
    }

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      ...additionalData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Select Company (HR)
router.post('/select-company', authMiddleware, async (req, res) => {
  try {
    const { companyId } = req.body;
    const userId = req.user.id;

    // Verify HR has access to this company
    const [hr] = await db.query(
      'SELECT * FROM hr WHERE user_id = ? AND company_id = ?',
      [userId, companyId]
    );

    if (hr.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get company details
    const [companies] = await db.query('SELECT id, name FROM companies WHERE id = ?', [companyId]);

    res.json({
      success: true,
      company: companies[0]
    });
  } catch (error) {
    console.error('Select company error:', error);
    res.status(500).json({ success: false, message: 'Failed to select company' });
  }
});

// Logout
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
