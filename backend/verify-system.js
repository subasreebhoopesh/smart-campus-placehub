const mongoose = require('mongoose');
const User = require('./models/User');
const HR = require('./models/HR');
const Student = require('./models/Student');
const Company = require('./models/Company');
const PlacementDrive = require('./models/PlacementDrive');
const Application = require('./models/Application');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal';

async function verifySystem() {
  try {
    console.log('🔍 Verifying Smart Campus Pathways System...\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Check Admin
    const admin = await User.findOne({ email: 'admin@college.edu' });
    console.log(`${admin ? '✅' : '❌'} Admin Account: ${admin ? 'EXISTS' : 'MISSING'}`);
    if (!admin) {
      console.log('   Run: node seed-admin.js\n');
    }

    // Check Companies
    const companies = await Company.find();
    console.log(`${companies.length > 0 ? '✅' : '❌'} Companies: ${companies.length} found`);
    companies.forEach(c => console.log(`   - ${c.name}`));
    if (companies.length === 0) {
      console.log('   Create companies via Admin UI\n');
    }

    // Check HR Accounts
    const hrUsers = await User.find({ role: 'hr' });
    const hrs = await HR.find().populate('userId').populate('companyId');
    console.log(`\n${hrUsers.length > 0 ? '✅' : '❌'} HR Accounts: ${hrUsers.length} found`);
    hrs.forEach(hr => {
      console.log(`   - ${hr.userId.email} → ${hr.companyId.name}`);
    });
    if (hrUsers.length === 0) {
      console.log('   Run: node create-hr.js <email> <password> <name> <company>\n');
    }

    // Check Students
    const students = await Student.find().populate('userId');
    console.log(`\n${students.length > 0 ? '✅' : '❌'} Students: ${students.length} registered`);
    students.slice(0, 3).forEach(s => {
      console.log(`   - ${s.userId.name} (${s.rollNumber}) - ${s.branch}, CGPA: ${s.cgpa}`);
    });
    if (students.length > 3) {
      console.log(`   ... and ${students.length - 3} more`);
    }
    if (students.length === 0) {
      console.log('   Register students at: http://localhost:8080/student-register\n');
    }

    // Check Drives
    const drives = await PlacementDrive.find().populate('companyId');
    console.log(`\n${drives.length > 0 ? '✅' : '❌'} Placement Drives: ${drives.length} created`);
    drives.forEach(d => {
      console.log(`   - ${d.companyId.name}: ${d.jobRole} (${d.status})`);
    });
    if (drives.length === 0) {
      console.log('   Create drives via Admin UI\n');
    }

    // Check Applications
    const applications = await Application.find()
      .populate({
        path: 'studentId',
        populate: { path: 'userId' }
      })
      .populate('companyId');
    console.log(`\n${applications.length > 0 ? '✅' : '❌'} Applications: ${applications.length} submitted`);
    applications.slice(0, 5).forEach(app => {
      console.log(`   - ${app.studentId.userId.name} → ${app.companyId.name} (${app.status})`);
    });
    if (applications.length > 5) {
      console.log(`   ... and ${applications.length - 5} more`);
    }
    if (applications.length === 0) {
      console.log('   Students need to apply to drives\n');
    }

    // System Status
    console.log('\n========================================');
    console.log('SYSTEM STATUS');
    console.log('========================================');
    
    const allGood = admin && companies.length > 0 && hrUsers.length > 0 && 
                    students.length > 0 && drives.length > 0;
    
    if (allGood) {
      console.log('✅ System is fully configured and ready!');
      console.log('\nYou can now:');
      console.log('1. Login as Admin: http://localhost:8080/admin-login');
      console.log('2. Login as HR: http://localhost:8080/hr-login');
      console.log('3. Login as Student: http://localhost:8080/student-login');
    } else {
      console.log('⚠️  System needs configuration');
      console.log('\nNext steps:');
      if (!admin) console.log('1. Run: node seed-admin.js');
      if (companies.length === 0) console.log('2. Create companies via Admin UI');
      if (hrUsers.length === 0) console.log('3. Run: node create-hr.js <email> <password> <name> <company>');
      if (drives.length === 0) console.log('4. Create drives via Admin UI');
      if (students.length === 0) console.log('5. Register students at frontend');
    }

    console.log('\n========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifySystem();
