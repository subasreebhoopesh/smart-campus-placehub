# Complete Setup Guide - Backend + Frontend Integration

## 🎯 Overview

This guide will help you set up the complete placement management system with:
- ✅ Node.js + Express + MySQL Backend
- ✅ React + TypeScript Frontend
- ✅ Unified Authentication
- ✅ Separate Student Registration
- ✅ Real-time Data Synchronization

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🚀 Step-by-Step Setup

### Step 1: Database Setup

1. **Start MySQL Server**
```bash
# Windows
net start MySQL80

# Mac/Linux
sudo systemctl start mysql
```

2. **Login to MySQL**
```bash
mysql -u root -p
```

3. **Create Database and Tables**
```sql
-- Copy and paste the entire content from backend/database.sql
-- Or run:
source C:/path/to/smart-campus-pathways-main/backend/database.sql
```

4. **Verify Database**
```sql
USE placement_portal;
SHOW TABLES;
-- Should show: users, students, companies, hr, placement_drives, applications, required_skills
```

### Step 2: Backend Setup

1. **Navigate to Backend Directory**
```bash
cd smart-campus-pathways-main/backend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment**
Edit `backend/.env`:
```
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=placement_portal
JWT_SECRET=your_secret_key_here
```

4. **Start Backend Server**
```bash
npm start
```

You should see:
```
✅ Database connected successfully
🚀 Server running on port 3001
📡 API available at http://localhost:3001/api
```

5. **Test Backend**
Open browser: http://localhost:3001/api/health
Should return: `{"success":true,"message":"Server is running"}`

### Step 3: Frontend Setup

1. **Navigate to Frontend Directory**
```bash
cd smart-campus-pathways-main
```

2. **Install Dependencies** (if not already done)
```bash
npm install
```

3. **Configure Environment**
The `.env` file is already created with:
```
VITE_API_URL=http://localhost:3001/api
```

4. **Start Frontend Server**
```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:8080/
➜  Network: use --host to expose
```

### Step 4: Test the System

#### Test 1: Student Registration

1. Go to: http://localhost:8080/register
2. Fill in the form:
   - Name: Test Student
   - Email: test@college.edu
   - Roll Number: CSE2024001
   - Branch: CSE
   - Password: test123
   - Confirm Password: test123
3. Click "Create Account"
4. Should redirect to login page with success message

#### Test 2: Student Login

1. Go to: http://localhost:8080/login
2. Enter:
   - Email: test@college.edu
   - Password: test123
3. Click "Sign In"
4. Should redirect to /student/dashboard

#### Test 3: Admin Login

1. Go to: http://localhost:8080/login
2. Enter:
   - Email: admin@college.edu
   - Password: admin123
3. Click "Sign In"
4. Should redirect to /admin/dashboard

#### Test 4: Complete Data Flow

**Admin Creates Company:**
1. Login as admin
2. Go to Companies
3. Click "Add Company"
4. Fill details:
   - Name: Tesla
   - Industry: Automotive
   - Email: hr@tesla.com
   - Job Roles: Software Engineer, Mechanical Engineer
   - Package: 1800000 - 3500000
5. Click "Add Company"
6. Check database: `SELECT * FROM companies;`

**Admin Creates Drive:**
1. Go to Drives
2. Click "Create Drive"
3. Select Company: Tesla
4. Fill details:
   - Job Role: Software Engineer
   - Date: 2024-03-25
   - Package: 2500000
   - Min CGPA: 7.5
   - Branches: CSE, IT, ECE
5. Click "Create Drive"
6. Check database: `SELECT * FROM placement_drives;`

**Student Applies:**
1. Logout and login as student (test@college.edu)
2. Go to Opportunities
3. Find Tesla drive
4. Click "Apply Now"
5. Confirm application
6. Check database: `SELECT * FROM applications;`

**Admin Creates HR:**
1. Login as admin
2. Go to HR Credentials
3. Click "Create HR Login"
4. Fill details:
   - Company: Tesla
   - Name: Tesla HR
   - Email: hr@tesla.com
   - Password: hr123
5. Click "Create Login"
6. Check database: `SELECT * FROM users WHERE role='hr';`

**HR Reviews Application:**
1. Logout and login at /login
2. Enter:
   - Email: hr@tesla.com
   - Password: hr123
3. Should redirect to /hr/dashboard
4. Go to Applications
5. See student's application
6. Click menu → Select
7. Add remarks: "Selected for interview"
8. Click "Update Status"
9. Check database: `SELECT * FROM applications;`

**Student Sees Status:**
1. Logout and login as student
2. Go to My Applications
3. Should see "Selected" status with HR remarks

## 📊 Database Verification

### Check Users
```sql
SELECT id, email, name, role FROM users;
```

### Check Students
```sql
SELECT s.*, u.name, u.email 
FROM students s 
JOIN users u ON s.user_id = u.id;
```

### Check Companies
```sql
SELECT * FROM companies;
```

### Check Drives
```sql
SELECT d.*, c.name as company_name 
FROM placement_drives d 
JOIN companies c ON d.company_id = c.id;
```

### Check Applications
```sql
SELECT a.*, 
       u.name as student_name,
       c.name as company_name,
       d.job_role
