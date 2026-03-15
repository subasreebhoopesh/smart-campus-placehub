const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// Test admin profile endpoints
async function testAdminProfile() {
  console.log('🧪 Testing Admin Profile API...\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@college.edu',
      password: 'admin123',
      expectedRole: 'admin'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('Token:', token.substring(0, 20) + '...\n');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Get admin profile
    console.log('2️⃣ Fetching admin profile...');
    const profileResponse = await axios.get(`${API_URL}/admin/profile`, { headers });
    console.log('✅ Profile fetched successfully');
    console.log('Profile:', JSON.stringify(profileResponse.data.profile, null, 2));
    console.log('');

    // Step 3: Update profile (name only)
    console.log('3️⃣ Updating admin name...');
    const updateNameResponse = await axios.put(
      `${API_URL}/admin/profile`,
      {
        name: 'Admin Updated Name',
        email: profileResponse.data.profile.email
      },
      { headers }
    );
    console.log('✅ Name updated successfully');
    console.log('Updated Profile:', JSON.stringify(updateNameResponse.data.profile, null, 2));
    console.log('');

    // Step 4: Update password
    console.log('4️⃣ Testing password update...');
    try {
      const updatePasswordResponse = await axios.put(
        `${API_URL}/admin/profile`,
        {
          name: updateNameResponse.data.profile.name,
          email: updateNameResponse.data.profile.email,
          currentPassword: 'admin123',
          newPassword: 'newpassword123'
        },
        { headers }
      );
      console.log('✅ Password updated successfully');
      console.log('Response:', updatePasswordResponse.data.message);
      console.log('');

      // Step 5: Test login with new password
      console.log('5️⃣ Testing login with new password...');
      const newLoginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: profileResponse.data.profile.email,
        password: 'newpassword123',
        expectedRole: 'admin'
      });
      console.log('✅ Login with new password successful');
      console.log('');

      // Step 6: Change password back
      console.log('6️⃣ Changing password back to original...');
      const newToken = newLoginResponse.data.token;
      const newHeaders = {
        'Authorization': `Bearer ${newToken}`,
        'Content-Type': 'application/json'
      };
      
      await axios.put(
        `${API_URL}/admin/profile`,
        {
          name: updateNameResponse.data.profile.name,
          email: updateNameResponse.data.profile.email,
          currentPassword: 'newpassword123',
          newPassword: 'admin123'
        },
        { headers: newHeaders }
      );
      console.log('✅ Password changed back to original');
      console.log('');

    } catch (error) {
      console.error('❌ Password update test failed:', error.response?.data || error.message);
    }

    // Step 7: Test validation - wrong current password
    console.log('7️⃣ Testing validation - wrong current password...');
    try {
      await axios.put(
        `${API_URL}/admin/profile`,
        {
          name: 'Test Name',
          email: profileResponse.data.profile.email,
          currentPassword: 'wrongpassword',
          newPassword: 'newpass123'
        },
        { headers }
      );
      console.log('❌ Should have failed with wrong password');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected wrong password');
        console.log('Error message:', error.response.data.message);
      } else {
        console.error('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    console.log('');

    // Step 8: Test email uniqueness
    console.log('8️⃣ Testing email uniqueness validation...');
    try {
      // Try to update to an email that might exist (student email)
      await axios.put(
        `${API_URL}/admin/profile`,
        {
          name: 'Test Name',
          email: 'sneha@gmail.com', // Student email
          currentPassword: 'admin123'
        },
        { headers }
      );
      console.log('⚠️ Email update succeeded (no conflict)');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already in use')) {
        console.log('✅ Correctly rejected duplicate email');
        console.log('Error message:', error.response.data.message);
      } else {
        console.log('⚠️ Different error:', error.response?.data?.message || error.message);
      }
    }
    console.log('');

    console.log('✅ All admin profile tests completed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run tests
testAdminProfile();
