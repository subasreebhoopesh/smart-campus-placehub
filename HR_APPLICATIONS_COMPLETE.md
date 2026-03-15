# HR Applications System - Complete Integration

## Overview
The HR Applications system is now fully integrated with MongoDB backend. HR users can view all student applications for their company's drives with complete student profiles and skill matching.

## System Flow

### 1. Admin Creates Company
- Admin logs in at `/admin-login` (admin@college.edu / admin123)
- Goes to Companies page
- Creates a new company (e.g., "Google", "Microsoft", "Amazon")

### 2. Admin Creates HR Account
Use the backend script to create HR accounts:

```bash
cd backend
node create-hr.js <email> <password> <name> <companyName>
```

**Example:**
```bash
node create-hr.js hr@google.com hr123 "Google HR" "Google"
```

This will:
- Create a User with role 'hr'
- Link the HR to the specified company
- Display login credentials

### 3. Admin Creates Placement Drive
- Admin goes to Drives page
- Creates a new drive:
  - Select company (e.g., Google)
  - Job role (e.g., Software Engineer)
  - Eligible branches (e.g., CSE, IT)
  - Minimum CGPA (e.g., 7.0)
  - Package offered
  - Drive date
  - Description

### 4. Student Registers and Completes Profile
- Student registers at `/student-register`
- Fills in: name, email, password, roll number, branch
- After registration, completes profile:
  - CGPA
  - Skills (e.g., JavaScript, React, Node.js, Python)
  - Projects
  - Contact info (phone, LinkedIn, GitHub)
  - Academic percentages (10th, 12th)
  - Resume upload

### 5. Student Applies to Drive
- Student logs in at `/student-login`
- Goes to Opportunities page
- Sees available drives (filtered by branch and CGPA)
- Clicks "Apply Now" on a drive
- Application is created in database

### 6. HR Views Applications
- HR logs in at `/hr-login` with their credentials
- Goes to Applications page
- Sees all applications for their company's drives
- Each application shows:
  - Student name, email, roll number
  - Branch and CGPA
  - Skills (highlighted if they match required skills)
  - Skill match percentage
  - Application date
  - Current status

### 7. HR Reviews and Shortlists
- HR clicks "View" to see complete student details:
  - Contact information
  - Academic records
  - Skills
  - Projects with descriptions
  - Resume download link
- HR can update application status:
  - Shortlist
  - Select
  - On Hold
  - Reject
- HR can add remarks/feedback

## Key Features

### Company-Specific Access
- Each HR only sees applications for their own company
- Backend filters applications by HR's company ID
- Multiple HR users can exist for the same company

### Skill-Based Shortlisting
- HR can set required skills in Skills page
- System calculates skill match percentage
- Students with 70%+ match get highlighted badge
- Matching skills shown in green

### Complete Student Profiles
- Full academic history (10th, 12th, CGPA)
- Skills list
- Projects with technologies and links
- Contact information (phone, LinkedIn, GitHub)
- Resume download

### Application Status Management
- Applied (default)
- Shortlisted
- Selected
- Rejected
- On Hold
- Status updates with remarks

## Backend API Endpoints

### HR Applications
```
GET /api/applications/hr
Authorization: Bearer <token>
```

Returns all applications for HR's company with populated student details.

### Update Application Status
```
PUT /api/applications/:id/status
Authorization: Bearer <token>
Body: { status: "shortlisted", remarks: "Good profile" }
```

## Database Models

### Application
```javascript
{
  studentId: ObjectId (ref: Student),
  driveId: ObjectId (ref: PlacementDrive),
  companyId: ObjectId (ref: Company),
  status: String (applied/shortlisted/selected/rejected/on hold),
  remarks: String,
  appliedDate: Date
}
```

### HR
```javascript
{
  userId: ObjectId (ref: User),
  companyId: ObjectId (ref: Company),
  createdAt: Date
}
```

## Testing Steps

### Step 1: Start Services
```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Backend
cd backend
npm start

# Terminal 3: Start Frontend
npm run dev
```

### Step 2: Create Test Data
```bash
# Create admin (if not exists)
cd backend
node seed-admin.js

# Create company via admin UI
# Login as admin -> Companies -> Add Company

# Create HR account
node create-hr.js hr@testcompany.com hr123 "Test HR" "TestCompany"

# Create drive via admin UI
# Login as admin -> Drives -> Add Drive
```

### Step 3: Test Student Flow
1. Register student at http://localhost:8080/student-register
2. Complete profile with skills
3. Go to Opportunities
4. Apply to a drive

### Step 4: Test HR Flow
1. Login as HR at http://localhost:8080/hr-login
2. Go to Applications page
3. Verify you see the student's application
4. Click "View" to see full details
5. Update status to "Shortlisted"
6. Add remarks

### Step 5: Verify Data
Check MongoDB:
```bash
mongosh
use placement_portal
db.applications.find().pretty()
db.hrs.find().pretty()
```

## Troubleshooting

### HR sees no applications
- Check if HR account is linked to correct company
- Verify drive was created for that company
- Ensure student applied to that company's drive
- Check backend logs for company ID matching

### "HR profile not found" error
- HR account not created properly
- Run create-hr.js script again
- Verify HR document exists in database

### Applications not showing after student applies
- Check if application was created in database
- Verify companyId matches in drive and application
- Check backend console logs for errors

## Console Debugging

Backend logs show:
```
HR Applications - User ID: <userId>
HR Company ID: <companyId>
Found X applications for company <companyId>
Returning formatted applications: X
```

Frontend logs show:
```
Fetching HR applications from backend...
HR applications received: [...]
```

## Security

- HR can only see applications for their own company
- Backend validates HR role via JWT token
- Company ID is extracted from HR profile, not from request
- All routes protected with authentication middleware

## Next Steps

1. Add resume download functionality
2. Add bulk status updates
3. Add email notifications to students
4. Add interview scheduling
5. Add application analytics for HR

## Summary

The HR Applications system is fully functional with:
✓ Company-specific HR accounts
✓ Backend filtering by company ID
✓ Complete student profile display
✓ Skill-based matching
✓ Status management with remarks
✓ Real-time data from MongoDB
✓ Secure authentication and authorization
