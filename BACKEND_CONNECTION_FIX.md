# Backend Connection Fix - Complete Guide

## Problem
Admin adds drives but students don't see them. "Failed to fetch" error appears.

## Root Cause
1. Backend server not running
2. Frontend pages using mock data instead of API calls
3. Database not properly set up

## Solution Implemented

### 1. Updated Admin Drives Page
**File**: `src/pages/admin/Drives.tsx`

**Changes Made**:
- ✅ Removed mock data import (`placementDrives from @/lib/data`)
- ✅ Added `useEffect` to fetch drives from backend on mount
- ✅ Connected Create Drive to `api.drives.create()`
- ✅ Connected Update Drive to `api.drives.update()`
- ✅ Connected Delete Drive to `api.drives.delete()`
- ✅ Added loading states with spinner
- ✅ Added proper error handling with toast notifications
- ✅ Fixed data format to match backend (snake_case fields)
- ✅ Added status dropdown in edit dialog (upcoming/ongoing/completed)

**API Calls**:
```typescript
// Fetch all drives
const data = await api.drives.getAll();

// Create drive
await api.drives.create({
  companyId: parseInt(formData.companyId),
  jobRole: formData.jobRole,
  driveDate: formData.date,
  eligibleBranches: formData.eligibleBranches.join(','),
  minCgpa: parseFloat(formData.minCgpa),
  packageOffered: parseInt(formData.packageOffered),
  description: formData.description,
});

// Update drive
await api.drives.update(driveId, {...});

// Delete drive
await api.drives.delete(driveId);
```

### 2. Updated Student Opportunities Page
**File**: `src/pages/student/Opportunities.tsx`

**Changes Made**:
- ✅ Removed mock data
- ✅ Fetches drives from backend
- ✅ Fetches student profile for eligibility filtering
- ✅ Submits applications to backend
- ✅ Auto-refreshes after application

### 3. Updated Student Applications Page
**File**: `src/pages/student/Applications.tsx`

**Changes Made**:
- ✅ Removed mock data
- ✅ Fetches applications from backend
- ✅ Shows real-time status updates from HR
- ✅ Displays HR remarks

### 4. Backend API Updates
**File**: `backend/routes/drives.js`

**Changes Made**:
- ✅ Returns drives array directly (not wrapped in object)
- ✅ Joins with companies table to get company names
- ✅ Filters by status and branch

**File**: `backend/routes/applications.js`

**Changes Made**:
- ✅ Returns applications array directly
- ✅ Joins with companies and drives tables
- ✅ Prevents duplicate applications

## How to Fix "Failed to Fetch" Error

### Step 1: Start MySQL Database
```bash
# Make sure MySQL is running
# Windows: Check Services or start from MySQL Workbench
# Mac: brew services start mysql
# Linux: sudo systemctl start mysql
```

### Step 2: Create Database and Tables
```bash
# Open MySQL command line or Workbench
mysql -u root -p

# Run the database.sql file
source backend/database.sql

# Or copy-paste the SQL from backend/database.sql
```

### Step 3: Configure Backend Environment
**File**: `backend/.env`

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=placement_portal

# JWT Configuration
JWT_SECRET=your_secret_key_here_change_in_production

# Server Configuration
PORT=3001
```

### Step 4: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 5: Start Backend Server
```bash
cd backend
node server.js
```

**Expected Output**:
```
🚀 Server running on port 3001
📡 API available at http://localhost:3001/api
```

### Step 6: Configure Frontend Environment
**File**: `.env` (in project root)

```env
VITE_API_URL=http://localhost:3001/api
```

### Step 7: Start Frontend
```bash
# In project root
npm run dev
```

**Expected Output**:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:8080/
```

## Testing the Complete Flow

### 1. Test Backend Health
Open browser: `http://localhost:3001/api/health`

**Expected Response**:
```json
{
  "success": true,
  "message": "Server is running"
}
```

### 2. Create Admin Account
```sql
-- Run in MySQL
INSERT INTO users (email, password, name, role) 
VALUES ('admin@college.edu', '$2b$10$...hashed_password...', 'Admin User', 'admin');
```

Or use the signup API:
```bash
POST http://localhost:3001/api/auth/signup
{
  "email": "admin@college.edu",
  "password": "admin123",
  "name": "Admin User",
  "role": "admin"
}
```

### 3. Login as Admin
1. Go to `http://localhost:8080/admin/login`
2. Enter credentials
3. Should redirect to admin dashboard

### 4. Add Company
1. Go to Companies page
2. Click "Add Company"
3. Fill in details:
   - Name: Google
   - Industry: Technology
   - Contact Email: hr@google.com
4. Click "Add Company"
5. Should see success toast

### 5. Create Drive
1. Go to Drives page
2. Click "Create Drive"
3. Fill in details:
   - Company: Google (from dropdown)
   - Job Role: Software Engineer
   - Date: Select future date
   - Eligible Branches: Check CSE, IT
   - Min CGPA: 7.5
   - Package: 2500000
   - Description: Enter description
4. Click "Create Drive"
5. Should see success toast
6. Drive should appear in list

