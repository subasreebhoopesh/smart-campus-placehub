const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  jobRole: {
    type: String,
    required: true
  },
  driveDate: {
    type: Date,
    required: true
  },
  eligibleBranches: {
    type: [String],
    required: true
  },
  minCgpa: {
    type: Number,
    required: true
  },
  packageOffered: {
    type: Number,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  },
  registeredStudents: {
    type: Number,
    default: 0
  },
  selectedStudents: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);
