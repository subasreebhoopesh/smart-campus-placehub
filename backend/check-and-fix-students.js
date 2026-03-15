const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal';

async function checkAndFixStudents() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = require('./models/User');
    const Student = require('./models/Student');

    // Find all student users
    const studentUsers = await User.find({ role: 'student' });
    console.log(`📊 Found ${studentUsers.length} student users:\n`);

    for (const user of studentUsers) {
      console.log(`👤 User: ${user.name} (${user.email})`);
      console.log(`   User ID: ${user._id}`);
      
      // Check if student profile exists
      const studentProfile = await Student.findOne({ userId: user._id });
      
      if (studentProfile) {
        console.log(`   ✅ Student profile exists`);
        console.log(`   Roll Number: ${studentProfile.rollNumber}`);
        console.log(`   Branch: ${studentProfile.branch}`);
        console.log(`   CGPA: ${studentProfile.cgpa}`);
        console.log(`   Skills: ${studentProfile.skills.join(', ') || 'None'}`);
      } else {
        console.log(`   ❌ Student profile MISSING - Creating now...`);
        
        // Create student profile
        const newStudent = new Student({
          userId: user._id,
          rollNumber: `STU${Date.now().toString().slice(-6)}`,
          branch: 'CSE',
          cgpa: 7.5,
          skills: [],
          tenthPercentage: 85,
          twelfthPercentage: 88
        });
        
        await newStudent.save();
        console.log(`   ✅ Created student profile with roll number: ${newStudent.rollNumber}`);
      }
      console.log('');
    }

    // Summary
    console.log('='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    const totalStudents = await Student.countDocuments();
    const totalStudentUsers = await User.countDocuments({ role: 'student' });
    console.log(`Total Student Users: ${totalStudentUsers}`);
    console.log(`Total Student Profiles: ${totalStudents}`);
    
    if (totalStudentUsers === totalStudents) {
      console.log('✅ All student users have profiles!');
    } else {
      console.log('⚠️  Mismatch between users and profiles');
    }
    
    console.log('\n✅ Check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAndFixStudents();
