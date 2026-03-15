const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const HR = require('./models/HR');
const Company = require('./models/Company');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal';

async function createHR() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get command line arguments
    const args = process.argv.slice(2);
    if (args.length < 4) {
      console.log('Usage: node create-hr.js <email> <password> <name> <companyName>');
      console.log('Example: node create-hr.js hr@google.com hr123 "Google HR" "Google"');
      process.exit(1);
    }

    const [email, password, name, companyName] = args;

    // Find company by name
    const company = await Company.findOne({ name: new RegExp(`^${companyName}$`, 'i') });
    if (!company) {
      console.error(`Company "${companyName}" not found!`);
      console.log('Available companies:');
      const companies = await Company.find({}, 'name');
      companies.forEach(c => console.log(`  - ${c.name}`));
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`User with email ${email} already exists!`);
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: 'hr'
    });
    await user.save();
    console.log('✓ User created');

    // Create HR profile
    const hr = new HR({
      userId: user._id,
      companyId: company._id
    });
    await hr.save();
    console.log('✓ HR profile created');

    console.log('\n=== HR Account Created Successfully ===');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Name: ${name}`);
    console.log(`Company: ${company.name}`);
    console.log(`Company ID: ${company._id}`);
    console.log('\nYou can now login at: http://localhost:8080/hr-login');

    process.exit(0);
  } catch (error) {
    console.error('Error creating HR:', error);
    process.exit(1);
  }
}

createHR();
