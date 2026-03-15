const mongoose = require('./config/database-mongodb');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const createAdmin = async () => {
  try {
    // Wait for connection
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if admin exists
    const existing = await User.findOne({ email: 'admin@college.edu' });
    
    if (existing) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email: admin@college.edu');
      console.log('🔑 Password: admin123');
      process.exit(0);
    }

    // Create admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      email: 'admin@college.edu',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin'
    });

    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@college.edu');
    console.log('🔑 Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