FROM applications a
JOIN students s ON a.student_id = s.id
JOIN users u ON s.user_id = u.id
JOIN companies c ON a.company_id = c.id
JOIN placement_drives d ON a.drive_id = d.id;
```

## 🔧 Troubleshooting

### Backend Issues

**Error: Database connection failed**
- Check MySQL is running
- Verify credentials in `.env`
- Check database exists: `SHOW DATABASES;`

**Error: Port 3001 already in use**
- Change PORT in `.env` to 3002
- Update VITE_API_URL in frontend `.env`

**Error: Cannot find module**
- Run `npm install` in backend directory

### Frontend Issues

**Error: Network Error / Failed to fetch**
- Check backend is running on port 3001
- Verify VITE_API_URL in `.env`
- Check CORS is enabled in backend

**Error: Cannot read property of undefined**
- Check API response format
- Verify token is being sent
- Check browser console for errors

### Database Issues

**Error: Table doesn't exist**
- Run database.sql again
- Check you're in correct database: `USE placement_portal;`

**Error: Duplicate entry**
- Email already exists
- Use different email or delete existing user

## 📝 API Endpoints

### Authentication
- POST /api/auth/signup - Register new user
- POST /api/auth/login - Login
- POST /api/auth/select-company - HR selects company

### Companies
- GET /api/companies - Get all companies
- POST /api/companies - Create company (Admin)
- PUT /api/companies/:id - Update company (Admin)
- DELETE /api/companies/:id - Delete company (Admin)

### Drives
- GET /api/drives - Get all drives
- POST /api/drives - Create drive (Admin)
- PUT /api/drives/:id - Update drive (Admin)
- DELETE /api/drives/:id - Delete drive (Admin)

### Applications
- POST /api/applications - Apply for drive (Student)
- GET /api/applications/student - Get student applications
- GET /api/applications/hr - Get HR applications
- PUT /api/applications/:id/status - Update status (HR)

### Students
- GET /api/students/profile - Get profile
- PUT /api/students/profile - Update profile
- GET /api/students - Get all students (Admin)

### HR
- GET /api/hr/skills - Get required skills
- POST /api/hr/skills - Set required skills
- GET /api/hr/stats - Get dashboard stats

### Admin
- GET /api/admin/stats - Get dashboard stats
- POST /api/admin/hr - Create HR credential
- GET /api/admin/hr - Get all HR credentials
- DELETE /api/admin/hr/:id - Delete HR credential

## 🎯 Test Credentials

### Admin
- Email: admin@college.edu
- Password: admin123

### Student (After Registration)
- Email: test@college.edu
- Password: test123

### HR (After Admin Creates)
- Email: hr@tesla.com
- Password: hr123

## 🔄 Data Flow

```
1. Admin creates company → Saved to MySQL
2. Admin creates drive → Saved to MySQL
3. Student registers → Saved to MySQL
4. Student logs in → JWT token generated
5. Student applies → Application saved to MySQL
6. Admin creates HR → HR user saved to MySQL
7. HR logs in → JWT token generated
8. HR views applications → Fetched from MySQL
9. HR selects student → Status updated in MySQL
10. Student sees status → Fetched from MySQL
```

## ✅ Success Checklist

- [ ] MySQL server running
- [ ] Database created with all tables
- [ ] Backend server running on port 3001
- [ ] Frontend server running on port 8080
- [ ] Can register new student
- [ ] Can login as student
- [ ] Can login as admin
- [ ] Admin can create company
- [ ] Admin can create drive
- [ ] Student can see drives
- [ ] Student can apply
- [ ] Admin can create HR
- [ ] HR can login
- [ ] HR can see applications
- [ ] HR can update status
- [ ] Student can see updated status

## 🎉 You're All Set!

The system is now fully functional with:
- ✅ Complete backend API
- ✅ MySQL database
- ✅ Unified authentication
- ✅ Separate student registration
- ✅ Real-time data synchronization
- ✅ Role-based access control

## 📞 Support

If you encounter issues:
1. Check backend console for errors
2. Check frontend browser console
3. Verify database connections
4. Check API responses in Network tab
5. Ensure all services are running

## 🚀 Next Steps

1. Add file upload for resumes
2. Add email notifications
3. Add real-time updates with WebSocket
4. Deploy to production server
5. Add advanced analytics
6. Implement caching
7. Add API rate limiting
8. Set up monitoring

Enjoy your fully functional placement management system! 🎓
