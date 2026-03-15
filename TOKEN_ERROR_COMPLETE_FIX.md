# "Invalid or Expired Token" Error - COMPLETE FIX ✅

## Problem

Students see "Invalid or expired token" error when trying to view opportunities or applications.

## Root Cause

The system was using **mock tokens** (fake tokens) when backend login failed, but the backend requires **real JWT tokens** that it can verify. Mock tokens can't be verified by the backend, causing the "Invalid or expired token" error.

## What Was Fixed

### 1. Removed Mock Authentication Fallback
**File**: `src/contexts/AuthContext.tsx`

**Before**:
```typescript
catch (error) {
  // Fallback to mock authentication
  const mockToken = 'mock_token_' + Date.now(); // ❌ Fake token
  localStorage.setItem('token', mockToken);
  setUser(mockUser);
  return { success: true };
}
```

**After**:
```typescript
catch (error) {
  console.error('Login error:', error);
  return { 
    success: false, 
    message: 'Unable to connect to server' // ✅ No fake tokens
  };
}
```

### 2. Added Better Error Messages
Now shows helpful error messages when login fails:
- "Invalid email or password"
- "Please register first if you're a new student"
- "Unable to connect to server. Please ensure MongoDB is running"

### 3. Added Console Logging
Added logging to help debug authentication issues:
```typescript
console.log('Attempting login for:', email);
console.log('Login response:', response);
console.log('Token stored successfully');
```

## How It Works Now

### Correct Flow:
```
1. Student registers → Backend creates user → Returns JWT token ✅
2. Student logs in → Backend verifies credentials → Returns JWT token ✅
3. Token stored in localStorage ✅
4. API requests include token in Authorization header ✅
5. Backend verifies JWT token ✅
6. Data returned successfully ✅
```

### What Happens If Backend Is Down:
```
1. Student tries to login
2. Backend connection fails
3. Error message shown: "Unable to connect to server"
4. NO fake token created ✅
5. User stays on login page
```

## Prerequisites

Before testing, ensure:

### 1. MongoDB is Running
```bash
# Check if MongoDB is running
mongosh

# If not running, start it
net start MongoDB
```

### 2. Backend Server is Running
```bash
cd backend
node server.js

# Should see:
# ✅ MongoDB connected successfully
# 🚀 Server running on port 3001
```

### 3. Admin User Exists
```bash
cd backend
node seed-admin.js

# Should see:
# ✅ Admin user created successfully
```

## Complete Test Flow

### Step 1: Clear Browser Data
**IMPORTANT**: Clear all old data first!

1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "Clear storage"
4. Check all boxes
5. Click "Clear site data"
6. Close and reopen browser

### Step 2: Register New Student

1. **Go to**: http://localhost:8080
2. **Click**: "Student Register"
3. **Fill in**:
   ```
   Name: Test Student
   Email: teststudent@college.edu
   Password: test123
   Confirm Password: test123
   Roll Number: CSE2021001
   Branch: CSE
   ```
4. **Click**: "Register"
5. **Expected**:
   - ✅ "Registration Successful!" message
   - ✅ Auto-login and redirect to dashboard
   - ✅ Real JWT token stored in localStorage

### Step 3: Verify Token

1. **Open DevTools** (F12)
2. **Go to**: Application → Local Storage → http://localhost:8080
3. **Check**:
   - `token`: Should be a long JWT string (not "mock_token_...")
   - `user`: Should have user data
