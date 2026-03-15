const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Student = require('./models/Student');

async function checkStudents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal');
    console.log('Connected to MongoDB\n');

    // Get all users with student role
    const studentUsers = await User.find({ role: 'student' });
    console.log(`Found ${studentUsers.length} student users:\n`);

    for (const user of studentUsers) {
      console.log(`User ID: ${user._id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Role: ${user.role}`);
      
      // Find associated student profile
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        console.log(`  Student Profile:`);
        console.log(`    Roll Number: ${student.rollNumber}`);
        console.log(`    Branch: ${student.branch}`);
        console.log(`    CGPA: ${student.cgpa}`);
      } else {
        console.log(`  ⚠️  No student profile found!`);
      }
      console.log('');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkStudents();
