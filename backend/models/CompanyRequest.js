const mongoose = require('mongoose');

const companyRequestSchema = new mongoose.Schema({
  // Company info submitted by HR
  companyName: { type: String, required: true, trim: true },
  industry: { type: String, default: '' },
  website: { type: String, default: '' },
  jobRoles: { type: [String], default: [] },
  packageMin: { type: Number, default: 0 },
  packageMax: { type: Number, default: 0 },
  requiredSkills: { type: [String], default: [] },

  // HR contact person info
  hrName: { type: String, required: true },
  hrEmail: { type: String, required: true, lowercase: true, trim: true },
  hrPhone: { type: String, default: '' },
  hrPassword: { type: String, required: true }, // hashed

  // Status: pending | approved | rejected
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminRemarks: { type: String, default: '' },
  reviewedAt: { type: Date },

  // After approval, link to created Company & User
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  hrUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CompanyRequest', companyRequestSchema);
