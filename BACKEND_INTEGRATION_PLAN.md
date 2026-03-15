# Backend Integration Plan - Complete System

## 🎯 System Architecture

### Unified Authentication Flow
```
User enters: email + password
    ↓
Backend validates credentials
    ↓
Backend returns: { user, role, token }
    ↓
Frontend redirects based on role:
- role: "admin" → /admin/dashboard
- role: "student" → /student/dashboard
- role: "hr" → /hr/dashboard (after company selection)
```

## 🗄️ Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- hashed
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'student', 'hr') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. Students Table
```sql
CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  roll_number VARCHAR(50) UNIQUE NOT NULL,
  branch VARCHAR(50) NOT NULL,
  cgpa DECIMAL(3,2),
  phone VARCHAR(20),
  skills JSON, -- ["React", "Node.js"]
  resume_url VARCHAR(500),
  tenth_percentage DECIMAL(5,2),
  twelfth_percentage DECIMAL(5,2),
  profile_photo_url VARCHAR(500),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. Companies Table
```sql
CREATE TABLE companies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(255),
  website VARCHAR(500),
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  job_roles JSON, -- ["Software Engineer", "Data Scientist"]
  package_min INT,
  package_max INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. HR Table
```sql
CREATE TABLE hr (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  company_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE KEY unique_hr_company (user_id, company_id)
);
```

### 5. Placement Drives Table
```sql
CREATE TABLE placement_drives (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  job_role VARCHAR(255) NOT NULL,
  drive_date DATE NOT NULL,
  eligible_branches JSON, -- ["CSE", "IT", "ECE"]
  min_cgpa DECIMAL(3,2),
  package_offered INT,
  status ENUM('upcoming', 'ongoing', 'completed') DEFAULT 'upcoming',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
```

### 6. Applications Table
```sql
CREATE TABLE applications (
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
```

### 7. Required Skills Table
```sql
CREATE TABLE required_skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
```

## 🔌 API Endpoints

### Authentication APIs

#### 1. Sign Up
```
POST /api/auth/signup
Body: {
  email: string,
  password: string,
  name: string,
  role: "student" | "hr",
  // For students:
  rollNumber?: string,
  branch?: string,
  // For HR:
  companyId?: number
}
Response: {
  success: boolean,
  message: string,
  userId: number
}
```

#### 2. Login
```
POST /api/auth/login
Body: {
  email: string,
  password: string
}
Response: {
  success: boolean,
  token: string,
  user: {
    id: number,
    email: string,
    name: string,
    role: "admin" | "student" | "hr"
  },
  // If role is "hr":
  companies?: [{ id: number, name: string }],
  // If role is "student":
  studentProfile?: { rollNumber, branch, cgpa, ... }
}
```

#### 3. Select Company (HR Only)
```
POST /api/auth/select-company
Headers: { Authorization: "Bearer <token>" }
Body: {
  companyId: number
}
Response: {
  success: boolean,
  company: { id, name }
}
```

### Company APIs

#### 4. Get All Companies
```
GET /api/companies
Headers: { Authorization: "Bearer <token>" }
Response: {
  success: boolean,
  companies: [...]
}
```

#### 5. Create Company (Admin Only)
```
POST /api/companies
Headers: { Authorization: "Bearer <token>" }
Body: {
  name: string,
  industry: string,
  website: string,
  contactPerson: string,
  contactEmail: string,
  contactPhone: string,
  jobRoles: string[],
  packageMin: number,
  packageMax: number
}
Response: {
  success: boolean,
  company: { id, name, ... }
}
```

#### 6. Update Company
```
PUT /api/companies/:id
Headers: { Authorization: "Bearer <token>" }
Body: { ... company fields ... }
Response: { success, company }
```

#### 7. Delete Company
```
DELETE /api/companies/:id
Headers: { Authorization: "Bearer <token>" }
Response: { success, message }
```

### Placement Drive APIs

#### 8. Get All Drives
```
GET /api/drives
Headers: { Authorization: "Bearer <token>" }
Query: ?status=upcoming&branch=CSE
Response: {
  success: boolean,
  drives: [...]
}
```

#### 9. Create Drive (Admin Only)
```
POST /api/drives
Headers: { Authorization: "Bearer <token>" }
Body: {
  companyId: number,
  jobRole: string,
  driveDate: string,
  eligibleBranches: string[],
  minCgpa: number,
  packageOffered: number,
  description: string
}
Response: { success, drive }
```

