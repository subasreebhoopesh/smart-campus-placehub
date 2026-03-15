// Quick script to create an admin user for testing
const bcrypt = require('bcrypt');
const db = require('./config/database');

async function createAdmin() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Check if admin exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', ['admin@college.edu']);
    
    if (existing.length > 0) {
      console.log('✅ Admin user already exists');
      console.log('Email: admin@college.edu');
      console.log('Password: admin123');
      process.exit(0);
    }
    
    // Create admin user
    const [result] = await db.query(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      ['admin@college.edu', hashedPassword, 'Admin User', 'admin']
    );
    
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@college.edu');
    console.log('Password: admin123');
    console.log('User ID:', result.insertId);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('\n⚠️  Database tables not found!');
      console.log('Please run: mysql -u root -p < database.sql');
    }
    
    process.exit(1);
  }
}

createAdmin();
