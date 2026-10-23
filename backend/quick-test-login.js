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

async function testLogin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const email = 'sreesuba219.2005@gmail.com';
    const password = 'Suba@2005';

    console.log('🔍 Looking for student:', email);
    const student = await Student.findOne({ email });

    if (!student) {
      console.log('❌ Student not found!');
      process.exit(1);
    }

    console.log('✅ Student found:', student.name);
    console.log('📧 Email:', student.email);
    console.log('🔐 Stored password hash:', student.password.substring(0, 30) + '...');

    console.log('\n🧪 Testing password...');
    const isMatch = await bcrypt.compare(password, student.password);

    if (isMatch) {
      console.log('✅ PASSWORD CORRECT! Login should work!');
    } else {
      console.log('❌ PASSWORD INCORRECT! This is the problem!');
      console.log('\n🔧 Fixing password now...');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      student.password = hashedPassword;
      await student.save();
      
      console.log('✅ Password fixed! Try logging in now.');
    }

    await mongoose.connection.close();
    console.log('\n✅ Test complete');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testLogin();