#### 10. Update Drive
```
PUT /api/drives/:id
Headers: { Authorization: "Bearer <token>" }
Body: { ... drive fields ... }
Response: { success, drive }
```

#### 11. Delete Drive
```
DELETE /api/drives/:id
Headers: { Authorization: "Bearer <token>" }
Response: { success, message }
```

### Application APIs

#### 12. Apply for Drive (Student Only)
```
POST /api/applications
Headers: { Authorization: "Bearer <token>" }
Body: {
  driveId: number
}
Response: {
  success: boolean,
  application: { id, status, ... }
}
```

#### 13. Get Student Applications
```
GET /api/applications/student
Headers: { Authorization: "Bearer <token>" }
Response: {
  success: boolean,
  applications: [...]
}
```

#### 14. Get HR Applications (HR Only)
```
GET /api/applications/hr
Headers: { Authorization: "Bearer <token>" }
Query: ?status=applied&companyId=1
Response: {
  success: boolean,
  applications: [{
    id,
    student: { name, email, rollNumber, branch, cgpa, skills, resumeUrl },
    drive: { jobRole, driveDate },
    status,
    remarks,
    appliedDate,
    skillMatch: 75 // calculated by backend
  }]
}
```

#### 15. Update Application Status (HR Only)
```
PUT /api/applications/:id/status
Headers: { Authorization: "Bearer <token>" }
Body: {
  status: "shortlisted" | "selected" | "rejected" | "on-hold",
  remarks: string
}
Response: { success, application }
```

### Student Profile APIs

#### 16. Get Student Profile
```
GET /api/students/profile
Headers: { Authorization: "Bearer <token>" }
Response: {
  success: boolean,
  profile: { rollNumber, branch, cgpa, skills, ... }
}
```

#### 17. Update Student Profile
```
PUT /api/students/profile
Headers: { Authorization: "Bearer <token>" }
Body: {
  cgpa: number,
  skills: string[],
  tenthPercentage: number,
  twelfthPercentage: number,
  phone: string
}
Response: { success, profile }
```

#### 18. Upload Resume
```
POST /api/students/resume
Headers: { Authorization: "Bearer <token>" }
Body: FormData with file
Response: {
  success: boolean,
  resumeUrl: string
}
```

#### 19. Upload Profile Photo
```
POST /api/students/profile-photo
Headers: { Authorization: "Bearer <token>" }
Body: FormData with file
Response: {
  success: boolean,
  photoUrl: string
}
```

### HR Skills APIs

#### 20. Get Required Skills
```
GET /api/hr/skills
Headers: { Authorization: "Bearer <token>" }
Response: {
  success: boolean,
  skills: ["React", "Node.js", ...]
}
```

#### 21. Set Required Skills
```
POST /api/hr/skills
Headers: { Authorization: "Bearer <token>" }
Body: {
  skills: ["React", "Node.js", "Python"]
}
Response: { success, skills }
```

### Analytics APIs

#### 22. Get Admin Dashboard Stats
```
GET /api/admin/stats
Headers: { Authorization: "Bearer <token>" }
Response: {
  success: boolean,
  stats: {
    totalStudents,
    placedStudents,
    totalCompanies,
    activeDrives,
    totalApplications
  }
}
```

#### 23. Get HR Dashboard Stats
```
GET /api/hr/stats
Headers: { Authorization: "Bearer <token>" }
Response: {
  success: boolean,
  stats: {
    totalApplications,
    shortlisted,
    selected,
    rejected,
    onHold
  }
}
```

## 🔐 Authentication Flow

### Sign Up Flow
```javascript
// Frontend
const handleSignUp = async (data) => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (response.ok) {
    // Redirect to login
    navigate('/login');
    toast.success('Account created! Please login.');
  }
};
```

### Login Flow
```javascript
// Frontend
const handleLogin = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store token
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Redirect based on role
    if (data.user.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (data.user.role === 'student') {
      navigate('/student/dashboard');
    } else if (data.user.role === 'hr') {
      // If HR has multiple companies, show selection
      if (data.companies.length > 1) {
        setShowCompanySelection(true);
      } else {
        navigate('/hr/dashboard');
      }
    }
  }
};
```

### HR Company Selection
```javascript
// Frontend
const handleCompanySelect = async (companyId) => {
  const response = await fetch('/api/auth/select-company', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ companyId })
  });
  
  if (response.ok) {
    navigate('/hr/dashboard');
  }
};
```

## 🔄 Data Flow Examples

### Example 1: Admin Creates Company → Student Sees It

