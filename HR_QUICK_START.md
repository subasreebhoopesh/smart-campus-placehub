# HR System - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Start Everything
```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Backend
cd backend
npm start

# Terminal 3: Frontend
npm run dev
```

### Step 2: Create Admin (First Time Only)
```bash
cd backend
node seed-admin.js
```
**Credentials:** admin@college.edu / admin123

### Step 3: Create Company (Admin UI)
1. Go to http://localhost:8080/admin-login
2. Login as admin
3. Companies → Add Company
4. Name: "Google" (or any company name)

### Step 4: Create HR Account (Backend Script)
```bash
cd backend
node create-hr.js hr@google.com hr123 "Google HR" "Google"
```

### Step 5: Create Drive (Admin UI)
1. Still logged in as admin
2. Drives → Add Drive
3. Select company: Google
4. Fill in job details
5. Set eligibility (branches, CGPA)

### Step 6: Test with Student
1. Register at http://localhost:8080/student-register
2. Complete profile with skills
3. Go to Opportunities
4. Apply to the drive

### Step 7: View as HR
1. Login at http://localhost:8080/hr-login
2. Email: hr@google.com
3. Password: hr123
4. Go to Applications
5. See the student's application! ✅

## 📋 What HR Can Do

### View Applications
- See all students who applied to your company's drives
- View complete student profiles
- See skills, projects, CGPA, contact info

### Skill Matching
- Set required skills in Skills page
- System shows match percentage
- Students with 70%+ match highlighted

### Manage Applications
- **Shortlist** - Mark promising candidates
- **Select** - Offer position
- **On Hold** - Keep for later
- **Reject** - Not suitable
- Add remarks/feedback for each

### Review Details
- Academic records (10th, 12th, CGPA)
- Skills list
- Projects with descriptions
- Contact information
- Resume download

## 🔑 Key Points

### Company-Specific Access
✅ Each HR only sees their company's applications
✅ Multiple HR can exist for same company
✅ Data is isolated by company ID

### Real-Time Data
✅ All data from MongoDB
✅ No localStorage
✅ Instant updates

### Complete Student Info
✅ Full profile with skills
✅ Projects and experience
✅ Academic history
✅ Contact details

## 🐛 Quick Troubleshooting

### HR sees no applications?
```bash
# Check if HR is linked to company
mongosh
use placement_portal
db.hrs.find().pretty()

# Check if applications exist
db.applications.find().pretty()
```

### Can't create HR account?
```bash
# List available companies
mongosh
use placement_portal
db.companies.find({}, {name: 1})

# Use exact company name in create-hr.js
```

### Student can't see drive?
- Check student's branch matches eligible branches
- Check student's CGPA meets minimum requirement
- Verify drive status is "upcoming"

## 📞 Quick Commands

### Create Multiple HR Accounts
```bash
node create-hr.js hr@google.com hr123 "Google HR" "Google"
node create-hr.js hr@microsoft.com hr123 "Microsoft HR" "Microsoft"
node create-hr.js hr@amazon.com hr123 "Amazon HR" "Amazon"
```

### Check Database
```bash
mongosh
use placement_portal

# View companies
db.companies.find({}, {name: 1})

# View HR accounts
db.hrs.find().pretty()

# View applications
db.applications.find().pretty()
```

### Restart Backend
```bash
cd backend
npm start
```

## ✅ Success Checklist

- [ ] MongoDB running
- [ ] Backend running (port 3001)
- [ ] Frontend running (port 8080)
- [ ] Company created
- [ ] HR account created
- [ ] Drive created
- [ ] Student registered and applied
- [ ] HR can see application

## 🎯 Test Scenario

**Goal:** HR sees student application with skills

1. **Admin:** Create "TechCorp" company
2. **Script:** `node create-hr.js hr@techcorp.com hr123 "Tech HR" "TechCorp"`
3. **Admin:** Create drive for TechCorp (Software Engineer, CSE/IT, CGPA 7.0)
4. **Student:** Register as CSE student with CGPA 8.0
5. **Student:** Add skills: JavaScript, React, Node.js
6. **Student:** Apply to TechCorp drive
7. **HR:** Login as hr@techcorp.com
8. **HR:** See application in Applications page ✅

## 📚 Documentation Files

- `HR_APPLICATIONS_COMPLETE.md` - Detailed system documentation
- `QUICK_HR_SETUP.md` - Step-by-step setup guide
- `SYSTEM_COMPLETE.md` - Complete system overview
- `HR_QUICK_START.md` - This file (quick reference)

## 🎉 You're Ready!

The HR application system is fully functional. HR users can now:
- Login with their company-specific credentials
- View all applications for their company
- See complete student profiles with skills
- Shortlist candidates based on skill matching
- Manage application status with remarks

**Need help?** Check the detailed documentation files or backend console logs for debugging.
