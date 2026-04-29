const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const HR = require('../models/HR');
const { authMiddleware } = require('../middleware/auth');

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, role, rollNumber, branch, companyId } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role
    });

    await user.save();

    // If student, create student profile
    if (role === 'student' && rollNumber && branch) {
      const student = new Student({
        userId: user._id,
        rollNumber,
        branch
      });
      await student.save();
    }

    // If HR, link to company
    if (role === 'hr' && companyId) {
      const hr = new HR({
        userId: user._id,
        companyId
      });
      await hr.save();
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, expectedRole } = req.body;

    console.log('Login attempt:', { email, expectedRole });

    // Get user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if role matches expected role (if provided)
    if (expectedRole && user.role !== expectedRole) {
      console.log(`Role mismatch: User is ${user.role}, but tried to login as ${expectedRole}`);
      return res.status(403).json({ 
        message: `This account is registered as ${user.role}. Please use the correct login page.` 
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '30d' }
    );

    // Get additional data based on role
    let additionalData = {};

    if (user.role === 'hr') {
      const hrRecords = await HR.find({ userId: user._id }).populate('companyId');
      additionalData.companies = hrRecords
        .filter(hr => hr.companyId != null)
        .map(hr => ({
          id: hr.companyId._id,
          name: hr.companyId.name
        }));
    }

    if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        additionalData.studentProfile = student;
      }
    }

    console.log(`Login successful: ${user.email} as ${user.role}`);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      ...additionalData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Logout
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
