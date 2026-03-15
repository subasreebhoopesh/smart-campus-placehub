const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const Application = require('./models/Application');
const Student = require('./models/Student');
const PlacementDrive = require('./models/PlacementDrive');
const Company = require('./models/Company');

async function cleanAllDuplicates() {
  console.log('\n🧹 Final Cleanup: Removing ALL Duplicate Applications...\n');

  try {
    // Get all applications with full details
    const allApplications = await Application.find()
      .populate('studentId')
      .populate('driveId')
      .populate('companyId')
      .sort({ appliedDate: 1 }); // Sort by date, oldest first

    console.log(`📊 Total applications: ${allApplications.length}\n`);

    // Track unique combinations
    const seen = new Map(); // key: studentId-driveId, value: application
    const toDelete = [];

    for (const app of allApplications) {
      const studentId = app.studentId?._id?.toString();
      const driveId = app.driveId?._id?.toString();

      if (!studentId || !driveId) {
        console.log(`⚠️  Invalid application found (missing student or drive): ${app._id}`);
        toDelete.push(app._id);
        continue;
      }

      const key = `${studentId}-${driveId}`;

      if (seen.has(key)) {
        // This is a duplicate!
        const original = seen.get(key);
        console.log(`🔍 Duplicate found:`);
        console.log(`   Student: ${app.studentId?.rollNumber || 'Unknown'}`);
        console.log(`   Drive: ${app.driveId?.jobRole || 'Unknown'}`);
        console.log(`   Original: ${original._id} (${original.appliedDate})`);
        console.log(`   Duplicate: ${app._id} (${app.appliedDate})`);
        console.log(`   → Keeping original, removing duplicate\n`);
        
        toDelete.push(app._id);
      } else {
        // First occurrence, keep it
        seen.set(key, app);
      }
    }

    if (toDelete.length === 0) {
      console.log('✅ No duplicates found! Database is clean.\n');
    } else {
      console.log(`\n🗑️  Removing ${toDelete.length} duplicate/invalid applications...\n`);

      for (const id of toDelete) {
        await Application.findByIdAndDelete(id);
        console.log(`✅ Deleted: ${id}`);
      }

      console.log(`\n✅ Successfully removed ${toDelete.length} applications!\n`);
    }

    // Final verification
    const finalApps = await Application.find()
      .populate('studentId', 'rollNumber')
      .populate('driveId', 'jobRole')
      .populate('companyId', 'name');

    console.log('📋 Final Database State:');
    console.log('─────────────────────────');
    console.log(`Total Applications: ${finalApps.length}\n`);

    // Group by student
    const byStudent = {};
    for (const app of finalApps) {
      const rollNumber = app.studentId?.rollNumber || 'Unknown';
      if (!byStudent[rollNumber]) {
        byStudent[rollNumber] = [];
      }
      byStudent[rollNumber].push({
        drive: app.driveId?.jobRole || 'Unknown',
        company: app.companyId?.name || 'Unknown',
        status: app.status,
        date: app.appliedDate
      });
    }

    console.log('Applications by Student:');
    for (const [student, apps] of Object.entries(byStudent)) {
      console.log(`\n👤 ${student} (${apps.length} applications):`);
      apps.forEach((app, i) => {
        console.log(`   ${i + 1}. ${app.company} - ${app.drive} [${app.status}]`);
      });
    }

    // Check for any remaining duplicates
    const verifyMap = new Map();
    let stillHasDuplicates = false;

    for (const app of finalApps) {
      const key = `${app.studentId?._id}-${app.driveId?._id}`;
      if (verifyMap.has(key)) {
        stillHasDuplicates = true;
        console.log(`\n❌ ERROR: Duplicate still exists!`);
        console.log(`   Student: ${app.studentId?.rollNumber}`);
        console.log(`   Drive: ${app.driveId?.jobRole}`);
        break;
      }
      verifyMap.set(key, app);
    }

    if (!stillHasDuplicates) {
      console.log('\n\n✅ VERIFICATION PASSED!');
      console.log('─────────────────────────');
      console.log('✓ No duplicate applications exist');
      console.log('✓ Each student can apply only once per drive');
      console.log('✓ Database is clean and ready');
      console.log('\n🎉 Cleanup complete!\n');
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

cleanAllDuplicates();
