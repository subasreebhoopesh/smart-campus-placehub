const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const Student = require('../models/Student');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { generateQuestions } = require('../utils/questionBank');

// ─── ADMIN: Generate assessment for a drive ───────────────────────────────────
router.post('/generate/:driveId', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const drive = await PlacementDrive.findById(req.params.driveId).populate('companyId');
    if (!drive) return res.status(404).json({ message: 'Drive not found' });

    const company = drive.companyId;
    const requiredSkills = company.requiredSkills || [];

    // Delete existing assessment for this drive
    await Assessment.deleteOne({ driveId: drive._id });

    const questions = generateQuestions(requiredSkills, 5, 2);
    const totalMarks = questions.reduce((sum, q) => sum + (q.points || 10), 0);

    const assessment = new Assessment({
      driveId: drive._id,
      companyId: company._id,
      title: `${company.name} - ${drive.jobRole} Assessment`,
      description: `Technical assessment for ${drive.jobRole} position at ${company.name}. Tests your knowledge in: ${requiredSkills.join(', ') || 'General Programming'}`,
      duration: 60,
      totalMarks,
      passingMarks: Math.round(totalMarks * 0.5),
      questions
    });

    await assessment.save();

    res.json({
      message: 'Assessment generated successfully',
      assessmentId: assessment._id,
      totalQuestions: questions.length,
      mcqCount: questions.filter(q => q.type === 'mcq').length,
      codingCount: questions.filter(q => q.type === 'coding').length,
      totalMarks,
      passingMarks: assessment.passingMarks
    });
  } catch (error) {
    console.error('Generate assessment error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate assessment' });
  }
});

// ─── ADMIN: Get all assessments ───────────────────────────────────────────────
router.get('/admin/all', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const assessments = await Assessment.find()
      .populate('driveId', 'jobRole driveDate status')
      .populate('companyId', 'name')
      .sort({ createdAt: -1 });

    const results = await Promise.all(assessments.map(async (a) => {
      const attempts = await AssessmentResult.countDocuments({ assessmentId: a._id });
      const passed = await AssessmentResult.countDocuments({ assessmentId: a._id, passed: true });
      return {
        id: a._id,
        title: a.title,
        companyName: a.companyId?.name,
        jobRole: a.driveId?.jobRole,
        driveStatus: a.driveId?.status,
        driveDate: a.driveId?.driveDate,
        totalMarks: a.totalMarks,
        passingMarks: a.passingMarks,
        duration: a.duration,
        questionCount: a.questions.length,
        mcqCount: a.questions.filter(q => q.type === 'mcq').length,
        codingCount: a.questions.filter(q => q.type === 'coding').length,
        attempts,
        passed,
        isActive: a.isActive,
        driveId: a.driveId?._id
      };
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch assessments' });
  }
});

// ─── ADMIN: Get results for an assessment ─────────────────────────────────────
router.get('/admin/results/:assessmentId', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const results = await AssessmentResult.find({ assessmentId: req.params.assessmentId })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
      .sort({ totalScore: -1 });

    const formatted = results.map(r => ({
      id: r._id,
      studentName: r.studentId?.userId?.name,
      studentEmail: r.studentId?.userId?.email,
      rollNumber: r.studentId?.rollNumber,
      branch: r.studentId?.branch,
      totalScore: r.totalScore,
      totalMarks: r.totalMarks,
      percentage: r.percentage,
      passed: r.passed,
      timeTaken: r.timeTaken,
      submittedAt: r.submittedAt
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch results' });
  }
});

// ─── STUDENT: Get all available assessments ───────────────────────────────────
router.get('/student/available', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const assessments = await Assessment.find({ isActive: true })
      .populate({ path: 'driveId', select: 'jobRole driveDate status' })
      .populate({ path: 'companyId', select: 'name' })
      .sort({ createdAt: -1 });

    const results = await Promise.all(assessments.map(async (a) => {
      const result = await AssessmentResult.findOne({
        assessmentId: a._id,
        studentId: student._id
      });
      return {
        id: a._id,
        title: a.title,
        description: a.description,
        companyName: a.companyId?.name,
        jobRole: a.driveId?.jobRole,
        driveDate: a.driveId?.driveDate,
        driveStatus: a.driveId?.status,
        driveId: a.driveId?._id,
        duration: a.duration,
        totalMarks: a.totalMarks,
        passingMarks: a.passingMarks,
        questionCount: a.questions.length,
        alreadyAttempted: !!result,
        result: result ? {
          totalScore: result.totalScore,
          percentage: result.percentage,
          passed: result.passed,
          submittedAt: result.submittedAt
        } : null
      };
    }));

    res.json(results);
  } catch (error) {
    console.error('Get available assessments error:', error);
    res.status(500).json({ message: 'Failed to fetch assessments' });
  }
});

