const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal';

async function checkApplications() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Application = require('./models/Application');
    const Student = require('./models/Student');
    const PlacementDrive = require('./models/PlacementDrive');
    const Company = require('./models/Company');
    const User = require('./models/User');
    const HR = require('./models/HR');

    // Get all applications
    const applications = await Application.find()
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate({
        path: 'driveId',
        populate: { path: 'companyId', select: 'name' }
      });

    console.log(`📊 Total Applications: ${applications.length}\n`);

    if (applications.length === 0) {
      console.log('⚠️  No applications found in database!');
      console.log('This is why "My Applications" page is empty.\n');
    } else {
      console.log('📋 All Applications:\n');
      applications.forEach((app, index) => {
        const studentName = app.studentId?.userId?.name || 'Unknown';
        const companyName = app.driveId?.companyId?.name || 'Unknown';
        const jobRole = app.driveId?.jobRole || 'Unknown';
        
        console.log(`${index + 1}. ${studentName} → ${companyName} - ${jobRole}`);
        console.log(`   Status: ${app.status}`);
        console.log(`   Applied: ${app.appliedDate}`);
        console.log(`   Skill Match: ${app.skillMatchPercentage}%`);
        console.log('');
      });
    }

    // Check each student's applications
    console.log('='.repeat(80));
    console.log('APPLICATIONS BY STUDENT:');
    console.log('='.repeat(80));

    const students = await Student.find().populate('userId', 'name email');
    
    for (const student of students) {
      const studentApps = await Application.find({ studentId: student._id });
      console.log(`\n👤 ${student.userId?.name} (${student.rollNumber})`);
      console.log(`   Applications: ${studentApps.length}`);
      
      if (studentApps.length > 0) {
        studentApps.forEach(app => {
          console.log(`   - ${app.status} (Applied: ${app.appliedDate})`);
        });
      }
    }

    console.log('\n✅ Check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkApplications();
