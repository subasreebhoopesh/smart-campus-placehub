require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal';

async function seedData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('\n🗑️  Clearing existing users...');
    await User.deleteMany({});
    console.log('✅ Cleared existing users');

    // Create Admin User
    console.log('\n👤 Creating Admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Admin',
      email: 'admin@college.edu',
      password: adminPassword,
      role: 'admin',
      profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    });
    await admin.save();
    console.log('✅ Admin created: admin@college.edu / admin123');

    // Create Student Users
    console.log('\n👨‍🎓 Creating Student users...');
    const students = [
      { name: 'Raj Kumar', email: 'raj@example.com', branch: 'Computer Science', cgpa: 8.5, skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'] },
      { name: 'Priya Sharma', email: 'priya@example.com', branch: 'Information Technology', cgpa: 9.2, skills: ['Python', 'Django', 'Machine Learning', 'Data Science'] },
      { name: 'Arun Balaji', email: 'arun@example.com', branch: 'Computer Science', cgpa: 8.8, skills: ['Java', 'Spring Boot', 'MySQL', 'AWS'] },
      { name: 'Divya Lakshmi', email: 'divya@example.com', branch: 'Electronics', cgpa: 8.0, skills: ['C++', 'Embedded Systems', 'IoT', 'Python'] },
      { name: 'Karthik Raj', email: 'karthik@example.com', branch: 'Information Technology', cgpa: 7.8, skills: ['HTML', 'CSS', 'JavaScript', 'React'] }
    ];

    const studentPassword = await bcrypt.hash('password123', 10);
    
    for (const studentData of students) {
      const student = new User({
        name: studentData.name,
        email: studentData.email,
        password: studentPassword,
        role: 'student',
        branch: studentData.branch,
        cgpa: studentData.cgpa,
        skills: studentData.skills,
        profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentData.name}`
      });
      await student.save();
      console.log(`✅ Student created: ${studentData.email} / password123`);
    }

    // Create HR Users
    console.log('\n👔 Creating HR users...');
    const hrUsers = [
      { 
        name: 'John Smith', 
        email: 'hr@techcorp.com', 
        company: 'TechCorp Solutions',
        position: 'HR Manager'
      },
      { 
        name: 'Sarah Johnson', 
        email: 'hr@innovate.com', 
        company: 'Innovate Labs',
        position: 'Talent Acquisition Lead'
      },
      { 
        name: 'Michael Brown', 
        email: 'hr@datatech.com', 
        company: 'DataTech Systems',
        position: 'Recruitment Specialist'
      }
    ];

    const hrPassword = await bcrypt.hash('password123', 10);
    
    for (const hrData of hrUsers) {
      const hr = new User({
        name: hrData.name,
        email: hrData.email,
        password: hrPassword,
        role: 'hr',
        company: hrData.company,
        position: hrData.position,
        profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${hrData.name}`
      });
      await hr.save();
      console.log(`✅ HR created: ${hrData.email} / password123`);
    }

    console.log('\n🎉 All data seeded successfully!');
    console.log('\n📝 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n👨‍💼 ADMIN:');
    console.log('   Email: admin@college.edu');
    console.log('   Password: admin123');
    console.log('\n👨‍🎓 STUDENTS:');
    console.log('   Email: raj@example.com');
    console.log('   Email: priya@example.com');
    console.log('   Email: arun@example.com');
    console.log('   Email: divya@example.com');
    console.log('   Email: karthik@example.com');
    console.log('   Password: password123 (for all students)');
    console.log('\n👔 HR:');
    console.log('   Email: hr@techcorp.com');
    console.log('   Email: hr@innovate.com');
    console.log('   Email: hr@datatech.com');
    console.log('   Password: password123 (for all HR)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
