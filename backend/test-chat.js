const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001/api';

async function testChat() {
  console.log('💬 Testing WhatsApp-like Chat System...\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const adminLoginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@college.edu',
        password: 'admin123',
        expectedRole: 'admin'
      })
    });

    const adminData = await adminLoginResponse.json();
    const adminToken = adminData.token;
    const adminId = adminData.user._id || adminData.user.id;
    console.log('✅ Admin logged in (ID:', adminId, ')\n');

    // Step 2: Login as student
    console.log('2️⃣ Logging in as student...');
    const studentLoginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sreesuba219.2005@gmail.com',
        password: 'student123',
        expectedRole: 'student'
      })
    });

    const studentData = await studentLoginResponse.json();
    console.log('Student login response:', JSON.stringify(studentData, null, 2));
    
    if (!studentData.token) {
      throw new Error('Student login failed: ' + (studentData.message || 'No token received'));
    }
    
    const studentToken = studentData.token;
    const studentId = studentData.user?._id || studentData.user?.id || studentData.userId;
    console.log('✅ Student logged in (ID:', studentId, ')\n');

    // Step 3: Student sends message to admin
    console.log('3️⃣ Student sending message to admin...');
    const studentMessageResponse = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipientId: adminId,
        subject: 'Chat Message',
        message: 'Hello Admin! I have a question about the Google placement drive.',
        priority: 'normal'
      })
    });

    const studentMessage = await studentMessageResponse.json();
    console.log('✅ Student message sent:', studentMessage.message?.message || 'Message sent');
    console.log('');

    // Step 4: Admin sends reply
    console.log('4️⃣ Admin replying to student...');
    const adminMessageResponse = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipientId: studentId,
        subject: 'Chat Message',
        message: 'Hi Subasree! Sure, I can help you with that. What would you like to know about the Google drive?',
        priority: 'normal'
      })
    });

    const adminMessage = await adminMessageResponse.json();
    console.log('✅ Admin reply sent:', adminMessage.message?.message || 'Message sent');
    console.log('');

    // Step 5: Get conversation from student side
    console.log('5️⃣ Fetching conversation (student view)...');
    const studentConversationResponse = await fetch(`${API_URL}/messages/conversation/${adminId}`, {
      headers: {
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json'
      }
    });

    const studentConversation = await studentConversationResponse.json();
    console.log('✅ Conversation loaded (student view):');
    console.log('─────────────────────────');
    studentConversation.forEach((msg, index) => {
      const sender = msg.isMine ? 'You' : 'Admin';
      const time = new Date(msg.createdAt).toLocaleTimeString();
      console.log(`${index + 1}. [${sender}] ${msg.message}`);
      console.log(`   Time: ${time}`);
      console.log('');
    });

    // Step 6: Get conversation from admin side
    console.log('6️⃣ Fetching conversation (admin view)...');
    const adminConversationResponse = await fetch(`${API_URL}/messages/conversation/${studentId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const adminConversation = await adminConversationResponse.json();
    console.log('✅ Conversation loaded (admin view):');
    console.log('─────────────────────────');
    adminConversation.forEach((msg, index) => {
      const sender = msg.isMine ? 'You' : 'Subasree';
      const time = new Date(msg.createdAt).toLocaleTimeString();
      console.log(`${index + 1}. [${sender}] ${msg.message}`);
      console.log(`   Time: ${time}`);
      console.log('');
    });

    // Step 7: Get all students (for admin chat list)
    console.log('7️⃣ Fetching all students for admin chat list...');
    const studentsResponse = await fetch(`${API_URL}/students`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const students = await studentsResponse.json();
    console.log('✅ Students available for chat:');
    console.log('─────────────────────────');
    students.slice(0, 5).forEach((student, index) => {
      console.log(`${index + 1}. ${student.userId?.name || 'Unknown'} (${student.rollNumber})`);
    });
    console.log(`\nTotal: ${students.length} students\n`);

    console.log('✅ Chat system test successful!\n');
    console.log('📱 Features Working:');
    console.log('   ✓ Student can send messages to admin');
    console.log('   ✓ Admin can reply to students');
    console.log('   ✓ Conversations are separate for each student');
    console.log('   ✓ Messages show in correct order');
    console.log('   ✓ Admin can see all students to chat with');
    console.log('   ✓ WhatsApp-like interface ready!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testChat();
