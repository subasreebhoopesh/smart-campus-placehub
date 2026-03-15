/**
 * Complete Duplicate Removal Script
 * Removes all duplicate records from MongoDB and keeps only original data
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function removeDuplicates() {
  console.log('\n🧹 Starting Complete Duplicate Removal...\n');

  try {
    const User = require('./models/User');
    const Student = require('./models/Student');
    const Company = require('./models/Company');
    const PlacementDrive = require('./models/PlacementDrive');
    const Application = require('./models/Application');
    const HR = require('./models/HR');
    const Notification = require('./models/Notification');
    const Interview = require('./models/Interview');
    const Message = require('./models/Message');

    let totalRemoved = 0;

    // 1. Remove duplicate Users (by email)
    console.log('1️⃣ Checking Users for duplicates...');
    const users = await User.find().sort({ createdAt: 1 });
    const seenEmails = new Set();
    let userDuplicates = 0;

    for (const user of users) {
      if (seenEmails.has(user.email)) {
        await User.findByIdAndDelete(user._id);
        userDuplicates++;
        console.log(`   ❌ Removed duplicate user: ${user.email}`);
      } else {
        seenEmails.add(user.email);
      }
    }
    console.log(`   ✅ Users: ${userDuplicates} duplicates removed\n`);
    totalRemoved += userDuplicates;

    // 2. Remove duplicate Students (by userId or rollNumber)
    console.log('2️⃣ Checking Students for duplicates...');
    const students = await Student.find().sort({ createdAt: 1 });
    const seenUserIds = new Set();
    const seenRollNumbers = new Set();
    let studentDuplicates = 0;

    for (const student of students) {
      const isDuplicateUserId = seenUserIds.has(student.userId.toString());
      const isDuplicateRoll = seenRollNumbers.has(student.rollNumber);

      if (isDuplicateUserId || isDuplicateRoll) {
        await Student.findByIdAndDelete(student._id);
        studentDuplicates++;
        console.log(`   ❌ Removed duplicate student: ${student.rollNumber}`);
      } else {
        seenUserIds.add(student.userId.toString());
        seenRollNumbers.add(student.rollNumber);
      }
    }
    console.log(`   ✅ Students: ${studentDuplicates} duplicates removed\n`);
    totalRemoved += studentDuplicates;

    // 3. Remove duplicate Companies (by name)
    console.log('3️⃣ Checking Companies for duplicates...');
    const companies = await Company.find().sort({ createdAt: 1 });
    const seenCompanyNames = new Set();
    let companyDuplicates = 0;

    for (const company of companies) {
      const normalizedName = company.name.toLowerCase().trim();
      if (seenCompanyNames.has(normalizedName)) {
        await Company.findByIdAndDelete(company._id);
        companyDuplicates++;
        console.log(`   ❌ Removed duplicate company: ${company.name}`);
      } else {
        seenCompanyNames.add(normalizedName);
      }
    }
    console.log(`   ✅ Companies: ${companyDuplicates} duplicates removed\n`);
    totalRemoved += companyDuplicates;

    // 4. Remove duplicate Placement Drives (by companyId + jobRole + driveDate)
    console.log('4️⃣ Checking Placement Drives for duplicates...');
    const drives = await PlacementDrive.find().sort({ createdAt: 1 });
    const seenDrives = new Set();
    let driveDuplicates = 0;

    for (const drive of drives) {
      const driveKey = `${drive.companyId}_${drive.jobRole}_${drive.driveDate}`;
      if (seenDrives.has(driveKey)) {
        await PlacementDrive.findByIdAndDelete(drive._id);
        driveDuplicates++;
        console.log(`   ❌ Removed duplicate drive: ${drive.jobRole}`);
      } else {
        seenDrives.add(driveKey);
      }
    }
    console.log(`   ✅ Placement Drives: ${driveDuplicates} duplicates removed\n`);
    totalRemoved += driveDuplicates;

    // 5. Remove duplicate Applications (by studentId + driveId)
    console.log('5️⃣ Checking Applications for duplicates...');
    const applications = await Application.find().sort({ appliedDate: 1 });
    const seenApplications = new Set();
    let applicationDuplicates = 0;

    for (const application of applications) {
      const appKey = `${application.studentId}_${application.driveId}`;
      if (seenApplications.has(appKey)) {
        await Application.findByIdAndDelete(application._id);
        applicationDuplicates++;
        console.log(`   ❌ Removed duplicate application`);
      } else {
        seenApplications.add(appKey);
      }
    }
    console.log(`   ✅ Applications: ${applicationDuplicates} duplicates removed\n`);
    totalRemoved += applicationDuplicates;

    // 6. Remove duplicate HR (by userId)
    console.log('6️⃣ Checking HR records for duplicates...');
    const hrs = await HR.find().sort({ createdAt: 1 });
    const seenHRUserIds = new Set();
    let hrDuplicates = 0;

    for (const hr of hrs) {
      if (seenHRUserIds.has(hr.userId.toString())) {
        await HR.findByIdAndDelete(hr._id);
        hrDuplicates++;
        console.log(`   ❌ Removed duplicate HR record`);
      } else {
        seenHRUserIds.add(hr.userId.toString());
      }
    }
    console.log(`   ✅ HR Records: ${hrDuplicates} duplicates removed\n`);
    totalRemoved += hrDuplicates;

    // 7. Remove duplicate Notifications (by recipientId + title + message + createdAt)
    console.log('7️⃣ Checking Notifications for duplicates...');
    const notifications = await Notification.find().sort({ createdAt: 1 });
    const seenNotifications = new Set();
    let notificationDuplicates = 0;

    for (const notification of notifications) {
      const notifKey = `${notification.recipientId}_${notification.title}_${notification.message}_${notification.createdAt.getTime()}`;
      if (seenNotifications.has(notifKey)) {
        await Notification.findByIdAndDelete(notification._id);
        notificationDuplicates++;
      } else {
        seenNotifications.add(notifKey);
      }
    }
    console.log(`   ✅ Notifications: ${notificationDuplicates} duplicates removed\n`);
    totalRemoved += notificationDuplicates;

    // 8. Remove duplicate Interviews (by applicationId)
    console.log('8️⃣ Checking Interviews for duplicates...');
    const interviews = await Interview.find().sort({ createdAt: 1 });
    const seenInterviews = new Set();
    let interviewDuplicates = 0;

    for (const interview of interviews) {
      if (seenInterviews.has(interview.applicationId.toString())) {
        await Interview.findByIdAndDelete(interview._id);
        interviewDuplicates++;
      } else {
        seenInterviews.add(interview.applicationId.toString());
      }
    }
    console.log(`   ✅ Interviews: ${interviewDuplicates} duplicates removed\n`);
    totalRemoved += interviewDuplicates;

    // 9. Remove duplicate Messages (by senderId + recipientId + message + createdAt)
    console.log('9️⃣ Checking Messages for duplicates...');
    const messages = await Message.find().sort({ createdAt: 1 });
    const seenMessages = new Set();
    let messageDuplicates = 0;

    for (const message of messages) {
      const msgKey = `${message.senderId}_${message.recipientId}_${message.message}_${message.createdAt.getTime()}`;
      if (seenMessages.has(msgKey)) {
        await Message.findByIdAndDelete(message._id);
        messageDuplicates++;
      } else {
        seenMessages.add(msgKey);
      }
    }
    console.log(`   ✅ Messages: ${messageDuplicates} duplicates removed\n`);
    totalRemoved += messageDuplicates;

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('📊 DUPLICATE REMOVAL SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`Users:             ${userDuplicates} removed`);
    console.log(`Students:          ${studentDuplicates} removed`);
    console.log(`Companies:         ${companyDuplicates} removed`);
    console.log(`Placement Drives:  ${driveDuplicates} removed`);
    console.log(`Applications:      ${applicationDuplicates} removed`);
    console.log(`HR Records:        ${hrDuplicates} removed`);
    console.log(`Notifications:     ${notificationDuplicates} removed`);
    console.log(`Interviews:        ${interviewDuplicates} removed`);
    console.log(`Messages:          ${messageDuplicates} removed`);
    console.log('═══════════════════════════════════════');
    console.log(`TOTAL DUPLICATES REMOVED: ${totalRemoved}`);
    console.log('═══════════════════════════════════════\n');

    // Show current counts
    console.log('📈 CURRENT DATABASE COUNTS:');
    console.log(`Users:             ${await User.countDocuments()}`);
    console.log(`Students:          ${await Student.countDocuments()}`);
    console.log(`Companies:         ${await Company.countDocuments()}`);
    console.log(`Placement Drives:  ${await PlacementDrive.countDocuments()}`);
    console.log(`Applications:      ${await Application.countDocuments()}`);
    console.log(`HR Records:        ${await HR.countDocuments()}`);
    console.log(`Notifications:     ${await Notification.countDocuments()}`);
    console.log(`Interviews:        ${await Interview.countDocuments()}`);
    console.log(`Messages:          ${await Message.countDocuments()}`);
    console.log('\n✅ Database cleaned! All duplicates removed.\n');

  } catch (error) {
    console.error('❌ Error removing duplicates:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
removeDuplicates();
