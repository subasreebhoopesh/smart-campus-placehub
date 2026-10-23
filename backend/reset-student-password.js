const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/placement_portal')
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    const email = 'sreesuba219.2005@gmail.com';
    const newPassword = 'Suba@2005';
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user password
    const result = await User.updateOne(
      { email },
      { password: hashedPassword }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Password reset successful!');
      console.log('📧 Email:', email);
      console.log('🔑 New Password:', newPassword);
      console.log('\n✨ You can now login with these credentials!');
    } else {
      console.log('❌ User not found or password unchanged');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
