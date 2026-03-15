const mongoose = require('mongoose');
const User = require('./models/User');
const Application = require('./models/Application');
const Student = require('./models/Student');
const PlacementDrive = require('./models/PlacementDrive');
const Company = require('./models/Company');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal';

async function checkApplications() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Check applications
    const applications = await Application.find()
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate({
        path: 'driveId',
        select: 'jobRole'
      })
      .populate({
        path: 'companyId',
        select: 'name'
      });

    console.log(`Found ${applications.length} applications:\n`);
    
    if (applications.length === 0) {
      console.log('No applications found. Students need to apply to drives first.\n');
      
      // Check if there are drives
      const drives = await PlacementDrive.find().populate('companyId', 'name');
      console.log(`Available drives: ${drives.length}`);
      drives.forEach(drive => {
        console.log(`  - ${drive.companyId.name}: ${drive.jobRole} (ID: ${drive._id})`);
      });
      
      // Check if there are students
      const students = await Student.find().populate('userId', 'name email');
      console.log(`\nRegistered students: ${students.length}`);
      students.forEach(student => {
        console.log(`  - ${student.userId.name} (${student.userId.email}) - ${student.branch}, CGPA: ${student.cgpa}`);
      });
    } else {
      applications.forEach(app => {
        console.log(`Application ID: ${app._id}`);
        console.log(`  Student: ${app.studentId.userId.name} (${app.studentId.userId.email})`);
        console.log(`  Company: ${app.companyId.name}`);
        console.log(`  Job Role: ${app.driveId.jobRole}`);
        console.log(`  Status: ${app.status}`);
        console.log(`  Applied: ${app.appliedDate}`);
        console.log('');
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkApplications();
