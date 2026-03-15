const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/User');

async function resetPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal');
    console.log('Connected to MongoDB\n');

    const newPassword = 'student123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update subasree
    const user1 = await User.findOneAndUpdate(
      { email: 'sreesuba219.2005@gmail.com' },
      { password: hashedPassword },
      { new: true }
    );
    if (user1) {
      console.log(`✅ Updated password for: ${user1.email}`);
    }

    // Update maithra
    const user2 = await User.findOneAndUpdate(
      { email: 'maithra@gmail.com' },
      { password: hashedPassword },
      { new: true }
    );
    if (user2) {
      console.log(`✅ Updated password for: ${user2.email}`);
    }

    console.log(`\n✅ All student passwords reset to: ${newPassword}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetPasswords();
