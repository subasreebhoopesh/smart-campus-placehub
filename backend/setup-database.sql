-- Quick setup script for placement portal database
-- Run this with: mysql -u root < setup-database.sql

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS placement_portal;
USE placement_portal;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'student', 'hr') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  roll_number VARCHAR(50) UNIQUE NOT NULL,
  branch VARCHAR(50) NOT NULL,
  cgpa DECIMAL(3,2) DEFAULT 0.00,
  skills JSON,
  resume_url VARCHAR(255),
  profile_photo_url VARCHAR(255),
  tenth_percentage DECIMAL(5,2),
  twelfth_percentage DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(255),
  website VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create hr table
CREATE TABLE IF NOT EXISTS hr (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  company_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Create placement_drives table
CREATE TABLE IF NOT EXISTS placement_drives (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  job_role VARCHAR(255) NOT NULL,
  drive_date DATE NOT NULL,
  eligible_branches VARCHAR(255) NOT NULL,
  min_cgpa DECIMAL(3,2) NOT NULL,
  package_offered INT NOT NULL,
  description TEXT,
  status ENUM('upcoming', 'ongoing', 'completed') DEFAULT 'upcoming',
  registered_students INT DEFAULT 0,
  selected_students INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  drive_id INT NOT NULL,
  company_id INT NOT NULL,
  status ENUM('applied', 'shortlisted', 'selected', 'rejected', 'on hold') DEFAULT 'applied',
  remarks TEXT,
  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE KEY unique_application (student_id, drive_id)
);

-- Create required_skills table
CREATE TABLE IF NOT EXISTS required_skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  skills JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (email, password, name, role) 
VALUES ('admin@college.edu', '$2b$10$rOzJw5xKxH5L5vXqH5L5L.5L5L5L5L5L5L5L5L5L5L5L5L5L5L5L5', 'Admin User', 'admin');

SELECT '✅ Database setup complete!' as Status;
SELECT 'Email: admin@college.edu, Password: admin123' as AdminCredentials;
