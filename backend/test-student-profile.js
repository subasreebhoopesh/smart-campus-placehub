const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal';

async function testStudentProfile() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = require('./models/User');
    const Student = require('./models/Student');

    // Test for each student user
    const studentUsers = await User.find({ role: 'student' });
    
    console.log(`Testing ${studentUsers.length} student profiles:\n`);
    
    for (const user of studentUsers) {
      console.log(`👤 ${user.name} (${user.email})`);
      console.log(`   User ID: ${user._id}`);
      
      // Find student profile
      const student = await Student.findOne({ userId: user._id });
      
      if (student) {
        console.log(`   ✅ Profile found`);
        console.log(`   Roll: ${student.rollNumber}`);
        console.log(`   Branch: ${student.branch}`);
        console.log(`   CGPA: ${student.cgpa}`);
        console.log(`   Skills: ${student.skills.length} skills`);
        console.log(`   Resume: ${student.resumeUrl || 'Not uploaded'}`);
      } else {
        console.log(`   ❌ Profile NOT found`);
      }
      console.log('');
    }
    
    console.log('✅ Test complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testStudentProfile();
