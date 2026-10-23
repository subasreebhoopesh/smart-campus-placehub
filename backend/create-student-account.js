const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal';

const studentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  registerNumber: String,
  department: String,
  year: String,
  cgpa: Number,
  skills: [String],
  resumeUrl: String,
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);

async function createStudent() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const email = 'sreesuba219.2005@gmail.com';
    const password = 'Suba@2005';

    // Check if student already exists
    const existing = await Student.findOne({ email });
    if (existing) {
      console.log('⚠️  Student already exists. Updating password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      existing.password = hashedPassword;
      await existing.save();
      console.log('✅ Password updated successfully!');
    } else {
      console.log('➕ Creating new student account...');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const student = new Student({
        name: 'Sree Suba',
        email: email,
        password: hashedPassword,
        registerNumber: 'REG2024001',
        department: 'Computer Science',
        year: '3rd Year',
        cgpa: 8.5,
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        appliedJobs: []
      });

      await student.save();
      console.log('✅ Student account created successfully!');
    }

    console.log('\n📋 Login Credentials:');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('\n🌐 Login URL: http://localhost:8080/student-login');

    await mongoose.connection.close();
    console.log('\n✅ Done! You can now login.');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createStudent();
