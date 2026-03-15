# HR Activity Student Names Fix ✅

## Issue
HR Dashboard Recent Activity was showing "Unknown Student" instead of real student names.

## Root Cause
The Application model references `studentId` which points to the Student model, but the Student model doesn't have direct `name` or `email` fields. Instead, Student has a `userId` field that references the User model where the name and email are stored.

## Solution
Fixed the populate query to use nested population:

### Before (Incorrect):
```javascript
.populate('studentId', 'name email branch')
```
This tried to get `name` and `email` from Student model, which doesn't have these fields.

### After (Correct):
```javascript
.populate({
  path: 'studentId',
  populate: {
    path: 'userId',
    select: 'name email'
  },
  select: 'userId branch rollNumber'
})
```
This correctly:
1. Populates the Student document
2. Then populates the User document within Student
3. Gets name and email from User
4. Gets branch and rollNumber from Student

## Data Structure
```
Application
  └─ studentId (ref: Student)
       ├─ userId (ref: User)
       │    ├─ name ✓
       │    └─ email ✓
       ├─ branch ✓
       └─ rollNumber ✓
```

## Changes Made

### File: `backend/routes/hr-mongodb.js`
- Updated `/api/hr/recent-activity` endpoint
- Added nested populate for Student → User
- Enhanced student name display to include branch: "subasree (IT)"
- Fixed status matching for "on hold" (handles both "on-hold" and "on hold")

### Display Format
```
Student Name (Branch)
Example: subasree (IT)
```

## Test Results
Ran `backend/test-hr-activity.js`:
```
✅ Found Wipro company
✅ Found 2 applications for Wipro
✅ Student names correctly populated:
   - subasree (IT)
   - Roll: IT111
   - Status: selected/applied
```

## Verification
1. Login as HR: `hr@wipro.com` / `password123`
2. Go to Dashboard
3. Check "Recent Activity" section
4. Should now show: "subasree (IT)" instead of "Unknown Student"

## Backend Status
- ✅ Server restarted with new code
- ✅ MongoDB connected
- ✅ Endpoint `/api/hr/recent-activity` working correctly
- ✅ Nested populate functioning properly

## Summary
Fixed the student name display in HR Dashboard by implementing proper nested population of Student → User relationship. Real student names with branches now appear in the Recent Activity section.
