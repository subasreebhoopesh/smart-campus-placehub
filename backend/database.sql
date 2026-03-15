-- Create Database
CREATE DATABASE IF NOT EXISTS placement_portal;
USE placement_portal;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'student', 'hr') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  roll_number VARCHAR(50) UNIQUE NOT NULL,
  branch VARCHAR(50) NOT NULL,
  cgpa DECIMAL(3,2) DEFAULT 0.00,
  phone VARCHAR(20),
  skills JSON,
  resume_url VARCHAR(500),
  tenth_percentage DECIMAL(5,2),
  twelfth_percentage DECIMAL(5,2),
  profile_photo_url VARCHAR(500),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(255),
  website VARCHAR(500),
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  job_roles JSON,
  package_min INT,
  package_max INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HR Table
CREATE TABLE IF NOT EXISTS hr (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  company_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE KEY unique_hr_company (user_id, company_id)
);

-- Placement Drives Table
CREATE TABLE IF NOT EXISTS placement_drives (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  job_role VARCHAR(255) NOT NULL,
  drive_date DATE NOT NULL,
  eligible_branches JSON,
  min_cgpa DECIMAL(3,2),
  package_offered INT,
  status ENUM('upcoming', 'ongoing', 'completed') DEFAULT 'upcoming',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  drive_id INT NOT NULL,
  company_id INT NOT NULL,
  status ENUM('applied', 'shortlisted', 'selected', 'rejected', 'on-hold') DEFAULT 'applied',
  remarks TEXT,
  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE KEY unique_application (student_id, drive_id)
);

-- Required Skills Table
CREATE TABLE IF NOT EXISTS required_skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Insert Default Admin User (password: admin123)
INSERT INTO users (email, password, name, role) VALUES 
('admin@college.edu', '$2b$10$rKvVPZZ8vH5qF5qF5qF5qOqF5qF5qF5qF5qF5qF5qF5qF5qF5qF5q', 'Admin User', 'admin');

-- Insert Sample Companies
INSERT INTO companies (name, industry, website, contact_email, job_roles, package_min, package_max) VALUES
('Google', 'Technology', 'https://google.com', 'hr@google.com', '["Software Engineer", "Product Manager"]', 2000000, 3500000),
('Microsoft', 'Technology', 'https://microsoft.com', 'campus@microsoft.com', '["Software Developer", "Cloud Engineer"]', 1800000, 3000000),
('Amazon', 'E-commerce/Technology', 'https://amazon.com', 'university@amazon.com', '["SDE", "Data Engineer"]', 2200000, 4000000);

-- Insert Sample Drives
INSERT INTO placement_drives (company_id, job_role, drive_date, eligible_branches, min_cgpa, package_offered, status, description) VALUES
(1, 'Software Engineer', '2024-03-15', '["CSE", "IT", "ECE"]', 8.0, 2500000, 'upcoming', 'Google is hiring Software Engineers for their Bangalore office.'),
(2, 'Software Developer', '2024-03-10', '["CSE", "IT"]', 7.5, 2200000, 'upcoming', 'Microsoft is looking for passionate developers.'),
(3, 'SDE-1', '2024-03-20', '["CSE", "IT"]', 7.0, 2800000, 'upcoming', 'Amazon campus drive for fresh graduates.');
