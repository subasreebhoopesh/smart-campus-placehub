const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'placement_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.log('\n⚠️  Server will continue but database operations will fail');
    console.log('📝 To fix:');
    console.log('   1. Make sure MySQL is running');
    console.log('   2. Update backend/.env with correct credentials');
    console.log('   3. Run: mysql -u root < backend/setup-database.sql');
  });

module.exports = pool;
