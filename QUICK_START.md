# Quick Start Guide 🚀

## Prerequisites
- Node.js installed
- MongoDB installed and running (or use MongoDB Atlas)

## Start the Application

### Option 1: Use the Batch Script (Windows)
```bash
cd smart-campus-pathways-main
start-dev.bat
```

### Option 2: Manual Start
```bash
# Terminal 1 - Start Backend
cd smart-campus-pathways-main/backend
npm start

# Terminal 2 - Start Frontend
cd smart-campus-pathways-main
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001/api
- **Admin Login**: admin@college.edu / admin123

## Quick Test Flow (5 minutes)

### 1. Login as Admin (1 min)
- Go to http://localhost:8080
- Click "Admin Login"
- Email: `admin@college.edu`
- Password: `admin123`

### 2. Add a Company (1 min)
- Click "Companies" in sidebar
- Click "Add Company"
- Fill in:
  - Name: **Google**
  - Industry: **Technology**
  - Contact Email: **hr@google.com**
  - Job Roles: **Software Engineer, Data Scientist**
  - Min Package: **1500000**
  - Max Package: **3000000**
- Click "Add Company"

### 3. Create a Drive (1 min)
- Click "Drives" in sidebar
- Click "Create Drive"
- Fill in:
  - Company: **Google**
  - Job Role: **Software Engineer**
  - Date: **Select tomorrow's date**
  - Package: **1500000**
  - Min CGPA: **7.0**
  - Eligible Branches: **Check CSE, IT, ECE**
  - Description: **Looking for talented engineers**
- Click "Create Drive"

### 4. Test as Student (2 min)
- Open new incognito/private window
- Go to http://localhost:8080
- Click "Student Register"
- Fill in:
  - Name: **Test Student**
  - Email: **student@test.com**
  - Password: **test123**
  - Roll Number: **CSE2021001**
  - Branch: **CSE**
- Click "Register"
- After login, click "Opportunities"
- **✅ You should see the Google drive!**
- Click on the drive card
- Click "Apply Now"
- Go to "My Applications"
- **✅ You should see your application!**

## Verify Database

```bash
# Connect to MongoDB
mongosh

# Switch to database
use placement_portal

# Check companies
db.companies.find().pretty()

# Check drives
db.placementdrives.find().pretty()

# Check applications
db.applications.find().pretty()
```

## Common Issues

### MongoDB Not Running
```bash
# Windows
net start MongoDB

# Or install MongoDB from:
# https://www.mongodb.com/try/download/community
```

### Port Already in Use
```bash
# Kill process on port 3001 (backend)
npx kill-port 3001

# Kill process on port 8080 (frontend)
npx kill-port 8080
```

### "No Token Provided" Error
- Clear browser localStorage
- Login again
- Make sure both servers are running

## What's Working ✅

- ✅ Admin login with real authentication
- ✅ Company CRUD operations (Create, Read, Update, Delete)
- ✅ Drive CRUD operations
- ✅ Student registration and login
- ✅ Student can view drives
- ✅ Student can apply for drives
- ✅ All data persists in MongoDB
- ✅ Real-time updates (no page refresh needed)

## Next Steps

1. **Test HR Module**: Create HR accounts for companies
2. **Test Applications**: HR can view and update application status
3. **Add More Data**: Add multiple companies and drives
4. **Test Filters**: Filter drives by status, branch, etc.
5. **Test Analytics**: View placement statistics

## Need Help?

Check these files:
- `MONGODB_INTEGRATION_COMPLETE.md` - Detailed integration guide
- `START_SERVERS.md` - Server startup instructions
- `TESTING_GUIDE.md` - Comprehensive testing guide
- `README.md` - Project overview

## Success! 🎉

If you can see the drive in the student's opportunities page after creating it as admin, **everything is working perfectly!** Your placement portal is now fully functional with MongoDB backend.
