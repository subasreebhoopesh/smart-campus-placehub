const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  driveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlacementDrive',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'selected', 'rejected', 'on hold'],
    default: 'applied'
  },
  skillMatchPercentage: {
    type: Number,
    default: 0
  },
  matchedSkills: {
    type: [String],
    default: []
  },
  missingSkills: {
    type: [String],
    default: []
  },
  autoShortlisted: {
    type: Boolean,
    default: false
  },
  remarks: String, // HR remarks
  adminRemarks: String, // Admin remarks
  hrRemarks: String, // Explicit HR remarks field
  offerLetterPath: String, // Path to uploaded offer letter PDF
  offerLetterUploadedAt: Date,
  appliedDate: {
    type: Date,
    default: Date.now
  }
});

// Ensure a student can only apply once per drive
applicationSchema.index({ studentId: 1, driveId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