// ─── STUDENT: Get assessment for a drive (without answers) ───────────────────
router.get('/drive/:driveId', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      driveId: req.params.driveId,
      isActive: true
    });

    if (!assessment) return res.json(null);

    // Check if student already attempted
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const existing = await AssessmentResult.findOne({
      assessmentId: assessment._id,
      studentId: student._id
    });

    // Return questions without correct answers
    const safeQuestions = assessment.questions.map(q => ({
      _id: q._id,
      type: q.type,
      question: q.question,
      description: q.description,
      options: q.options,
      starterCode: q.starterCode,
      testCases: q.testCases?.filter(tc => !tc.isHidden), // only show non-hidden test cases
      points: q.points,
      topic: q.topic
    }));

    res.json({
      id: assessment._id,
      title: assessment.title,
      description: assessment.description,
      duration: assessment.duration,
      totalMarks: assessment.totalMarks,
      passingMarks: assessment.passingMarks,
      questions: safeQuestions,
      alreadyAttempted: !!existing,
      result: existing ? {
        totalScore: existing.totalScore,
        percentage: existing.percentage,
        passed: existing.passed,
        submittedAt: existing.submittedAt
      } : null
    });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ message: 'Failed to fetch assessment' });
  }
});

// ─── STUDENT: Submit assessment ───────────────────────────────────────────────
router.post('/submit/:assessmentId', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;

    const assessment = await Assessment.findById(req.params.assessmentId);
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Check already attempted
    const existing = await AssessmentResult.findOne({
      assessmentId: assessment._id,
      studentId: student._id
    });
    if (existing) return res.status(400).json({ message: 'Already attempted this assessment' });

    let totalScore = 0;
    const gradedAnswers = [];

    for (const answer of answers) {
      const question = assessment.questions.id(answer.questionId);
      if (!question) continue;

      if (question.type === 'mcq') {
        const isCorrect = answer.selectedAnswer === question.correctAnswer;
        const pointsEarned = isCorrect ? question.points : 0;
        totalScore += pointsEarned;
        gradedAnswers.push({
          questionId: question._id,
          type: 'mcq',
          selectedAnswer: answer.selectedAnswer,
          isCorrect,
          pointsEarned
        });
      } else if (question.type === 'coding') {
        // Simple output matching for coding questions
        let testCasesPassed = 0;
        const totalTestCases = question.testCases.length;

        // We do basic string comparison of expected output
        // In production you'd run code in a sandbox
        const submittedOutput = (answer.output || '').trim();
        const allOutputs = answer.testOutputs || [];

        for (let i = 0; i < question.testCases.length; i++) {
          const expected = question.testCases[i].expectedOutput.trim();
          const actual = (allOutputs[i] || '').trim();
          if (actual === expected) testCasesPassed++;
        }

        const pointsEarned = Math.round((testCasesPassed / Math.max(totalTestCases, 1)) * question.points);
        totalScore += pointsEarned;

        gradedAnswers.push({
          questionId: question._id,
          type: 'coding',
          code: answer.code,
          language: answer.language,
          isCorrect: testCasesPassed === totalTestCases,
          pointsEarned,
          testCasesPassed,
          totalTestCases
        });
      }
    }

    const percentage = Math.round((totalScore / assessment.totalMarks) * 100);
    const passed = totalScore >= assessment.passingMarks;

    const result = new AssessmentResult({
      assessmentId: assessment._id,
      studentId: student._id,
      driveId: assessment.driveId,
      answers: gradedAnswers,
      totalScore,
      totalMarks: assessment.totalMarks,
      percentage,
      passed,
      timeTaken,
      status: 'completed'
    });

    await result.save();

    res.json({
      totalScore,
      totalMarks: assessment.totalMarks,
      percentage,
      passed,
      passingMarks: assessment.passingMarks,
      gradedAnswers,
      message: passed
        ? `Congratulations! You passed with ${percentage}% (${totalScore}/${assessment.totalMarks})`
        : `You scored ${percentage}% (${totalScore}/${assessment.totalMarks}). Passing score is ${assessment.passingMarks}.`
    });
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({ message: error.message || 'Failed to submit assessment' });
  }
});

// ─── STUDENT: Get my result for a drive ──────────────────────────────────────
router.get('/my-result/:driveId', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.json(null);

    const assessment = await Assessment.findOne({ driveId: req.params.driveId });
    if (!assessment) return res.json(null);

    const result = await AssessmentResult.findOne({
      assessmentId: assessment._id,
      studentId: student._id
    });

    if (!result) return res.json(null);

    res.json({
      totalScore: result.totalScore,
      totalMarks: result.totalMarks,
      percentage: result.percentage,
      passed: result.passed,
      submittedAt: result.submittedAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch result' });
  }
});

module.exports = router;
