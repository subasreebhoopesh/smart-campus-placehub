const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Import models
const Student = require('./models/Student');
const Company = require('./models/Company');
const PlacementDrive = require('./models/PlacementDrive');
const Application = require('./models/Application');

async function testStats() {
  try {
    console.log('\n📊 Testing Admin Stats Calculation...\n');

    // Get counts
    const totalStudents = await Student.countDocuments();
    console.log(`👥 Total Students: ${totalStudents}`);

    const totalCompanies = await Company.countDocuments();
    console.log(`🏢 Total Companies: ${totalCompanies}`);

    const activeDrives = await PlacementDrive.countDocuments({
      status: { $in: ['upcoming', 'ongoing'] }
    });
    console.log(`📋 Active Drives: ${activeDrives}`);

    const placedStudents = await Application.distinct('studentId', {
      status: 'selected'
    });
    console.log(`✅ Placed Students: ${placedStudents.length}`);

    const placementRate = totalStudents > 0 
      ? ((placedStudents.length / totalStudents) * 100).toFixed(1)
      : 0;
    console.log(`📈 Placement Rate: ${placementRate}%`);

    console.log('\n✅ Stats calculation successful!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Connection closed');
  }
}

testStats();
