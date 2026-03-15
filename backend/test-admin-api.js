async function testAdminStatsAPI() {
  try {
    console.log('🔐 Testing Admin Stats API...\n');

    // First, login as admin to get token
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@college.edu',
        password: 'admin123',
        role: 'admin'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    const token = loginData.token;
    console.log('✅ Login successful! Token received.\n');

    // Now test the stats endpoint
    console.log('2️⃣ Fetching admin stats...');
    const statsResponse = await fetch('http://localhost:3001/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const statsData = await statsResponse.json();

    if (statsData.success) {
      console.log('✅ Stats fetched successfully!\n');
      console.log('📊 Dashboard Statistics:');
      console.log('─────────────────────────');
      console.log(`👥 Total Students: ${statsData.stats.totalStudents}`);
      console.log(`🏢 Total Companies: ${statsData.stats.totalCompanies}`);
      console.log(`📋 Active Drives: ${statsData.stats.activeDrives}`);
      console.log(`📈 Placement Rate: ${statsData.stats.placementRate}%`);
      console.log(`✅ Placed Students: ${statsData.stats.placedStudents}`);
      console.log('\n📈 Changes from last month:');
      console.log(`   Students: ${statsData.stats.changes.students}%`);
      console.log(`   Companies: ${statsData.stats.changes.companies}%`);
      console.log(`   Drives: ${statsData.stats.changes.drives >= 0 ? '+' : ''}${statsData.stats.changes.drives}`);
      console.log('\n✅ API test successful!');
    } else {
      console.error('❌ Failed to fetch stats:', statsData.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdminStatsAPI();
