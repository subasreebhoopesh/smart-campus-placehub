const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/placement_portal')
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    const email = 'sreesuba219.2005@gmail.com';
    const testPassword = 'Suba@2005';
    
    //Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }
    
    console.log('✅ User found:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Role:', user.role);
    console.log('  Password Hash:', user.password.substring(0, 20) + '...');
    
    // Test password
    const isMatch = await bcrypt.compare(testPassword, user.password);
    
    console.log('\n🔐 Password Test:');
    console.log('  Test Password:', testPassword);
    console.log('  Match Result:', isMatch ? '✅ CORRECT' : '❌ WRONG');
    
    if (!isMatch) {
      console.log('\n⚠️  Password does NOT match!');
      console.log('💡 This is why login is failing.');
    } else {
      console.log('\n✅ Password is correct!');
      console.log('💡 Login should work. Check frontend/backend connection.');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
