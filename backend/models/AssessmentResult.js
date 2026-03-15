const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: mongoose.Schema.Types.ObjectId,
  type: String, // 'mcq' or 'coding'
  selectedAnswer: String, // for MCQ
  code: String, // for coding
  language: String, // for coding
  isCorrect: Boolean,
  pointsEarned: { type: Number, default: 0 },
  testCasesPassed: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 }
});

const assessmentResultSchema = new mongoose.Schema({
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true },
  answers: [answerSchema],
  totalScore: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  timeTaken: Number, // seconds
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['completed', 'in_progress'], default: 'completed' }
});

// One attempt per student per assessment
assessmentResultSchema.index({ assessmentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('AssessmentResult', assessmentResultSchema);
