// Script to fix HR user names that were saved as "Admin User"
// Run with: node backend/fix-hr-names.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const HR = require('./models/HR');

const MONGODB_URI = process.env.MONGODB_URI;

async function fixHRNames() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all HR users
    const hrUsers = await User.find({ role: 'hr' });
    console.log(`\nFound ${hrUsers.length} HR users:`);
    
    for (const u of hrUsers) {
      // Find their HR record with company
      const hrRecord = await HR.findOne({ userId: u._id }).populate('companyId');
      const companyName = hrRecord?.companyId?.name || 'No Company';
      const contactEmail = hrRecord?.companyId?.contactEmail || '';
      
      console.log(`\n  User: ${u.name} | Email: ${u.email} | Company: ${companyName}`);
      
      // Fix if name is "Admin User" or generic
      if (u.name === 'Admin User' || u.name === 'HR User' || u.name === 'admin') {
        // Use the company's contactPerson or derive from email
        let newName = hrRecord?.companyId?.contactPerson || '';
        
        if (!newName || newName === 'Admin User') {
          // Derive from email: hr@company.com → HR
          const emailPart = u.email.split('@')[0];
          newName = emailPart.charAt(0).toUpperCase() + emailPart.slice(1) + ' (HR)';
        }
        
        console.log(`  → Fixing name: "${u.name}" → "${newName}"`);
        await User.updateOne({ _id: u._id }, { name: newName });
      }
    }

    // Also list all HR users after fix
    console.log('\n--- All HR users after fix ---');
    const updated = await User.find({ role: 'hr' });
    for (const u of updated) {
      console.log(`  ${u.name} | ${u.email}`);
    }

    console.log('\nDone!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixHRNames();