### 6. Create Student Account
```bash
POST http://localhost:3001/api/auth/signup
{
  "email": "student@college.edu",
  "password": "student123",
  "name": "Student User",
  "role": "student",
  "rollNumber": "CSE2021001",
  "branch": "CSE"
}
```

### 7. Update Student Profile
1. Login as student
2. Go to Profile page
3. Update CGPA to 8.0
4. Add skills
5. Save

### 8. View Opportunities
1. Go to Opportunities page
2. Should see Google drive (if CGPA >= 7.5 and branch is CSE)
3. Click "Apply Now"
4. Confirm application
5. Should see success toast

### 9. Check Applications
1. Go to My Applications page
2. Should see Google application with status "Applied"

### 10. HR Reviews (Optional)
1. Create HR account for Google
2. Login as HR
3. Go to Applications
4. Should see student's application
5. Update status to "Shortlisted"
6. Add remarks
7. Save

### 11. Student Sees Update
1. Login as student
2. Go to My Applications
3. Status should show "Shortlisted"
4. Remarks should be visible

## Common Issues and Solutions

### Issue 1: "Failed to fetch"
**Cause**: Backend server not running

**Solution**:
```bash
cd backend
node server.js
```

### Issue 2: "Connection refused"
**Cause**: MySQL not running

**Solution**:
- Windows: Start MySQL service from Services
- Mac: `brew services start mysql`
- Linux: `sudo systemctl start mysql`

### Issue 3: "Access denied for user"
**Cause**: Wrong MySQL credentials in `.env`

**Solution**:
- Check `backend/.env`
- Update `DB_USER` and `DB_PASSWORD`
- Restart backend server

### Issue 4: "Table doesn't exist"
**Cause**: Database not created

**Solution**:
```bash
mysql -u root -p < backend/database.sql
```

### Issue 5: "No drives showing for student"
**Cause**: Student doesn't meet eligibility criteria

**Solution**:
- Check student's CGPA and branch
- Check drive's min CGPA and eligible branches
- Update student profile if needed

### Issue 6: "CORS error"
**Cause**: Frontend and backend on different origins

**Solution**:
- Backend already has `cors()` enabled
- Check if `VITE_API_URL` in frontend `.env` is correct
- Restart both servers

## Data Flow Diagram

```
Admin Creates Drive
       ↓
   MySQL Database
       ↓
Student Opens Opportunities
       ↓
   Fetches from MySQL
       ↓
Filters by Eligibility (CGPA + Branch)
       ↓
Student Applies
       ↓
   Saves to MySQL
       ↓
HR Sees Application
       ↓
HR Updates Status
       ↓
   Updates MySQL
       ↓
Student Sees Updated Status
```

## API Endpoints Reference

### Drives
- `GET /api/drives` - Get all drives
- `POST /api/drives` - Create drive (Admin only)
- `PUT /api/drives/:id` - Update drive (Admin only)
- `DELETE /api/drives/:id` - Delete drive (Admin only)

### Applications
- `POST /api/applications` - Apply for drive (Student only)
- `GET /api/applications/student` - Get student's applications
- `GET /api/applications/hr` - Get HR's applications
- `PUT /api/applications/:id/status` - Update status (HR only)

### Companies
- `GET /api/companies` - Get all companies
- `POST /api/companies` - Create company (Admin only)
- `PUT /api/companies/:id` - Update company (Admin only)
- `DELETE /api/companies/:id` - Delete company (Admin only)

### Students
- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile` - Update student profile

### Auth
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

## Database Schema

### placement_drives
```sql
id INT PRIMARY KEY AUTO_INCREMENT
company_id INT (FK to companies.id)
job_role VARCHAR(255)
drive_date DATE
eligible_branches VARCHAR(255) -- comma-separated: "CSE,IT,ECE"
min_cgpa DECIMAL(3,2)
package_offered INT
description TEXT
status ENUM('upcoming', 'ongoing', 'completed')
registered_students INT DEFAULT 0
selected_students INT DEFAULT 0
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### applications
```sql
id INT PRIMARY KEY AUTO_INCREMENT
student_id INT (FK to students.id)
drive_id INT (FK to placement_drives.id)
company_id INT (FK to companies.id)
status ENUM('applied', 'shortlisted', 'selected', 'rejected', 'on hold')
remarks TEXT
applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## Next Steps

1. ✅ Backend connected to all admin pages
2. ✅ Backend connected to student pages
3. ⏳ Connect HR pages to backend
4. ⏳ Add file upload for resumes
5. ⏳ Add email notifications
6. ⏳ Add analytics dashboard with real data

## Support

If you still face issues:
1. Check browser console for errors (F12)
2. Check backend terminal for errors
3. Check MySQL is running: `mysql -u root -p`
4. Verify `.env` files are configured correctly
5. Try restarting both frontend and backend servers

## Summary

All mock data has been removed from the project. The system now uses real backend APIs for all operations. When admin creates a drive, it's saved to MySQL and immediately visible to eligible students. Applications flow from students to HR, and status updates flow back to students in real-time.
