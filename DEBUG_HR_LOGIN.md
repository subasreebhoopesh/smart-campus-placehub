# Debug HR Login and Applications

## Step-by-Step Debugging

### Step 1: Verify Backend is Running
Open a new terminal and check:
```bash
# Check if backend is running
curl http://localhost:3001/api/health
```

Expected output:
```json
{"success":true,"message":"Server is running with MongoDB"}
```

### Step 2: Verify HR Account Exists
```bash
node smart-campus-pathways-main/backend/check-hr.js
```

Expected output:
```
Found 2 HR users:
  - hr@google.com (Google HR)
  - hr@wipro.com (Wipro HR)
```

### Step 3: Test HR Login API Directly
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"hr@google.com\",\"password\":\"hr123\"}"
```

Expected output should include:
- `success: true`
- `token: <JWT token>`
- `user: { id, email, name, role: "hr" }`
- `companies: [{ id, name }]`

### Step 4: Login via Browser

1. Open browser console (F12)
2. Go to http://localhost:8080/hr-login
3. Enter credentials:
   - Email: hr@google.com
   - Password: hr123
4. Click Login

**Watch the console for these logs:**
```
Attempting login for: hr@google.com
Login response: { success: true, token: "...", user: {...}, companies: [...] }
Token stored successfully
HR user with companies: [...]
HR company set: <companyId> <companyName>
User set: { id, email, name, role, companyId, companyName }
```

### Step 5: Check Token Storage

After login, in browser console, run:
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

You should see:
- Token: A long JWT string
- User: JSON with companyId and companyName

### Step 6: Navigate to Applications Page

After successful login:
1. Click on "Applications" in the sidebar
2. Watch browser console for:

```
Fetching HR applications from backend...
Current user: { id, email, name, role, companyId, companyName }
Token: <JWT token>
API: Fetching HR applications...
API: Token: <JWT token>
API: Response status: 200
API: Success, received data: [...]
HR applications received: [...]
```

### Step 7: Check Backend Console

In the backend terminal, you should see:
```
HR Applications - User ID: <userId>
HR Company ID: <companyId>
Found X applications for company <companyId>
Returning formatted applications: X
```

## Common Issues and Fixes

### Issue 1: "Invalid credentials"
**Cause:** HR account doesn't exist
**Fix:**
```bash
cd smart-campus-pathways-main/backend
node create-hr.js hr@google.com hr123 "Google HR" "google"
```

### Issue 2: "Failed to load applications"
**Possible causes:**
1. Token not stored properly
2. Backend not running
3. MongoDB not running
4. HR profile not linked to company

**Debug:**
```bash
# Check if applications exist
node smart-campus-pathways-main/backend/check-applications.js

# Test HR API directly
node smart-campus-pathways-main/backend/test-hr-api.js
```

### Issue 3: Applications page shows 0 applications
**Possible causes:**
1. No students have applied
2. HR is linked to wrong company
3. Applications exist for different company

**Fix:**
```bash
# Check which company HR is linked to
node smart-campus-pathways-main/backend/check-hr.js

# Check which company has applications
node smart-campus-pathways-main/backend/check-applications.js
```

### Issue 4: "HR profile not found"
**Cause:** HR document not created in database
**Fix:**
```bash
# Recreate HR account
cd smart-campus-pathways-main/backend
node create-hr.js hr@google.com hr123 "Google HR" "google"
```

## Manual Testing Checklist

- [ ] MongoDB is running (mongod)
- [ ] Backend is running (npm start in backend folder)
- [ ] Frontend is running (npm run dev)
- [ ] HR account exists (check-hr.js shows it)
- [ ] Applications exist (check-applications.js shows them)
- [ ] Company names match exactly
- [ ] Can login as HR (no "Invalid credentials")
- [ ] Token is stored in localStorage
- [ ] User object has companyId
- [ ] Applications page loads without error
- [ ] Can see student applications
- [ ] Can view student details
- [ ] Can update application status

## Quick Fix Commands

### Restart Everything
```bash
# Stop all node processes
taskkill /F /IM node.exe

# Start MongoDB
mongod

# Start Backend (in backend folder)
npm start

# Start Frontend (in root folder)
npm run dev
```

### Recreate HR Accounts
```bash
cd smart-campus-pathways-main/backend

# Google HR
node create-hr.js hr@google.com hr123 "Google HR" "google"

# Wipro HR
node create-hr.js hr@wipro.com hr123 "Wipro HR" "wipro"
```

### Check Everything
```bash
# Check HR accounts
node smart-campus-pathways-main/backend/check-hr.js

# Check applications
node smart-campus-pathways-main/backend/check-applications.js

# Test HR API
node smart-campus-pathways-main/backend/test-hr-api.js
```

## Expected Flow

1. **HR Login**
   - Frontend sends email/password to `/api/auth/login`
   - Backend verifies credentials
   - Backend finds HR profile and company
   - Backend returns token + user + companies
   - Frontend stores token and user with companyId

2. **Load Applications**
   - Frontend calls `/api/applications/hr` with token
   - Backend extracts userId from token
   - Backend finds HR profile to get companyId
   - Backend queries applications where companyId matches
   - Backend populates student and drive details
   - Backend returns formatted applications
   - Frontend displays applications

## Success Indicators

✅ Login successful
✅ Token stored in localStorage
✅ User has companyId field
✅ Applications page loads
✅ Can see student applications
✅ Backend logs show correct company ID
✅ Application count matches database

## Still Having Issues?

1. Clear browser cache and localStorage
2. Restart backend server
3. Check backend console for errors
4. Check browser console for errors
5. Verify MongoDB is running
6. Run all check scripts
7. Recreate HR accounts if needed

## Contact

If issues persist, provide:
- Browser console logs
- Backend console logs
- Output of check-hr.js
- Output of check-applications.js
- Screenshot of error
