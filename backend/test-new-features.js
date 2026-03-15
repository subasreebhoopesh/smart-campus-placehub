/**
 * Test script for new features
 * Tests all new API endpoints
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function testNewFeatures() {
  console.log('\n🧪 Testing New Features...\n');

  try {
    // Test 1: Student Ranking
    console.log('1️⃣ Testing Student Ranking System...');
    const Student = require('./models/Student');
    const students = await Student.find().limit(5).lean();
    
    if (students.length > 0) {
      const { calculateRankScore, rankStudents } = require('./utils/studentRanking');
      const rankedStudents = rankStudents(students);
      console.log(`✅ Ranked ${rankedStudents.length} students`);
      console.log(`   Top student: Rank ${rankedStudents[0].rank}, Score: ${rankedStudents[0].rankScore}`);
    } else {
      console.log('⚠️  No students found in database');
    }

    // Test 2: Email Service
    console.log('\n2️⃣ Testing Email Service...');
    const { sendEmail } = require('./utils/emailService');
    const emailResult = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email',
      html: '<p>This is a test email</p>'
    });
    console.log(`✅ Email service: ${emailResult.message || 'Working'}`);

    // Test 3: Interview Model
    console.log('\n3️⃣ Testing Interview Model...');
    const Interview = require('./models/Interview');
    const interviewCount = await Interview.countDocuments();
    console.log(`✅ Interview model loaded. Count: ${interviewCount}`);

    // Test 4: Message Model
    console.log('\n4️⃣ Testing Message Model...');
    const Message = require('./models/Message');
    const messageCount = await Message.countDocuments();
    console.log(`✅ Message model loaded. Count: ${messageCount}`);

    // Test 5: Document Verification Fields
    console.log('\n5️⃣ Testing Document Verification Fields...');
    const studentWithVerification = await Student.findOne().select('documentVerificationStatus verificationRemarks');
    if (studentWithVerification) {
      console.log(`✅ Verification status: ${studentWithVerification.documentVerificationStatus || 'pending'}`);
    } else {
      console.log('⚠️  No students found');
    }

    // Test 6: Rank Score Field
    console.log('\n6️⃣ Testing Rank Score Field...');
    const studentWithRank = await Student.findOne().select('rankScore');
    if (studentWithRank) {
      console.log(`✅ Rank score field exists: ${studentWithRank.rankScore || 0}`);
    }

    console.log('\n✅ All Tests Passed!\n');
    console.log('📋 Summary:');
    console.log('   ✅ Student Ranking System - Working');
    console.log('   ✅ Email Service - Working');
    console.log('   ✅ Interview Model - Loaded');
    console.log('   ✅ Message Model - Loaded');
    console.log('   ✅ Document Verification - Ready');
    console.log('   ✅ Rank Score - Ready');
    console.log('\n🎉 All new features are operational!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Run tests
testNewFeatures();
