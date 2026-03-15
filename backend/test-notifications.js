const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function testNotifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal');
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find().select('_id email role');
    console.log('\n📋 All Users:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ID: ${user._id.toString()}`);
    });

    // Get students
    const students = await User.find({ role: 'student' }).select('_id email');
    console.log(`\n👨‍🎓 Found ${students.length} students`);

    // Get HR
    const hrs = await User.find({ role: 'hr' }).select('_id email');
    console.log(`👔 Found ${hrs.length} HR users`);

    // Get admin
    const admins = await User.find({ role: 'admin' }).select('_id email');
    console.log(`👑 Found ${admins.length} admin users`);

    console.log('\n✅ Test complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testNotifications();