```
1. Admin creates company:
   POST /api/companies
   { name: "Google", ... }
   
2. Backend saves to database:
   INSERT INTO companies ...
   
3. Student views opportunities:
   GET /api/drives
   
4. Backend returns drives with company info:
   SELECT d.*, c.name as companyName
   FROM placement_drives d
   JOIN companies c ON d.company_id = c.id
   
5. Student sees "Google" in opportunities list
```

### Example 2: Student Applies → HR Sees Application

```
1. Student applies:
   POST /api/applications
   { driveId: 1 }
   
2. Backend creates application:
   INSERT INTO applications
   (student_id, drive_id, company_id, status)
   VALUES (1, 1, 1, 'applied')
   
3. HR views applications:
   GET /api/applications/hr?companyId=1
   
4. Backend returns applications:
   SELECT a.*, s.*, u.name, u.email
   FROM applications a
   JOIN students s ON a.student_id = s.id
   JOIN users u ON s.user_id = u.id
   WHERE a.company_id = 1
   
5. HR sees student's application with all details
```

### Example 3: HR Selects Student → Student Sees Status

```
1. HR updates status:
   PUT /api/applications/1/status
   { status: "selected", remarks: "Great candidate" }
   
2. Backend updates database:
   UPDATE applications
   SET status = 'selected', remarks = '...'
   WHERE id = 1
   
3. Student checks applications:
   GET /api/applications/student
   
4. Backend returns updated status:
   SELECT a.*, c.name as companyName, d.job_role
   FROM applications a
   JOIN companies c ON a.company_id = c.id
   JOIN placement_drives d ON a.drive_id = d.id
   WHERE a.student_id = 1
   
5. Student sees "Selected" status with HR remarks
```

## 🛠️ Implementation Steps

### Phase 1: Backend Setup (Node.js + Express + MySQL)

1. **Initialize Backend**
```bash
mkdir backend
cd backend
npm init -y
npm install express mysql2 bcrypt jsonwebtoken cors dotenv multer
```

2. **Create Database Connection**
```javascript
// config/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
```

3. **Create Auth Middleware**
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
```

4. **Create Routes**
```javascript
// routes/auth.js
// routes/companies.js
// routes/drives.js
// routes/applications.js
// routes/students.js
// routes/hr.js
```

### Phase 2: Frontend Integration

1. **Create API Service**
```javascript
// src/services/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('token');

export const api = {
  // Auth
  login: (email, password) => 
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }),
  
  signup: (data) =>
    fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
  
  // Companies
  getCompanies: () =>
    fetch(`${API_BASE_URL}/companies`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    }),
  
  createCompany: (data) =>
    fetch(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    }),
  
  // Applications
  applyForDrive: (driveId) =>
    fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ driveId })
    }),
  
  getStudentApplications: () =>
    fetch(`${API_BASE_URL}/applications/student`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    }),
  
  getHRApplications: (companyId) =>
    fetch(`${API_BASE_URL}/applications/hr?companyId=${companyId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    }),
  
  updateApplicationStatus: (id, status, remarks) =>
    fetch(`${API_BASE_URL}/applications/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ status, remarks })
    })
};
```

2. **Update AuthContext**
```javascript
// Replace localStorage logic with API calls
const login = async (email, password) => {
  const response = await api.login(email, password);
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return { success: true, user: data.user, companies: data.companies };
  }
  return { success: false };
};
```

3. **Update CompaniesContext**
```javascript
// Replace localStorage with API calls
const loadCompanies = async () => {
  const response = await api.getCompanies();
  const data = await response.json();
  setCompanies(data.companies);
};

const addCompany = async (company) => {
  const response = await api.createCompany(company);
  const data = await response.json();
  if (data.success) {
    setCompanies([...companies, data.company]);
  }
};
```

## 📝 Environment Variables

### Backend (.env)
```
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=placement_portal
JWT_SECRET=your_secret_key_here
UPLOAD_DIR=./uploads
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001/api
```

## 🚀 Deployment

### Backend
```bash
# Start backend server
cd backend
npm start
```

### Frontend
```bash
# Start frontend
cd smart-campus-pathways-main
npm run dev
```

## ✅ Testing Checklist

- [ ] Sign up as student
- [ ] Login with same credentials
- [ ] Admin creates company
- [ ] Student sees company in opportunities
- [ ] Student applies for drive
- [ ] HR logs in and selects company
- [ ] HR sees student application
- [ ] HR updates status to "selected"
- [ ] Student sees updated status
- [ ] All data persists in database

This plan provides a complete backend integration strategy with all necessary APIs, database schema, and implementation steps!
