const mongoose = require('mongoose');
const Application = require('./models/Application');
const Student = require('./models/Student');
const PlacementDrive = require('./models/PlacementDrive');
const Company = require('./models/Company');
const User = require('./models/User');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal';

async function removeDuplicates() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all applications
    const applications = await Application.find()
      .populate('studentId')
      .populate('driveId');

    console.log(`Total applications: ${applications.length}`);

    // Group by studentId + driveId to find duplicates
    const seen = new Map();
    const duplicates = [];

    for (const app of applications) {
      if (!app.studentId || !app.driveId) {
        console.log(`Skipping application ${app._id} - missing student or drive`);
        continue;
      }

      const key = `${app.studentId._id}-${app.driveId._id}`;
      
      if (seen.has(key)) {
        // This is a duplicate
        duplicates.push(app._id);
        console.log(`Found duplicate: Student ${app.studentId.rollNumber} applied to drive ${app.driveId.jobRole} multiple times`);
      } else {
        seen.set(key, app._id);
      }
    }

    console.log(`\nFound ${duplicates.length} duplicate applications`);

    if (duplicates.length > 0) {
      console.log('\nRemoving duplicates...');
      const result = await Application.deleteMany({ _id: { $in: duplicates } });
      console.log(`Removed ${result.deletedCount} duplicate applications`);
    } else {
      console.log('No duplicates found!');
    }

    // Verify the unique index exists
    const indexes = await Application.collection.getIndexes();
    console.log('\nCurrent indexes:', Object.keys(indexes));

    if (!indexes['studentId_1_driveId_1']) {
      console.log('\nCreating unique index to prevent future duplicates...');
      await Application.collection.createIndex(
        { studentId: 1, driveId: 1 },
        { unique: true }
      );
      console.log('Unique index created successfully!');
    } else {
      console.log('Unique index already exists');
    }

    console.log('\n✅ Cleanup complete!');
    
    // Show final count
    const finalCount = await Application.countDocuments();
    console.log(`Final application count: ${finalCount}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

removeDuplicates();
