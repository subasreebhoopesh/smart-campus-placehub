// Test script to verify profile photo database connection
require('dotenv').config();
require('./config/database-mongodb');

const Student = require('./models/Student');
const User = require('./models/User');

async function testProfilePhoto() {
  try {
    console.log('🔍 Testing Profile Photo Database Connection...\n');

    // Wait for database connection
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Find all students with profile photos
    const studentsWithPhotos = await Student.find({ 
      profilePhotoUrl: { $exists: true, $ne: null, $ne: '' } 
    }).populate('userId', 'name email');

    console.log(`✅ Found ${studentsWithPhotos.length} students with profile photos\n`);

    if (studentsWithPhotos.length > 0) {
      console.log('📸 Students with Profile Photos:');
      console.log('================================');
      studentsWithPhotos.forEach((student, index) => {
        console.log(`\n${index + 1}. ${student.userId?.name || 'Unknown'}`);
        console.log(`   Email: ${student.userId?.email || 'N/A'}`);
        console.log(`   Roll Number: ${student.rollNumber}`);
        console.log(`   Photo URL: ${student.profilePhotoUrl}`);
        console.log(`   Branch: ${student.branch}`);
        console.log(`   CGPA: ${student.cgpa}`);
      });
    } else {
      console.log('ℹ️  No students have uploaded profile photos yet.');
      console.log('\nTo test:');
      console.log('1. Login as a student');
      console.log('2. Go to Profile page');
      console.log('3. Click "Upload Photo" button');
      console.log('4. Select an image file');
      console.log('5. Run this script again to see the photo in database');
    }

    // Check total students
    const totalStudents = await Student.countDocuments();
    console.log(`\n📊 Total Students in Database: ${totalStudents}`);

    // Check database field structure
    const sampleStudent = await Student.findOne();
    if (sampleStudent) {
      console.log('\n🔧 Student Schema Fields:');
      console.log('========================');
      console.log('- userId:', sampleStudent.userId ? '✅' : '❌');
      console.log('- rollNumber:', sampleStudent.rollNumber ? '✅' : '❌');
      console.log('- branch:', sampleStudent.branch ? '✅' : '❌');
      console.log('- cgpa:', typeof sampleStudent.cgpa === 'number' ? '✅' : '❌');
      console.log('- profilePhotoUrl:', 'profilePhotoUrl' in sampleStudent ? '✅ (field exists)' : '❌');
      console.log('- resumeUrl:', 'resumeUrl' in sampleStudent ? '✅ (field exists)' : '❌');
    }

    console.log('\n✅ Profile Photo Database Connection Test Complete!');
    console.log('📁 Photos are stored in: backend/uploads/');
    console.log('💾 Photo URLs are stored in MongoDB Student collection');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing profile photo:', error);
    process.exit(1);
  }
}

testProfilePhoto();
