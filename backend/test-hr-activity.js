const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal';

async function testHRActivity() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Application = require('./models/Application');
    const Student = require('./models/Student');
    const User = require('./models/User');
    const HR = require('./models/HR');
    const Company = require('./models/Company');

    // Find Wipro company
    const wipro = await Company.findOne({ name: /wipro/i });
    if (!wipro) {
      console.log('❌ Wipro company not found');
      process.exit(1);
    }
    console.log('✅ Found Wipro:', wipro.name);
    console.log('   Company ID:', wipro._id);

    // Get applications for Wipro
    console.log('\n📋 Fetching applications for Wipro...');
    const applications = await Application.find({ companyId: wipro._id })
      .sort({ appliedDate: -1 })
      .limit(10)
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'name email'
        },
        select: 'userId branch rollNumber'
      });

    console.log(`   Found ${applications.length} applications\n`);

    if (applications.length === 0) {
      console.log('⚠️  No applications found for Wipro');
      console.log('   This is why "Unknown Student" appears in the dashboard');
    } else {
      console.log('📊 Recent Applications:');
      console.log('='.repeat(80));
      
      applications.forEach((app, index) => {
        const studentName = app.studentId?.userId?.name || 'Unknown';
        const studentBranch = app.studentId?.branch || 'N/A';
        const rollNumber = app.studentId?.rollNumber || 'N/A';
        
        console.log(`${index + 1}. ${studentName} (${studentBranch})`);
        console.log(`   Roll: ${rollNumber}`);
        console.log(`   Status: ${app.status}`);
        console.log(`   Applied: ${app.appliedDate}`);
        console.log('   ' + '-'.repeat(76));
      });
    }

    // Check if there are any students in the database
    console.log('\n👥 Checking students in database...');
    const totalStudents = await Student.countDocuments();
    console.log(`   Total students: ${totalStudents}`);

    if (totalStudents > 0) {
      const sampleStudent = await Student.findOne().populate('userId', 'name email');
      console.log(`   Sample student: ${sampleStudent.userId?.name || 'No name'} (${sampleStudent.branch})`);
    }

    // Check total applications
    console.log('\n📝 Checking all applications...');
    const totalApps = await Application.countDocuments();
    console.log(`   Total applications: ${totalApps}`);

    if (totalApps > 0) {
      const sampleApp = await Application.findOne()
        .populate({
          path: 'studentId',
          populate: {
            path: 'userId',
            select: 'name email'
          }
        })
        .populate('companyId', 'name');
      
      console.log(`   Sample application:`);
      console.log(`   - Student: ${sampleApp.studentId?.userId?.name || 'Unknown'}`);
      console.log(`   - Company: ${sampleApp.companyId?.name || 'Unknown'}`);
      console.log(`   - Status: ${sampleApp.status}`);
    }

    console.log('\n✅ Test complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testHRActivity();
