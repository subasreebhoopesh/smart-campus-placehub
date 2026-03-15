const Database = require('better-sqlite3');
const path = require('path');

// Create database file in backend folder
const dbPath = path.join(__dirname, '..', 'placement_portal.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const createTables = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'student', 'hr')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Students table
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      roll_number TEXT UNIQUE NOT NULL,
      branch TEXT NOT NULL,
      cgpa REAL DEFAULT 0.00,
      skills TEXT,
      resume_url TEXT,
      profile_photo_url TEXT,
      tenth_percentage REAL,
      twelfth_percentage REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Companies table
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      industry TEXT,
      website TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // HR table
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      company_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  // Placement drives table
  db.exec(`
    CREATE TABLE IF NOT EXISTS placement_drives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      job_role TEXT NOT NULL,
      drive_date DATE NOT NULL,
      eligible_branches TEXT NOT NULL,
      min_cgpa REAL NOT NULL,
      package_offered INTEGER NOT NULL,
      description TEXT,
      status TEXT CHECK(status IN ('upcoming', 'ongoing', 'completed')) DEFAULT 'upcoming',
      registered_students INTEGER DEFAULT 0,
      selected_students INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  // Applications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      drive_id INTEGER NOT NULL,
      company_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('applied', 'shortlisted', 'selected', 'rejected', 'on hold')) DEFAULT 'applied',
      remarks TEXT,
      applied_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      UNIQUE(student_id, drive_id)
    )
  `);

  // Required skills table
  db.exec(`
    CREATE TABLE IF NOT EXISTS required_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      skills TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Database tables created successfully');
};

// Initialize tables
createTables();

// Create default admin user if not exists
const bcrypt = require('bcrypt');
const createDefaultAdmin = async () => {
  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@college.edu');
    
    if (!existing) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)')
        .run('admin@college.edu', hashedPassword, 'Admin User', 'admin');
      console.log('✅ Default admin user created (admin@college.edu / admin123)');
    }
  } catch (error) {
    console.error('Error creating admin:', error.message);
  }
};

createDefaultAdmin();

console.log('✅ SQLite Database connected:', dbPath);

module.exports = db;
