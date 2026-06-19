const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const MONGODB_URI = 'mongodb://localhost:27017/placement_portal';

async function createStudent() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const User = require('./models/User');
  const Student = require('./models/Student');

  // Check if user already exists
  const existing = await User.findOne({ email: 'sneha@gmail.com' });
  if (existing) {
    console.log('User sneha@gmail.com already exists, updating password...');
    existing.password = await bcrypt.hash('sneha@2005', 10);
    await existing.save();
    console.log('Password updated successfully!');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash('sneha@2005', 10);

  const user = new User({
    email: 'sneha@gmail.com',
    password: hashedPassword,
    name: 'Sneha',
    role: 'student'
  });
  await user.save();

  const student = new Student({
    userId: user._id,
    rollNumber: 'CSE2024001',
    branch: 'CSE',
    cgpa: 8.5,
    skills: ['JavaScript', 'React', 'Node.js'],
    placementStatus: 'unplaced'
  });
  await student.save();

  console.log('Student account created successfully!');
  console.log('Email: sneha@gmail.com');
  console.log('Password: sneha@2005');
  process.exit(0);
}

createStudent().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
