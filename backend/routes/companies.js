const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Get all companies
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [companies] = await db.query('SELECT * FROM companies ORDER BY created_at DESC');
    
    // Parse JSON fields
    const formattedCompanies = companies.map(company => ({
      ...company,
      jobRoles: JSON.parse(company.job_roles || '[]'),
      packageOffered: {
        min: company.package_min,
        max: company.package_max
      }
    }));

    res.json({ success: true, companies: formattedCompanies });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch companies' });
  }
});

// Get single company
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [companies] = await db.query('SELECT * FROM companies WHERE id = ?', [req.params.id]);
    
    if (companies.length === 0) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const company = {
      ...companies[0],
      jobRoles: JSON.parse(companies[0].job_roles || '[]'),
      packageOffered: {
        min: companies[0].package_min,
        max: companies[0].package_max
      }
    };

    res.json({ success: true, company });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch company' });
  }
});

// Create company (Admin only)
router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const {
      name, industry, website, contactPerson, contactEmail, contactPhone,
      jobRoles, packageMin, packageMax
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO companies 
       (name, industry, website, contact_person, contact_email, contact_phone, job_roles, package_min, package_max) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, industry, website, contactPerson, contactEmail, contactPhone, 
       JSON.stringify(jobRoles), packageMin, packageMax]
    );

    const company = {
      id: result.insertId,
      name, industry, website, contactPerson, contactEmail, contactPhone,
      jobRoles,
      packageOffered: { min: packageMin, max: packageMax },
      createdAt: new Date()
    };

    res.json({ success: true, company });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ success: false, message: 'Failed to create company' });
  }
});

// Update company
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const {
      name, industry, website, contactPerson, contactEmail, contactPhone,
      jobRoles, packageMin, packageMax
    } = req.body;

    await db.query(
      `UPDATE companies SET 
       name = ?, industry = ?, website = ?, contact_person = ?, 
       contact_email = ?, contact_phone = ?, job_roles = ?, 
       package_min = ?, package_max = ? 
       WHERE id = ?`,
      [name, industry, website, contactPerson, contactEmail, contactPhone,
       JSON.stringify(jobRoles), packageMin, packageMax, req.params.id]
    );

    res.json({ success: true, message: 'Company updated successfully' });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ success: false, message: 'Failed to update company' });
  }
});

// Delete company
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM companies WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete company' });
  }
});

module.exports = router;
