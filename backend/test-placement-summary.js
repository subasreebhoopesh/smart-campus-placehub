async function testPlacementSummary() {
  try {
    console.log('🔐 Testing Placement Summary API...\n');

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
    console.log('✅ Login successful!\n');

    // Test the placement summary endpoint
    console.log('2️⃣ Fetching placement summary...');
    const summaryResponse = await fetch('http://localhost:3001/api/admin/placement-summary', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const summaryData = await summaryResponse.json();

    if (summaryData.success) {
      console.log('✅ Placement summary fetched successfully!\n');
      
      console.log('📊 Overall Summary:');
      console.log('─────────────────────────');
      console.log(`👥 Total Eligible: ${summaryData.summary.totalEligible}`);
      console.log(`✅ Total Placed: ${summaryData.summary.totalPlaced}`);
      console.log(`📈 Placement Rate: ${summaryData.summary.placementRate}%`);
      console.log(`💰 Average Package: ₹${summaryData.summary.avgPackage} LPA`);
      console.log(`🎯 Highest Package: ₹${summaryData.summary.highestPackage} LPA`);
      
      console.log('\n📋 Branch-wise Data:');
      console.log('─────────────────────────');
      summaryData.branchData.forEach(branch => {
        console.log(`\n${branch.branch}:`);
        console.log(`  Eligible: ${branch.eligible}`);
        console.log(`  Placed: ${branch.placed}`);
        console.log(`  Placement %: ${branch.placementPercentage}%`);
        console.log(`  Avg Package: ₹${branch.avgPackage} LPA`);
        console.log(`  Highest Package: ₹${branch.highestPackage} LPA`);
      });
      
      console.log('\n✅ API test successful!');
    } else {
      console.error('❌ Failed to fetch summary:', summaryData.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPlacementSummary();
