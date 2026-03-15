# Quick HR Setup Guide

## Prerequisites
- MongoDB running on localhost:27017
- Backend server running on port 3001
- Frontend running on port 8080
- Admin account created (admin@college.edu / admin123)

## Step-by-Step Setup

### 1. Create a Company (via Admin UI)
```
1. Go to http://localhost:8080/admin-login
2. Login: admin@college.edu / admin123
3. Navigate to "Companies" page
4. Click "Add Company"
5. Fill in:
   - Name: Google
   - Industry: Technology
   - Website: https://google.com
   - Location: Mountain View, CA
   - Description: Leading tech company
6. Click "Add Company"
```

### 2. Create HR Account (via Backend Script)
```bash
cd backend
node create-hr.js hr@google.com hr123 "Google HR" "Google"
```

**Output:**
```
Connected to MongoDB
✓ User created
✓ HR profile created

=== HR Account Created Successfully ===
Email: hr@google.com
Password: hr123
Name: Google HR
Company: Google
Company ID: 507f1f77bcf86cd799439011

You can now login at: http://localhost:8080/hr-login
```

### 3. Create a Placement Drive (via Admin UI)
```
1. Still logged in as admin
2. Navigate to "Drives" page
3. Click "Add Drive"
4. Fill in:
   - Company: Google
   - Job Role: Software Engineer
   - Eligible Branches: CSE, IT, ECE
   - Minimum CGPA: 7.0
   - Package: 15 LPA
   - Drive Date: Select future date
   - Description: Full-time software engineering role
5. Click "Create Drive"
```

### 4. Register a Student
```
1. Go to http://localhost:8080/student-register
2. Fill in:
   - Name: John Doe
   - Email: john@student.edu
   - Password: student123
   - Roll Number: CSE2021001
   - Branch: CSE
3. Click "Register"
4. You'll be auto-logged in
```

### 5. Complete Student Profile
```
1. Go to Profile page
2. Fill in:
   - CGPA: 8.5
   - Skills: JavaScript, React, Node.js, Python, MongoDB
   - 10th Percentage: 85
   - 12th Percentage: 88
   - Phone: +91 9876543210
   - Add a project:
     * Name: E-commerce Website
     * Description: Full-stack web application
     * Technologies: React, Node.js, MongoDB
     * Link: https://github.com/john/ecommerce
3. Click "Save Changes"
```

### 6. Student Applies to Drive
```
1. Go to "Opportunities" page
2. You should see the Google drive
3. Click "Apply Now"
4. Confirm application
```

### 7. HR Views Application
```
1. Go to http://localhost:8080/hr-login
2. Login: hr@google.com / hr123
3. Navigate to "Applications" page
4. You should see John Doe's application with:
   - Name: John Doe
   - Roll: CSE2021001
   - Branch: CSE
   - CGPA: 8.5
   - Skills: JavaScript, React, Node.js, Python, MongoDB
   - Status: Applied
```

### 8. HR Reviews and Shortlists
```
1. Click "View" on John's application
2. Review complete profile:
   - Contact info
   - Skills
   - Projects
   - Academic records
3. Click the menu (three dots)
4. Select "Shortlist"
5. Add remarks: "Strong technical skills, good projects"
6. Click "Update Status"
```

## Quick Commands Reference

### Create Multiple HR Accounts
```bash
# Google HR
node create-hr.js hr@google.com hr123 "Google HR" "Google"

# Microsoft HR
node create-hr.js hr@microsoft.com hr123 "Microsoft HR" "Microsoft"

# Amazon HR
node create-hr.js hr@amazon.com hr123 "Amazon HR" "Amazon"
```

### Check Database
```bash
mongosh
use placement_portal

# View all companies
db.companies.find({}, {name: 1})

# View all HR accounts
db.hrs.find().populate('userId').populate('companyId')

# View all applications
db.applications.find().pretty()

# View HR with company details
db.hrs.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'user'
    }
  },
  {
    $lookup: {
      from: 'companies',
      localField: 'companyId',
      foreignField: '_id',
      as: 'company'
    }
  }
])
```

## Verification Checklist

- [ ] MongoDB is running
- [ ] Backend server is running (port 3001)
- [ ] Frontend is running (port 8080)
- [ ] Admin can login
- [ ] Company is created
- [ ] HR account is created via script
- [ ] Drive is created for the company
- [ ] Student can register
- [ ] Student can complete profile
- [ ] Student can see the drive in Opportunities
- [ ] Student can apply to the drive
- [ ] HR can login
- [ ] HR sees the application
- [ ] HR can view full student details
- [ ] HR can update application status

## Common Issues

### Issue: HR sees no applications
**Solution:** 
- Verify HR is linked to correct company
- Check if drive was created for that company
- Ensure student applied to that specific drive
- Check backend logs for company ID

### Issue: "HR profile not found"
**Solution:**
- Run create-hr.js script again
- Verify company name matches exactly
- Check database: `db.hrs.find()`

### Issue: Student doesn't see drive
**Solution:**
- Check student's branch matches eligible branches
- Check student's CGPA meets minimum requirement
- Verify drive status is not "completed"

### Issue: Cannot create HR account
**Solution:**
- Ensure company exists first
- Check company name spelling
- View available companies: `db.companies.find({}, {name: 1})`

## Testing Multiple Companies

### Scenario: Two companies, two HR users, two students

```bash
# Create companies via admin UI
# Company 1: Google
# Company 2: Microsoft

# Create HR accounts
node create-hr.js hr@google.com hr123 "Google HR" "Google"
node create-hr.js hr@microsoft.com hr123 "Microsoft HR" "Microsoft"

# Create drives via admin UI
# Drive 1: Google - Software Engineer
# Drive 2: Microsoft - Cloud Engineer

# Register students
# Student 1: john@student.edu (CSE, CGPA 8.5)
# Student 2: jane@student.edu (IT, CGPA 9.0)

# Student 1 applies to Google drive
# Student 2 applies to Microsoft drive

# Verify:
# - Google HR sees only Student 1's application
# - Microsoft HR sees only Student 2's application
```

## Success Criteria

When everything is working correctly:

1. **HR Login**: HR can login with their credentials
2. **Company Isolation**: HR only sees applications for their company
3. **Complete Data**: HR sees full student profile with skills
4. **Skill Matching**: Skills are highlighted if they match requirements
5. **Status Updates**: HR can change application status
6. **Remarks**: HR can add feedback to applications
7. **Real-time**: All data comes from MongoDB, not localStorage

## Next Steps

After successful setup:
1. Set required skills in HR Skills page
2. Test skill matching percentage
3. Try different application statuses
4. Add more students and applications
5. Test filtering and search functionality
