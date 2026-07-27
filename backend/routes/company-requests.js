const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const CompanyRequest = require('../models/CompanyRequest');
const Company = require('../models/Company');
const User = require('../models/User');
const HR = require('../models/HR');
const { authMiddleware, requireRole } = require('../middleware/auth');

// ─── PUBLIC: Check registration request status by email ───────────────────
// GET /api/company-requests/status/:email  (no auth required)
router.get('/status/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const request = await CompanyRequest.findOne({ hrEmail: email }).sort({ createdAt: -1 });

    if (!request) {
      return res.json({ found: false, message: 'No registration request found for this email' });
    }

    res.json({
      found: true,
      status: request.status,
      companyName: request.companyName,
      submittedAt: request.createdAt,
      reviewedAt: request.reviewedAt,
      adminRemarks: request.adminRemarks || '',
      message: request.status === 'pending'
        ? 'Your request is under review. Please wait for admin approval.'
        : request.status === 'approved'
        ? 'Your request was approved! You can now login with your registered email and password.'
        : `Your request was rejected. Reason: ${request.adminRemarks || 'Not specified'}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check status' });
  }
});

// ─── PUBLIC: Company submits registration request ──────────────────────────────
// POST /api/company-requests/register  (no auth required)
router.post('/register', async (req, res) => {
  try {
    const {
      companyName, industry, website, jobRoles,
      packageMin, packageMax, requiredSkills,
      hrName, hrEmail, hrPhone, hrPassword
    } = req.body;

    if (!companyName || !hrName || !hrEmail || !hrPassword) {
      return res.status(400).json({ message: 'Company name, HR name, email and password are required' });
    }

    // Check if email already used
    const existing = await User.findOne({ email: hrEmail.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'This email is already registered' });
    }

    // Check if pending request already exists for same email
    const existingReq = await CompanyRequest.findOne({
      hrEmail: hrEmail.toLowerCase(),
      status: 'pending'
    });
    if (existingReq) {
      return res.status(400).json({ message: 'A request from this email is already under review' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(hrPassword, 10);

    const request = new CompanyRequest({
      companyName,
      industry: industry || '',
      website: website || '',
      jobRoles: jobRoles || [],
      packageMin: packageMin || 0,
      packageMax: packageMax || 0,
      requiredSkills: requiredSkills || [],
      hrName,
      hrEmail: hrEmail.toLowerCase(),
      hrPhone: hrPhone || '',
      hrPassword: hashedPassword
    });

    await request.save();

    res.status(201).json({
      success: true,
      message: 'Registration request submitted. You will be notified once approved by the admin.'
    });
  } catch (error) {
    console.error('Company register request error:', error);
    res.status(500).json({ message: 'Failed to submit request' });
  }
});

// ─── ADMIN: Get all requests ──────────────────────────────────────────────────
// GET /api/company-requests  (admin only)
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const requests = await CompanyRequest.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    console.error('Get company requests error:', error);
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
});

// ─── ADMIN: Approve request → auto-create Company + HR user ──────────────────
// PUT /api/company-requests/:id/approve  (admin only)
router.put('/:id/approve', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const request = await CompanyRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // 1. Create Company
    const company = new Company({
      name: request.companyName,
      industry: request.industry,
      website: request.website,
      contactPerson: request.hrName,
      contactEmail: request.hrEmail,
      contactPhone: request.hrPhone,
      jobRoles: request.jobRoles,
      packageOffered: { min: request.packageMin, max: request.packageMax },
      requiredSkills: request.requiredSkills,
      visitHistory: []
    });
    await company.save();

    // 2. Create HR User (password already hashed)
    const hrUser = new User({
      name: request.hrName,
      email: request.hrEmail,
      password: request.hrPassword, // already hashed during registration
      role: 'hr'
    });
    await hrUser.save();

    // 3. Create HR record linking user ↔ company
    const hr = new HR({
      userId: hrUser._id,
      companyId: company._id
    });
    await hr.save();

    // 4. Update request status
    request.status = 'approved';
    request.reviewedAt = new Date();
    request.companyId = company._id;
    request.hrUserId = hrUser._id;
    await request.save();

    res.json({
      success: true,
      message: `Approved! Company "${company.name}" created. HR login active for ${request.hrEmail}`,
      company: { id: company._id, name: company.name },
      hrEmail: request.hrEmail
    });
  } catch (error) {
    console.error('Approve company request error:', error);
    res.status(500).json({ message: 'Failed to approve request: ' + error.message });
  }
});

// ─── ADMIN: Reject request ─────────────────────────────────────────────────
// PUT /api/company-requests/:id/reject  (admin only)
router.put('/:id/reject', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { remarks } = req.body;
    const request = await CompanyRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    request.status = 'rejected';
    request.adminRemarks = remarks || '';
    request.reviewedAt = new Date();
    await request.save();

    res.json({ success: true, message: 'Request rejected' });
  } catch (error) {
    console.error('Reject company request error:', error);
    res.status(500).json({ message: 'Failed to reject request' });
  }
});

module.exports = router;
