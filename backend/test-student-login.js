const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 Testing student login...\n');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'sreesuba219.2005@gmail.com',
      password: 'Suba@2005'
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', response.data.token);
    console.log('User:', response.data.user);
    
  } catch (error) {
    console.log('❌ Login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testLogin();
