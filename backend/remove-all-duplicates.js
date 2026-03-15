const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal';

async function removeDuplicates() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Student = require('./models/Student');
    const Application = require('./models/Application');
    const Company = require('./models/Company');
    const PlacementDrive = require('./models/PlacementDrive');
    const User = require('./models/User');
    const HR = require('./models/HR');

    // Remove duplicate students (by email)
    console.log('\n🔍 Checking for duplicate students...');
    const students = await Student.find({});
    const studentEmails = {};
    let studentDuplicates = 0;

    for (const student of students) {
      if (studentEmails[student.email]) {
        await Student.findByIdAndDelete(student._id);
        studentDuplicates++;
        console.log(`  ❌ Removed duplicate student: ${student.email}`);
      } else {
        studentEmails[student.email] = true;
      }
    }
    console.log(`✅ Removed ${studentDuplicates} duplicate students`);

    // Remove duplicate applications (by studentId + driveId)
    console.log('\n🔍 Checking for duplicate applications...');
    const applications = await Application.find({});
    const appKeys = {};
    let appDuplicates = 0;

    for (const app of applications) {
      const key = `${app.studentId}_${app.driveId}`;
      if (appKeys[key]) {
        await Application.findByIdAndDelete(app._id);
        appDuplicates++;
        console.log(`  ❌ Removed duplicate application: Student ${app.studentId} -> Drive ${app.driveId}`);
      } else {
        appKeys[key] = true;
      }
    }
    console.log(`✅ Removed ${appDuplicates} duplicate applications`);

    // Remove duplicate companies (by name)
    console.log('\n🔍 Checking for duplicate companies...');
    const companies = await Company.find({});
    const companyNames = {};
    let companyDuplicates = 0;

    for (const company of companies) {
      if (companyNames[company.name.toLowerCase()]) {
        await Company.findByIdAndDelete(company._id);
        companyDuplicates++;
        console.log(`  ❌ Removed duplicate company: ${company.name}`);
      } else {
        companyNames[company.name.toLowerCase()] = true;
      }
    }
    console.log(`✅ Removed ${companyDuplicates} duplicate companies`);

    // Remove duplicate users (by email)
    console.log('\n🔍 Checking for duplicate users...');
    const users = await User.find({});
    const userEmails = {};
    let userDuplicates = 0;

    for (const user of users) {
      if (userEmails[user.email]) {
        await User.findByIdAndDelete(user._id);
        userDuplicates++;
        console.log(`  ❌ Removed duplicate user: ${user.email}`);
      } else {
        userEmails[user.email] = true;
      }
    }
    console.log(`✅ Removed ${userDuplicates} duplicate users`);

    // Remove duplicate HR records (by userId)
    console.log('\n🔍 Checking for duplicate HR records...');
    const hrRecords = await HR.find({});
    const hrUserIds = {};
    let hrDuplicates = 0;

    for (const hr of hrRecords) {
      const userId = hr.userId.toString();
      if (hrUserIds[userId]) {
        await HR.findByIdAndDelete(hr._id);
        hrDuplicates++;
        console.log(`  ❌ Removed duplicate HR record for user: ${userId}`);
      } else {
        hrUserIds[userId] = true;
      }
    }
    console.log(`✅ Removed ${hrDuplicates} duplicate HR records`);

    // Summary
    const totalDuplicates = studentDuplicates + appDuplicates + companyDuplicates + userDuplicates + hrDuplicates;
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`Students:     ${studentDuplicates} duplicates removed`);
    console.log(`Applications: ${appDuplicates} duplicates removed`);
    console.log(`Companies:    ${companyDuplicates} duplicates removed`);
    console.log(`Users:        ${userDuplicates} duplicates removed`);
    console.log(`HR Records:   ${hrDuplicates} duplicates removed`);
    console.log('='.repeat(50));
    console.log(`TOTAL:        ${totalDuplicates} duplicates removed`);
    console.log('='.repeat(50));

    console.log('\n✅ Database cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

removeDuplicates();
