/**
 * Email System Test Script
 * Tests all email notification types
 */

const { 
  sendSelectionEmail,
  sendShortlistEmail,
  sendInterviewScheduleEmail,
  sendNewApplicationEmail,
  sendAdminPlacementEmail,
  sendDocumentVerificationEmail
} = require('./utils/emailService');

async function testEmails() {
  console.log('📧 Testing Email Notification System...\n');
  console.log('=' .repeat(50));

  try {
    // Test 1: Selection Email
    console.log('\n1️⃣  Testing SELECTION Email...');
    const result1 = await sendSelectionEmail(
      'student@example.com',
      'Rahul Kumar',
      'Google India',
      'Software Engineer',
      '45'
    );
    console.log('   Result:', result1.success ? '✅ Success' : '❌ Failed');

    // Test 2: Shortlist Email
    console.log('\n2️⃣  Testing SHORTLIST Email...');
    const result2 = await sendShortlistEmail(
      'student@example.com',
      'Priya Sharma',
      'Microsoft',
      'SDE-1'
    );
    console.log('   Result:', result2.success ? '✅ Success' : '❌ Failed');

    // Test 3: Interview Schedule Email
    console.log('\n3️⃣  Testing INTERVIEW SCHEDULE Email...');
    const result3 = await sendInterviewScheduleEmail(
      'student@example.com',
      'Amit Patel',
      'Amazon',
      'February 20, 2024',
      '10:00 AM',
      'Seminar Hall, Block A'
    );
    console.log('   Result:', result3.success ? '✅ Success' : '❌ Failed');

    // Test 4: New Application Email (to HR)
    console.log('\n4️⃣  Testing NEW APPLICATION Email (HR)...');
    const result4 = await sendNewApplicationEmail(
      'hr@company.com',
      'Sarah Johnson',
      'Vikram Singh',
      'Full Stack Developer',
      '85'
    );
    console.log('   Result:', result4.success ? '✅ Success' : '❌ Failed');

    // Test 5: Admin Placement Email
    console.log('\n5️⃣  Testing ADMIN PLACEMENT Email...');
    const result5 = await sendAdminPlacementEmail(
      'admin@college.edu',
      'Sneha Reddy',
      'TCS',
      'System Engineer',
      '7'
    );
    console.log('   Result:', result5.success ? '✅ Success' : '❌ Failed');

    // Test 6: Document Verification Email (Approved)
    console.log('\n6️⃣  Testing DOCUMENT VERIFICATION Email (Approved)...');
    const result6 = await sendDocumentVerificationEmail(
      'student@example.com',
      'Arjun Mehta',
      'verified',
      'All documents are in order.'
    );
    console.log('   Result:', result6.success ? '✅ Success' : '❌ Failed');

    // Test 7: Document Verification Email (Rejected)
    console.log('\n7️⃣  Testing DOCUMENT VERIFICATION Email (Rejected)...');
    const result7 = await sendDocumentVerificationEmail(
      'student@example.com',
      'Kavya Nair',
      'rejected',
      'Please upload a clearer copy of your ID proof.'
    );
    console.log('   Result:', result7.success ? '✅ Success' : '❌ Failed');

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ All email tests completed!\n');
    
    console.log('📝 Note:');
    console.log('   - If emails show "simulation", configure EMAIL_USER in .env');
    console.log('   - Check your email inbox for test emails');
    console.log('   - Emails might be in spam folder initially\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
  }
}

// Run tests
testEmails();
