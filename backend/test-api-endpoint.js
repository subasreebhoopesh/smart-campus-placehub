const http = require('http');

const postData = JSON.stringify({
  email: 'sreesuba219.2005@gmail.com',
  password: 'Suba@2005',
  expectedRole: 'student'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing login API endpoint...\n');
console.log('URL: http://localhost:3001/api/auth/login');
console.log('Data:', JSON.parse(postData));
console.log('\n📡 Sending request...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    console.log('\nResponse Body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✅ LOGIN SUCCESSFUL!');
        console.log('Token received:', !!parsed.token);
      } else {
        console.log('\n❌ LOGIN FAILED!');
        console.log('Reason:', parsed.message);
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
});

req.write(postData);
req.end();
