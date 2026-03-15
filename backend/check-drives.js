const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal';

async function checkDrives() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const PlacementDrive = require('./models/PlacementDrive');
    const Company = require('./models/Company');

    // Get all drives
    const drives = await PlacementDrive.find().populate('companyId');
    
    console.log(`📊 Total Placement Drives: ${drives.length}\n`);
    
    if (drives.length === 0) {
      console.log('⚠️  No placement drives found!');
      console.log('Creating sample drives...\n');
      
      // Get companies
      const companies = await Company.find().limit(5);
      
      if (companies.length === 0) {
        console.log('❌ No companies found! Please create companies first.');
        process.exit(1);
      }
      
      // Create sample drives
      const sampleDrives = [];
      const branches = ['CSE', 'IT', 'ECE', 'EEE', 'MECH'];
      const roles = ['Software Engineer', 'Full Stack Developer', 'Backend Developer', 'Frontend Developer', 'Data Analyst'];
      
      for (let i = 0; i < Math.min(companies.length, 5); i++) {
        const company = companies[i];
        const drive = new PlacementDrive({
          companyId: company._id,
          jobRole: roles[i],
          driveDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000), // Next few weeks
          eligibleBranches: branches,
          minCgpa: 6.5 + (i * 0.2),
          packageOffered: 4 + (i * 1.5),
          description: `Join ${company.name} as a ${roles[i]}. Great opportunity for freshers!`,
          status: 'upcoming',
          registeredStudents: 0,
          selectedStudents: 0
        });
        
        await drive.save();
        sampleDrives.push(drive);
        console.log(`✅ Created drive: ${company.name} - ${roles[i]}`);
      }
      
      console.log(`\n✅ Created ${sampleDrives.length} sample drives`);
    } else {
      console.log('📋 Existing Drives:\n');
      drives.forEach((drive, index) => {
        console.log(`${index + 1}. ${drive.companyId?.name || 'Unknown'} - ${drive.jobRole}`);
        console.log(`   Package: Rs. ${drive.packageOffered} LPA`);
        console.log(`   Date: ${drive.driveDate.toDateString()}`);
        console.log(`   Status: ${drive.status}`);
        console.log(`   Eligible: ${drive.eligibleBranches.join(', ')}`);
        console.log(`   Min CGPA: ${drive.minCgpa}`);
        console.log(`   Registered: ${drive.registeredStudents}`);
        console.log('');
      });
    }
    
    console.log('✅ Check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDrives();
