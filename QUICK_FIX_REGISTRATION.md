# 🔧 Quick Fix - Registration Not Working

## Problem
When creating a student account, you see "Failed to fetch" error.

## Cause
The backend server is not running or not connected properly.

## Solution

### Step 1: Start Backend Server

Open **Terminal 1** (Command Prompt or PowerShell):

```bash
cd smart-campus-pathways-main\backend
node server.js
```

**Wait for this message:**
```
🚀 Server running on port 3001
📡 API available at http://localhost:3001/api
💾 Using MongoDB database
```

### Step 2: Start Frontend

Open **Terminal 2** (New Command Prompt or PowerShell):

```bash
cd smart-campus-pathways-main
npm run dev
```

**Wait for this message:**
```
VITE ready in xxx ms
➜  Local:   http://localhost:8080/
```

### Step 3: Test Registration

1. Open browser: http://localhost:8080/register
2. Fill in the form:
   - Full Name: Your Name
   - Email: youremail@gmail.com
   - Roll Number: IT123
   - Branch: IT
   - Phone: 9876543210
   - Password: password123
   - Confirm Password: password123
3. Click "Create Account"

## If Still Not Working

### Check Backend is Running
Open browser: http://localhost:3001/api/health

You should see:
```json
{"success":true,"message":"Server is running with MongoDB"}
```

### Check MongoDB is Running
Make sure MongoDB is installed and running on your computer.

**To install MongoDB:**
1. Download from: https://www.mongodb.com/try/download/community
2. Install and start MongoDB service

**Or use MongoDB Atlas (Cloud):**
1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Get connection string
4. Update `backend/.env` file:
```
MONGODB_URI=your_connection_string_here
```

### Check Console for Errors

**In Browser:**
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Look for error messages
4. Share the error with me

**In Backend Terminal:**
Look for any error messages in the terminal where you ran `node server.js`

## Common Errors and Fixes

### Error: "ECONNREFUSED"
**Fix:** Backend server is not running. Start it with `node server.js`

### Error: "MongoNetworkError"
**Fix:** MongoDB is not running. Start MongoDB service or use MongoDB Atlas

### Error: "Port 3001 already in use"
**Fix:** 
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F

# Then restart server
node server.js
```

### Error: "Cannot find module"
**Fix:**
```bash
cd backend
npm install
node server.js
```

## Test with Existing Admin Account

Instead of registering, try logging in with admin account:

1. Go to: http://localhost:8080/admin/login
2. Email: `admin@college.edu`
3. Password: `admin123`

If this works, backend is running fine!

## Quick Test Commands

### Test Backend API
```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test registration endpoint
curl -X POST http://localhost:3001/api/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@test.com\",\"password\":\"test123\",\"name\":\"Test User\",\"role\":\"student\",\"rollNumber\":\"TEST123\",\"branch\":\"IT\"}"
```

## Still Having Issues?

1. **Restart everything:**
   - Close all terminals
   - Close browser
   - Start backend first
   - Then start frontend
   - Try again

2. **Check firewall:**
   - Make sure ports 3001 and 8080 are not blocked

3. **Use different browser:**
   - Try Chrome, Firefox, or Edge
   - Clear browser cache

4. **Check network:**
   - Make sure you're not behind a proxy
   - Try disabling VPN if using one

## Success Indicators

✅ Backend terminal shows: "Server running on port 3001"
✅ Frontend terminal shows: "Local: http://localhost:8080/"
✅ Browser can access: http://localhost:3001/api/health
✅ Browser can access: http://localhost:8080
✅ No errors in browser console
✅ Registration form submits successfully

## After Successful Registration

You will be automatically:
1. Logged in
2. Redirected to Student Dashboard
3. Can complete your profile
4. Can view opportunities
5. Can apply to placement drives

---

**Need Help?** Check the browser console (F12) and backend terminal for specific error messages.
