# Restart Servers to Enable Profile Photo ⚡

## The Issue

The profile photo feature was just added to the code, but the backend server needs to be restarted to load the new changes.

## Quick Fix - Restart Backend Server

### Step 1: Stop Backend Server
In the terminal running the backend:
```bash
# Press Ctrl+C to stop the server
```

### Step 2: Restart Backend Server
```bash
cd backend
node server.js
```

You should see:
```
🚀 Server running on port 3001
📡 API available at http://localhost:3001/api
💾 Using MongoDB database
```

## Test Profile Photo

### Step 1: Go to Profile Page
1. Login as admin: http://localhost:8080/admin/login
2. Click "Profile" in the sidebar (NOT Settings)
3. You should see a large circular avatar

### Step 2: Upload Photo
1. Click the upload button (bottom-right of avatar)
2. Select an image file
3. Wait for upload
4. ✅ Photo appears immediately

### Step 3: Test Persistence
1. Refresh the page (F5)
2. ✅ Photo should still be there
3. If photo disappears, check:
   - Backend server is running
   - MongoDB is connected
   - Check browser console for errors

## Important Notes

### Profile vs Settings Page

**Profile Page** (`/admin/profile`):
- Has profile photo upload
- Shows name, email
- Can change password
- ✅ This is where you upload photo

**Settings Page** (`/admin/settings`):
- Different page
- May not have photo upload yet
- ❌ Not the right page for photo

### Photo Storage Locations

1. **File System**: `backend/uploads/admin-photo-*.jpg`
2. **MongoDB**: User document `profilePhotoUrl` field
3. **Frontend**: Loaded from database on page load

## Troubleshooting

### Photo Still Disappearing?

**Check 1: Backend Running?**
```bash
# Should see server running message
```

**Check 2: MongoDB Connected?**
```bash
# Should see "MongoDB connected" in backend logs
```

**Check 3: Check Browser Console**
```
F12 → Console tab
Look for errors
```

**Check 4: Check Network Tab**
```
F12 → Network tab
Refresh page
Look for /api/admin/profile request
Should return profilePhotoUrl field
```

**Check 5: Check Database**
```bash
mongosh
use placement_portal
db.users.findOne({ role: 'admin' })
# Should have profilePhotoUrl field
```

### Photo Upload Fails?

**Error: "No token provided"**
- Logout and login again
- Token may have expired

**Error: "File too large"**
- Photo must be < 5MB
- Compress the image

**Error: "Invalid file type"**
- Only JPG, PNG, GIF allowed
- Convert to supported format

## Complete Restart Process

If nothing works, do a complete restart:

### 1. Stop Everything
```bash
# Stop backend (Ctrl+C in backend terminal)
# Stop frontend (Ctrl+C in frontend terminal)
```

### 2. Restart Backend
```bash
cd backend
node server.js
```

### 3. Restart Frontend
```bash
cd smart-campus-pathways-main
npm run dev
```

### 4. Clear Browser Cache
```
Ctrl+Shift+Delete
Clear cache and cookies
```

### 5. Login Fresh
```
Go to http://localhost:8080/admin/login
Login with: admin@college.edu / admin123
Go to Profile page (not Settings)
Upload photo
```

## Quick Test Command

Test if backend has the new endpoint:
```bash
curl http://localhost:3001/api/admin/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Should return JSON with `profilePhotoUrl` field.

## Summary

1. ✅ Code is ready
2. ⚠️ Backend needs restart
3. 📍 Go to Profile page (not Settings)
4. 📸 Upload photo
5. 🔄 Refresh to test persistence

After restarting the backend server, the profile photo feature will work perfectly!
