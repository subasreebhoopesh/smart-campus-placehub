const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const Application = require('./models/Application');
const Student = require('./models/Student');
const PlacementDrive = require('./models/PlacementDrive');
const Company = require('./models/Company');

async function fixDuplicateApplications() {
  console.log('\n🔍 Checking for Duplicate Applications...\n');

  try {
    // Get all applications
    const allApplications = await Application.find()
      .populate('studentId', 'rollNumber')
      .populate('driveId', 'jobRole')
      .populate('companyId', 'name');

    console.log(`📊 Total applications in database: ${allApplications.length}\n`);

    // Group applications by student + drive combination
    const applicationMap = new Map();
    const duplicates = [];

    for (const app of allApplications) {
      const key = `${app.studentId?._id}-${app.driveId?._id}`;
      
      if (applicationMap.has(key)) {
        // Found duplicate!
        duplicates.push({
          original: applicationMap.get(key),
          duplicate: app
        });
      } else {
        applicationMap.set(key, app);
      }
    }

    if (duplicates.length === 0) {
      console.log('✅ No duplicate applications found! Database is clean.\n');
      
      // Show summary
      console.log('📋 Application Summary:');
      console.log('─────────────────────────');
      
      const uniqueStudents = new Set(allApplications.map(a => a.studentId?._id?.toString()));
      const uniqueDrives = new Set(allApplications.map(a => a.driveId?._id?.toString()));
      
      console.log(`Total Applications: ${allApplications.length}`);
      console.log(`Unique Students: ${uniqueStudents.size}`);
      console.log(`Unique Drives: ${uniqueDrives.size}`);
      
      // Show status breakdown
      const statusCounts = {};
      allApplications.forEach(app => {
        statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
      });
      
      console.log('\nStatus Breakdown:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
      
      process.exit(0);
    }

    console.log(`⚠️  Found ${duplicates.length} duplicate applications!\n`);

    // Show duplicates
    console.log('Duplicate Applications:');
    console.log('─────────────────────────');
    
    for (let i = 0; i < duplicates.length; i++) {
      const { original, duplicate } = duplicates[i];
      
      console.log(`\n${i + 1}. Duplicate Found:`);
      console.log(`   Student: ${original.studentId?.rollNumber || 'Unknown'}`);
      console.log(`   Drive: ${original.driveId?.jobRole || 'Unknown'} at ${original.companyId?.name || 'Unknown'}`);
      console.log(`   Original ID: ${original._id}`);
      console.log(`   Original Date: ${original.appliedDate}`);
      console.log(`   Original Status: ${original.status}`);
      console.log(`   Duplicate ID: ${duplicate._id}`);
      console.log(`   Duplicate Date: ${duplicate.appliedDate}`);
      console.log(`   Duplicate Status: ${duplicate.status}`);
    }

    // Ask for confirmation to remove duplicates
    console.log('\n🗑️  Removing duplicate applications (keeping the original)...\n');

    let removedCount = 0;
    for (const { duplicate } of duplicates) {
      await Application.findByIdAndDelete(duplicate._id);
      removedCount++;
      console.log(`✅ Removed duplicate: ${duplicate._id}`);
    }

    console.log(`\n✅ Successfully removed ${removedCount} duplicate applications!\n`);

    // Verify no duplicates remain
    const remainingApps = await Application.find();
    const verifyMap = new Map();
    let stillHasDuplicates = false;

    for (const app of remainingApps) {
      const key = `${app.studentId}-${app.driveId}`;
      if (verifyMap.has(key)) {
        stillHasDuplicates = true;
        break;
      }
      verifyMap.set(key, app);
    }

    if (stillHasDuplicates) {
      console.log('⚠️  Warning: Some duplicates may still exist. Run script again.\n');
    } else {
      console.log('✅ Verification passed! No duplicates remain.\n');
      
      // Show final summary
      console.log('📋 Final Application Summary:');
      console.log('─────────────────────────');
      console.log(`Total Applications: ${remainingApps.length}`);
      
      const uniqueStudents = new Set(remainingApps.map(a => a.studentId?.toString()));
      const uniqueDrives = new Set(remainingApps.map(a => a.driveId?.toString()));
      
      console.log(`Unique Students: ${uniqueStudents.size}`);
      console.log(`Unique Drives: ${uniqueDrives.size}`);
      
      // Show status breakdown
      const statusCounts = {};
      remainingApps.forEach(app => {
        statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
      });
      
      console.log('\nStatus Breakdown:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
    }

    console.log('\n✅ Database cleanup complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the fix
fixDuplicateApplications();
