const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001/api';

async function testRecentActivities() {
  console.log('🔐 Testing Recent Activities API...\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@college.edu',
        password: 'admin123',
        expectedRole: 'admin'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful! Token received.\n');

    // Step 2: Fetch recent activities
    console.log('2️⃣ Fetching recent activities...');
    const activitiesResponse = await fetch(`${API_URL}/admin/recent-activities?limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!activitiesResponse.ok) {
      const errorText = await activitiesResponse.text();
      throw new Error(`Failed to fetch activities: ${activitiesResponse.status} - ${errorText}`);
    }

    const activitiesData = await activitiesResponse.json();
    console.log('✅ Activities fetched successfully!\n');

    // Display activities
    console.log('📋 Recent Activities:');
    console.log('─────────────────────────');
    
    if (activitiesData.activities && activitiesData.activities.length > 0) {
      activitiesData.activities.forEach((activity, index) => {
        const icon = activity.type === 'placement' ? '🎉' :
                     activity.type === 'drive' ? '📅' :
                     activity.type === 'registration' ? '👥' : '🏢';
        
        console.log(`${index + 1}. ${icon} ${activity.message}`);
        console.log(`   Type: ${activity.type}`);
        console.log(`   Time: ${new Date(activity.timestamp).toLocaleString()}`);
        console.log('');
      });
      
      console.log(`\n✅ Total activities: ${activitiesData.activities.length}`);
    } else {
      console.log('ℹ️  No recent activities found');
    }

    console.log('\n✅ API test successful!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testRecentActivities();