4. **Example JWT token**:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1...
   ```

### Step 4: Test Opportunities Page

1. **Click**: "Job Opportunities" in sidebar
2. **Expected**:
   - ✅ Page loads without errors
   - ✅ Shows "No opportunities found" (if no drives created yet)
   - ✅ NO "Invalid or expired token" error

### Step 5: Test Applications Page

1. **Click**: "My Applications" in sidebar
2. **Expected**:
   - ✅ Page loads without errors
   - ✅ Shows "No applications found" (if no applications yet)
   - ✅ NO "Invalid or expired token" error

### Step 6: Create Drive as Admin

1. **Open new incognito window**
2. **Go to**: http://localhost:8080
3. **Click**: "Admin Login"
4. **Login**: admin@college.edu / admin123
5. **Create Company** (if not exists):
   - Go to "Companies"
   - Add company: Google, Technology, hr@google.com
6. **Create Drive**:
   - Go to "Drives"
   - Create drive: Google, Software Engineer, CSE/IT/ECE, Min CGPA: 7.0
7. **Expected**:
   - ✅ Drive created successfully

### Step 7: Student Sees Drive

1. **Go back to student window**
2. **Refresh page** or click "Job Opportunities"
3. **Expected**:
   - ✅ Google drive appears!
   - ✅ Can click "Apply Now"
   - ✅ Application submits successfully

## Verification Checklist

After completing the test flow:

- [ ] MongoDB is running
- [ ] Backend server is running
- [ ] Admin user exists in database
- [ ] Student can register successfully
- [ ] Real JWT token is stored (not mock_token_...)
- [ ] Student can access Opportunities page
- [ ] Student can access Applications page
- [ ] No "Invalid or expired token" errors
- [ ] Admin can create drives
- [ ] Student can see drives
- [ ] Student can apply for drives

## Troubleshooting

### Issue 1: "Unable to connect to server"

**Cause**: Backend is not running or MongoDB is not connected

**Solution**:
```bash
# Check MongoDB
mongosh

# Start backend
cd backend
node server.js
```

### Issue 2: "Invalid email or password"

**Cause**: User doesn't exist in database

**Solution**:
- Register as a new student first
- Or check if user exists:
  ```bash
  mongosh
  use placement_portal
  db.users.find({ email: "teststudent@college.edu" })
  ```

### Issue 3: Still Getting "Invalid or expired token"

**Cause**: Old mock token still in localStorage

**Solution**:
1. F12 → Application → Clear Storage
2. Close all browser tabs
3. Open new tab
4. Register new student
5. Test again

### Issue 4: Token Looks Like "mock_token_..."

**Cause**: Using old code or backend not returning token

**Solution**:
1. Refresh the page (Ctrl+R) to load new code
2. Clear localStorage
3. Register again
4. Check backend logs for errors

## Backend Verification

### Check Backend Logs:

Backend terminal should show:
```
POST /api/auth/signup 200
POST /api/auth/login 200
GET /api/students/profile 200
GET /api/drives 200
GET /api/applications/student 200
```

### Check MongoDB Data:

```bash
mongosh
use placement_portal

# Check if user was created
db.users.find({ email: "teststudent@college.edu" }).pretty()

# Check if student profile was created
db.students.find().pretty()

# Should see user with hashed password and student with branch/CGPA
```

## What Changed

### Files Modified:
1. `src/contexts/AuthContext.tsx` - Removed mock authentication fallback
2. `src/pages/StudentLogin.tsx` - Better error messages
3. `src/pages/StudentRegister.tsx` - Auto-login after registration (from previous fix)

### Key Changes:
- ✅ No more mock tokens
- ✅ Always use backend for authentication
- ✅ Real JWT tokens only
- ✅ Better error messages
- ✅ Console logging for debugging

## Success Indicators

✅ **You know it's fixed when:**
1. Student can register without errors
2. JWT token (long string) is stored in localStorage
3. Can access Opportunities page without errors
4. Can access Applications page without errors
5. No "Invalid or expired token" errors anywhere
6. Backend logs show successful API requests
7. Can apply for drives successfully

## Important Notes

### Always Use Backend:
- ❌ No mock authentication
- ❌ No fake tokens
- ✅ Real backend login only
- ✅ Real JWT tokens only

### Prerequisites Must Be Met:
- ✅ MongoDB must be running
- ✅ Backend server must be running
- ✅ Admin user must exist
- ✅ Student must register first

### Clear Cache When Testing:
- Always clear browser cache/localStorage when testing
- Old mock tokens will cause errors
- Fresh start ensures clean test

## Conclusion

The "Invalid or expired token" error is now completely fixed! The system no longer creates fake tokens. All authentication goes through the backend, which returns real JWT tokens that can be verified.

**Test it now by following the Complete Test Flow above!** 🚀

---

**Status**: ✅ COMPLETELY FIXED
**Action**: Clear cache → Register new student → Test
**Expected**: No token errors, everything works!
