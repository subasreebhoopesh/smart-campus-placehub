// Test login functionality
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/placement_portal')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const User = require('./models/User');

async function testLogin() {
  try {
    console.log('\n🔍 Testing Admin Login...\n');
    
    // Find admin user
    const admin = await User.findOne({ email: 'admin@college.edu' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      console.log('Run: node seed-admin.js');
      process.exit(1);
    }
    
    console.log('✅ Admin user found:');
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Password Hash:', admin.password.substring(0, 20) + '...');
    
    // Test password
    const testPassword = 'admin123';
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    
    console.log('\n🔐 Password Test:');
    console.log('   Testing password:', testPassword);
    console.log('   Match:', isMatch ? '✅ YES' : '❌ NO');
    
    if (isMatch) {
      // Generate token
      const token = jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '7d' }
      );
      
      console.log('\n🎫 JWT Token Generated:');
      console.log('   Token:', token.substring(0, 50) + '...');
      console.log('\n✅ Login would succeed!');
    } else {
      console.log('\n❌ Login would fail - password mismatch');
    }
    
    // Test student login if exists
    console.log('\n\n🔍 Testing Student Login...\n');
    const student = await User.findOne({ role: 'student' });
    
    if (student) {
      console.log('✅ Student user found:');
      console.log('   Email:', student.email);
      console.log('   Role:', student.role);
      
      const studentPassword = 'student123';
      const studentMatch = await bcrypt.compare(studentPassword, student.password);
      console.log('\n🔐 Password Test:');
      console.log('   Testing password:', studentPassword);
      console.log('   Match:', studentMatch ? '✅ YES' : '❌ NO');
    } else {
      console.log('ℹ️  No student users found. Register a student first.');
    }
    
    // Test HR login if exists
    console.log('\n\n🔍 Testing HR Login...\n');
    const hr = await User.findOne({ role: 'hr' });
    
    if (hr) {
      console.log('✅ HR user found:');
      console.log('   Email:', hr.email);
      console.log('   Role:', hr.role);
      
      const hrPassword = 'hr123';
      const hrMatch = await bcrypt.compare(hrPassword, hr.password);
      console.log('\n🔐 Password Test:');
      console.log('   Testing password:', hrPassword);
      console.log('   Match:', hrMatch ? '✅ YES' : '❌ NO');
    } else {
      console.log('ℹ️  No HR users found. Create HR account from admin panel.');
    }
    
    console.log('\n✅ Login test complete!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during test:', error);
    process.exit(1);
  }
}

// Run test
setTimeout(testLogin, 1000);
