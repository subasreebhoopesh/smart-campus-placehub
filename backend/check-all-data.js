require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal';

async function checkData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected!\n');

    // Get database stats
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('📊 DATABASE INFORMATION:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 Database: ${db.databaseName}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`📦 Total Collections: ${collections.length}`);
    console.log('');

    // Check Users collection
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const studentCount = await User.countDocuments({ role: 'student' });
    const hrCount = await User.countDocuments({ role: 'hr' });

    console.log('👥 USERS DATA:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Total Users: ${totalUsers}`);
    console.log(`👨‍💼 Admins: ${adminCount}`);
    console.log(`👨‍🎓 Students: ${studentCount}`);
    console.log(`👔 HR: ${hrCount}`);
    console.log('');

    if (totalUsers > 0) {
      console.log('📝 USER DETAILS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const admins = await User.find({ role: 'admin' }, 'name email');
      const students = await User.find({ role: 'student' }, 'name email branch cgpa');
      const hrs = await User.find({ role: 'hr' }, 'name email company');

      if (admins.length > 0) {
        console.log('\n👨‍💼 ADMINS:');
        admins.forEach((user, i) => {
          console.log(`   ${i + 1}. ${user.name} (${user.email})`);
        });
      }

      if (students.length > 0) {
        console.log('\n👨‍🎓 STUDENTS:');
        students.forEach((user, i) => {
          console.log(`   ${i + 1}. ${user.name} (${user.email})`);
          console.log(`      Branch: ${user.branch || 'N/A'}, CGPA: ${user.cgpa || 'N/A'}`);
        });
      }

      if (hrs.length > 0) {
        console.log('\n👔 HR USERS:');
        hrs.forEach((user, i) => {
          console.log(`   ${i + 1}. ${user.name} (${user.email})`);
          console.log(`      Company: ${user.company || 'N/A'}`);
        });
      }
    }

    console.log('\n📦 ALL COLLECTIONS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`   ${collection.name}: ${count} documents`);
    }

    console.log('\n💾 DATA STORAGE LOCATION:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Database: ${MONGODB_URI}`);
    console.log(`   Files: backend/uploads/`);
    console.log('');

    await mongoose.disconnect();
    console.log('👋 Disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkData();
