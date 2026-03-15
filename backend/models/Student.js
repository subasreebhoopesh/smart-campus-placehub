const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  branch: {
    type: String,
    required: true
  },
  cgpa: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  skills: {
    type: [String],
    default: []
  },
  projects: [{
    name: String,
    description: String,
    technologies: String,
    link: String
  }],
  resumeUrl: String,
  profilePhotoUrl: String,
  tenthPercentage: Number,
  twelfthPercentage: Number,
  phone: String,
  linkedin: String,
  github: String,
  about: String,
  // Document Verification
  documentVerificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationRemarks: {
    type: String,
    default: ''
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  // Student Ranking
  rankScore: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', studentSchema);
