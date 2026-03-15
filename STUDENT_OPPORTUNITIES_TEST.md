# Student Opportunities - Backend Connection Test

## ✅ Current Status

The Student Opportunities page is **ALREADY CONNECTED** to the MongoDB backend!

### What's Connected:
- ✅ Student Opportunities page fetches drives from MongoDB
- ✅ Drives are filtered by student's branch and CGPA
- ✅ Students can apply for drives
- ✅ Applications are saved to MongoDB
- ✅ Real-time data from database

## 🔍 How It Works

### Data Flow:
```
Admin creates drive → MongoDB → Student sees drive → Student applies → MongoDB
```

### Backend Routes Used:
1. `GET /api/drives` - Fetch all drives
2. `GET /api/students/profile` - Get student profile (branch, CGPA)
3. `POST /api/applications` - Submit application

### Eligibility Filter:
Students only see drives where:
- Their branch is in `eligible_branches`
- Their CGPA >= `min_cgpa`
- Drive status is "upcoming" or "ongoing"

## 🧪 Complete Test Flow

### Step 1: Admin Creates Drive (2 minutes)

1. **Login as Admin**:
   - URL: http://localhost:8080
   - Email: `admin@college.edu`
   - Password: `admin123`

2. **Add Company** (if not exists):
   - Go to "Companies"
   - Click "Add Company"
   - Fill in:
     ```
     Name: Google
     Industry: Technology
     Contact Email: hr@google.com
     Job Roles: Software Engineer
     Min Package: 1500000
     Max Package: 3000000
     ```
   - Click "Add Company"

3. **Create Drive**:
   - Go to "Drives"
   - Click "Create Drive"
   - Fill in:
     ```
     Company: Google
     Job Role: Software Engineer
     Date: [Tomorrow's date]
     Package: 1500000
     Min CGPA: 7.0
     Eligible Branches: ✓ CSE, ✓ IT, ✓ ECE
     Description: Looking for talented engineers
     ```
   - Click "Create Drive"
   - ✅ Drive should appear in admin's drive list

### Step 2: Student Registers (1 minute)

1. **Open New Incognito Window**:
   - URL: http://localhost:8080

2. **Register as Student**:
   - Click "Student Register"
   - Fill in:
     ```
     Name: Test Student
     Email: student@test.com
     Password: test123
     Roll Number: CSE2021001
     Branch: CSE
     ```
   - Click "Register"
   - ✅ Should be logged in automatically

### Step 3: Student Views Opportunities (30 seconds)

1. **Navigate to Opportunities**:
   - Click "Opportunities" in sidebar
   - ✅ **YOU SHOULD SEE THE GOOGLE DRIVE!**

2. **Verify Drive Details**:
   - Company name: Google
   - Job role: Software Engineer
   - Package: ₹15.0 LPA
   - Min CGPA: 7.0
   - Eligible branches: CSE, IT, ECE
   - Status: Upcoming

### Step 4: Student Applies (30 seconds)

1. **Apply for Drive**:
   - Click "Apply Now" button
   - Review details in dialog
   - Click "Confirm Application"
   - ✅ Success message should appear

2. **Check Application**:
   - Click "My Applications" in sidebar
   - ✅ Should see application with status "Applied"

## 🔍 Debugging

### Check Browser Console

Open DevTools (F12) → Console tab:

**Expected logs:**
```
Fetching student opportunities...
Student profile: { branch: "CSE", cgpa: 0, ... }
Drives data received: [{ company_name: "Google", ... }]
```

**If you see errors:**
- Check if student is logged in
- Verify backend is running
- Check MongoDB connection

### Check Backend Logs

Backend terminal should show:
```
GET /api/students/profile 200
GET /api/drives 200
```

### Check MongoDB Data

```bash
mongosh
use placement_portal

# Check if drive exists
db.placementdrives.find().pretty()

# Check if student exists
db.students.find().pretty()

# Check if application was created
db.applications.find().pretty()
```

## ❌ Common Issues

### Issue 1: Student Doesn't See Any Drives

**Possible Causes:**
1. Student's branch not in eligible branches
2. Student's CGPA < min CGPA
3. Drive status is "completed"
4. No drives in database

**Solution:**
- Check student profile: CGPA should be >= drive's min CGPA
- Check drive eligible branches: Should include student's branch
- Create drive with CSE branch and 0.0 min CGPA for testing

### Issue 2: "Failed to load opportunities" Error

**Possible Causes:**
1. Backend not running
2. Student not logged in
3. MongoDB not connected

**Solution:**
```bash
# Check backend is running
curl http://localhost:3001/api/health

# Check MongoDB is running
mongosh

# Restart backend
cd backend
node server.js
```

### Issue 3: Student Profile Not Found

**Possible Causes:**
1. Student registered but profile not created
2. Database connection issue

**Solution:**
- Re-register the student
- Check MongoDB for student record:
  ```bash
  mongosh
  use placement_portal
  db.students.find()
  ```

## ✅ Verification Checklist

After completing the test flow, verify:

- [ ] Admin can create drives
- [ ] Drives are saved to MongoDB
- [ ] Student can see drives in Opportunities page
- [ ] Only eligible drives are shown (branch + CGPA match)
- [ ] Student can apply for drives
- [ ] Applications are saved to MongoDB
- [ ] Student can see applications in My Applications page

## 📊 Expected Behavior

### When Admin Creates Drive:
1. Drive is saved to MongoDB `placementdrives` collection
2. Drive has `companyId`, `jobRole`, `eligibleBranches`, `minCgpa`, etc.
3. Drive status is "upcoming" by default

### When Student Views Opportunities:
1. Frontend fetches student profile from `/api/students/profile`
2. Frontend fetches all drives from `/api/drives`
3. Frontend filters drives by:
   - Student's branch in `eligible_branches`
   - Student's CGPA >= `min_cgpa`
   - Drive status is "upcoming" or "ongoing"
4. Only eligible drives are displayed

### When Student Applies:
1. Frontend sends POST to `/api/applications`
2. Application is saved to MongoDB `applications` collection
3. Application has `studentId`, `driveId`, `status: "applied"`
4. Success message is shown
5. Drive's `registered_students` count increases

## 🎯 Success Indicators

✅ **Everything is working when:**
1. Admin creates drive → Drive appears in admin's list
2. Student logs in → Can see Opportunities page
3. Student sees the drive → Drive details are correct
4. Student applies → Success message appears
5. Student checks applications → Application is listed
6. Data persists → Survives page refresh and server restart

## 🚀 What's Already Working

The connection is **ALREADY COMPLETE**! The code is:
- ✅ Fetching drives from MongoDB
- ✅ Filtering by eligibility
- ✅ Displaying in UI
- ✅ Handling applications
- ✅ Saving to database

**Just test it following the steps above!**

## 📝 Code References

### Frontend:
- `src/pages/student/Opportunities.tsx` - Main opportunities page
- `src/services/api.ts` - API service with backend calls

### Backend:
- `backend/routes/drives-mongodb.js` - Drives API
- `backend/routes/students-mongodb.js` - Students API
- `backend/routes/applications-mongodb.js` - Applications API
- `backend/models/PlacementDrive.js` - Drive model
- `backend/models/Student.js` - Student model
- `backend/models/Application.js` - Application model

## 🎉 Conclusion

The Student Opportunities page is **fully connected to MongoDB backend**. When admin creates a drive, students can see it immediately in their Opportunities page (if they meet eligibility criteria).

**Test it now following the steps above!** 🚀
