const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/placement_portal')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Check if user exists
    const email = 'sreesuba219.2005@gmail.com';
    const user = await User.findOne({ email });
    
    if (user) {
      console.log('\n✅ User found:');
      console.log('Email:', user.email);
      console.log('Name:', user.name);
      console.log('Role:', user.role);
      console.log('Has password:', !!user.password);
    } else {
      console.log('\n❌ User NOT found with email:', email);
      console.log('\n📋 All users in database:');
      const allUsers = await User.find({});
      allUsers.forEach(u => {
        console.log(`- ${u.email} (${u.role})`);
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
