// Reset all user passwords for local development
require('./config/database-mongodb');
const User = require('./models/User');
const bcrypt = require('bcrypt');

const passwordMap = {
  // Students - password = first part of email + "123"
  'subasree@gmail.com':        'suba123',
  'sreesuba219.2005@gmail.com':'suba123',
  'maithra@gmail.com':         'maithra123',
  'sneha@gmail.com':           'sneha123',
  'rajee@gmail.com':           'rajee123',
  'slonesathis@gmail.com':     'sathish123',
  'priy@gmail.com':            'priya123',
  'preethi@gmail.com':         'preethi123',
  'sreeja@gmail.com':          'sreeja123',

  // HR accounts
  'hr@google.com':             'google123',
  'hr@wipro.com':              'wipro123',
  'hr@google1.com':            'google123',
  'hr@ibm.com':                'ibm123',

  // Admin
  'admin@college.edu':         'admin123',
};

setTimeout(async () => {
  try {
    let count = 0;
    for (const [email, password] of Object.entries(passwordMap)) {
      const hash = await bcrypt.hash(password, 10);
      const result = await User.updateOne({ email }, { password: hash });
      if (result.matchedCount > 0) {
        console.log(`✅ ${email} => ${password}`);
        count++;
      } else {
        console.log(`⚠️  Not found: ${email}`);
      }
    }
    console.log(`\n✅ Done! Reset ${count} passwords.`);
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('─────────────────────────────────────');
    console.log('ADMIN:   admin@college.edu       / admin123');
    console.log('─────────────────────────────────────');
    console.log('STUDENTS:');
    console.log('  subasree@gmail.com             / suba123');
    console.log('  sreesuba219.2005@gmail.com     / suba123');
    console.log('  maithra@gmail.com              / maithra123');
    console.log('  sneha@gmail.com                / sneha123');
    console.log('  rajee@gmail.com                / rajee123');
    console.log('  slonesathis@gmail.com          / sathish123');
    console.log('  priy@gmail.com                 / priya123');
    console.log('  preethi@gmail.com              / preethi123');
    console.log('  sreeja@gmail.com               / sreeja123');
    console.log('─────────────────────────────────────');
    console.log('HR:');
    console.log('  hr@google.com                  / google123');
    console.log('  hr@wipro.com                   / wipro123');
    console.log('  hr@google1.com                 / google123');
    console.log('  hr@ibm.com                     / ibm123');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}, 2000);
