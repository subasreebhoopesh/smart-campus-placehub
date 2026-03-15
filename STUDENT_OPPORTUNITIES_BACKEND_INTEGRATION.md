# Student Opportunities Backend Integration

## Overview
Connected the Student Opportunities and Applications pages to the backend API. Now when admin adds companies and creates placement drives, students can see those jobs in real-time and apply for them.

## Changes Made

### 1. Student Opportunities Page (`src/pages/student/Opportunities.tsx`)

#### Features Added:
- **Real-time Data Fetching**: Fetches placement drives from backend API on component mount
- **Student Profile Integration**: Retrieves student's CGPA and branch to filter eligible drives
- **Dynamic Eligibility Filtering**: Automatically filters drives based on:
  - Student's branch matches drive's eligible branches
  - Student's CGPA meets minimum requirement
- **Backend Application Submission**: "Apply Now" button submits application to backend
- **Loading States**: Shows spinner while fetching data
- **Error Handling**: Displays toast notifications for errors
- **Auto-refresh**: Refreshes drive list after successful application

#### API Calls:
```typescript
// Fetch student profile
const profileData = await api.students.getProfile();

// Fetch all drives
const drivesData = await api.drives.getAll();

// Apply for drive
await api.applications.apply(driveId);
```

#### Data Flow:
1. Admin creates company → MySQL
2. Admin creates placement drive → MySQL
3. Student opens Opportunities page → Fetches drives from MySQL
4. Student sees only eligible drives (filtered by branch & CGPA)
5. Student clicks "Apply Now" → Application saved to MySQL
6. HR sees application in their dashboard

### 2. Student Applications Page (`src/pages/student/Applications.tsx`)

#### Features Added:
- **Real-time Applications**: Fetches student's applications from backend
- **Status Tracking**: Shows current status (Applied, Shortlisted, Selected, Rejected, On Hold)
- **HR Remarks**: Displays feedback/remarks from HR
- **Statistics Dashboard**: Shows counts for each status
- **Status Filtering**: Filter applications by status
- **Loading States**: Shows spinner while fetching data

#### API Calls:
```typescript
// Fetch student's applications
const data = await api.applications.getStudentApplications();
```

#### Application Statuses:
- **Applied** (Blue): Initial status when student applies
- **Shortlisted** (Orange): HR has shortlisted the candidate
- **Selected** (Green): Student has been selected
- **Rejected** (Red): Application rejected
- **On Hold** (Yellow): Application on hold

### 3. Backend API Updates

#### Drives Route (`backend/routes/drives.js`)
- Returns drives with company names joined from companies table
- Simplified response format (direct array instead of wrapped object)
- Filters by status and branch
- Orders by drive date (newest first)

#### Applications Route (`backend/routes/applications.js`)
- **POST /api/applications**: Create new application
  - Validates student profile exists
  - Checks if drive exists
  - Prevents duplicate applications
  - Stores application with "applied" status
  
- **GET /api/applications/student**: Get student's applications
  - Joins with companies and drives tables
  - Returns complete application details with company name, job role, package
  - Orders by applied date (newest first)

- **PUT /api/applications/:id/status**: Update application status (HR only)
  - Updates status and remarks
  - Used by HR to shortlist/select/reject candidates

## Database Schema

### Tables Used:
1. **placement_drives**: Stores drive details
   - `id`, `company_id`, `job_role`, `drive_date`
   - `eligible_branches` (comma-separated: "CSE,ECE,IT")
   - `min_cgpa`, `package_offered`, `description`, `status`

2. **applications**: Stores student applications
   - `id`, `student_id`, `drive_id`, `company_id`
   - `status`, `remarks`, `applied_date`

3. **students**: Student profiles
   - `id`, `user_id`, `roll_number`, `branch`, `cgpa`, `skills`

4. **companies**: Company details
   - `id`, `name`, `industry`, `website`, `description`

## Testing Guide

### Test Flow:

#### 1. Admin Creates Drive
```
1. Login as Admin
2. Go to Companies page → Add company (e.g., "Google")
3. Go to Drives page → Create drive:
   - Select company: Google
   - Job role: Software Engineer
   - Eligible branches: CSE, IT
   - Min CGPA: 7.5
   - Package: 2500000
   - Status: upcoming
```

#### 2. Student Views & Applies
```
1. Login as Student (with branch=CSE, CGPA=8.0)
2. Go to Opportunities page
3. Should see Google drive (eligible)
4. Click "Apply Now" → Confirm
5. Success toast appears
6. Go to Applications page
7. Should see application with status "Applied"
```

#### 3. HR Reviews Application
```
1. Login as HR (for Google)
2. Go to Applications page
3. Should see student's application
4. Update status to "Shortlisted" with remarks
5. Click Save
```

#### 4. Student Sees Update
```
1. Login as Student
2. Go to Applications page
3. Status should show "Shortlisted"
4. Remarks should be visible
```

## API Endpoints Used

### Student Endpoints:
- `GET /api/students/profile` - Get student profile (CGPA, branch)
- `GET /api/drives` - Get all placement drives
- `POST /api/applications` - Apply for drive
- `GET /api/applications/student` - Get student's applications

### Admin Endpoints:
- `POST /api/companies` - Create company
- `POST /api/drives` - Create placement drive

### HR Endpoints:
- `GET /api/applications/hr` - Get applications for HR's company
- `PUT /api/applications/:id/status` - Update application status

## Environment Setup

### Backend (.env):
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=placement_portal
JWT_SECRET=your_secret_key
PORT=3001
```

### Frontend (.env):
```env
VITE_API_URL=http://localhost:3001/api
```

## Running the Application

### Start Backend:
```bash
cd backend
npm install
node server.js
```

### Start Frontend:
```bash
npm install
npm run dev
```

### Access:
- Frontend: http://localhost:8080
- Backend API: http://localhost:3001/api

## Key Features

✅ Real-time data synchronization between Admin, Student, and HR
✅ Automatic eligibility filtering based on branch and CGPA
✅ Duplicate application prevention
✅ Status tracking with HR remarks
✅ Loading states and error handling
✅ Toast notifications for user feedback
✅ Responsive UI with 3D company logos
✅ Search and filter functionality

## Next Steps

1. **Test the complete flow**: Admin → Student → HR
2. **Verify database connections**: Check MySQL is running
3. **Test edge cases**: 
   - Student with low CGPA (should not see certain drives)
   - Student from different branch (should not see ineligible drives)
   - Duplicate application attempt (should show error)
4. **Check HR dashboard**: Ensure applications appear correctly

## Notes

- Eligible branches are stored as comma-separated values in database
- Package is stored as integer (e.g., 2500000 for 25 LPA)
- All dates are in ISO format
- JWT token required for all API calls
- Role-based access control enforced on backend
