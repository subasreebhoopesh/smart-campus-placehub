const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const HR = require('./models/HR');
const Application = require('./models/Application');
const Student = require('./models/Student');
const PlacementDrive = require('./models/PlacementDrive');
const Company = require('./models/Company');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

async function testHRAPI() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get HR user
    const hrUser = await User.findOne({ email: 'hr@google.com' });
    if (!hrUser) {
      console.error('HR user not found!');
      process.exit(1);
    }

    console.log('HR User found:', hrUser.email);

    // Get HR profile
    const hr = await HR.findOne({ userId: hrUser._id });
    if (!hr) {
      console.error('HR profile not found!');
      process.exit(1);
    }

    console.log('HR Company ID:', hr.companyId);

    // Get applications for this company
    console.log('\nFetching applications for company:', hr.companyId);
    
    const applications = await Application.find({ companyId: hr.companyId })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate({
        path: 'driveId',
        select: 'jobRole driveDate packageOffered'
      })
      .sort({ appliedDate: -1 });

    console.log(`Found ${applications.length} applications\n`);

    if (applications.length > 0) {
      applications.forEach(app => {
        console.log('Application:', {
          id: app._id,
          student: app.studentId.userId.name,
          email: app.studentId.userId.email,
          rollNumber: app.studentId.rollNumber,
          branch: app.studentId.branch,
          cgpa: app.studentId.cgpa,
          skills: app.studentId.skills,
          jobRole: app.driveId.jobRole,
          status: app.status
        });
      });
    }

    // Generate token for testing
    const token = jwt.sign(
      { id: hrUser._id, email: hrUser.email, role: hrUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('\n=== Test Token ===');
    console.log(token);
    console.log('\nUse this token in Authorization header:');
    console.log(`Bearer ${token}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testHRAPI();
