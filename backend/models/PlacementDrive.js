const mongoose = require('mongoose');

const interviewRoundSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  roundType: {
    type: String,
    enum: ['online_mcq', 'technical_interview', 'hr_interview', 'group_discussion', 'aptitude_test'],
    required: true
  },
  description: { type: String, default: '' }
}, { _id: false });

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
  requiredStudents: {
    type: Number,
    default: 1
  },
  interviewRounds: {
    type: [interviewRoundSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);
