const mongoose = require('mongoose');
const User = require('./models/User');
const HR = require('./models/HR');
const Company = require('./models/Company');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal';

async function checkHR() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Check HR users
    const hrUsers = await User.find({ role: 'hr' });
    console.log(`Found ${hrUsers.length} HR users:`);
    hrUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.name})`);
    });

    // Check HR profiles
    console.log('\nHR Profiles:');
    const hrs = await HR.find().populate('userId').populate('companyId');
    hrs.forEach(hr => {
      console.log(`  - ${hr.userId.email} -> ${hr.companyId.name} (Company ID: ${hr.companyId._id})`);
    });

    // Check companies
    console.log('\nCompanies:');
    const companies = await Company.find({}, 'name');
    companies.forEach(company => {
      console.log(`  - ${company.name} (ID: ${company._id})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkHR();
