# Admin Profile Permanent Storage - Fixed ✅

## Problem Found

The admin profile data was being saved to MongoDB database permanently, but there was a bug in the backend route:
- Backend was using `req.user.userId` 
- But JWT token contains `req.user.id`
- This caused profile fetch to fail silently
- Data appeared to disappear on refresh

## Root Cause

```javascript
// WRONG - JWT token doesn't have userId field
const user = await User.findById(req.user.userId);

// CORRECT - JWT token has id field
const user = await User.findById(req.user.id);
```

## Fix Applied

Updated both GET and PUT profile routes in `backend/routes/admin-mongodb.js`:

### Before (Broken):
```javascript
router.get('/profile', authMiddleware, requireRole('admin'), async (req, res) => {
  const user = await User.findById(req.user.userId); // ❌ WRONG
  // ...
});

router.put('/profile', authMiddleware, requireRole('admin'), async (req, res) => {
  const user = await User.findById(req.user.userId); // ❌ WRONG
  // ...
});
```

### After (Fixed):
```javascript
router.get('/profile', authMiddleware, requireRole('admin'), async (req, res) => {
  const user = await User.findById(req.user.id); // ✅ CORRECT
  // ...
});

router.put('/profile', authMiddleware, requireRole('admin'), async (req, res) => {
  const user = await User.findById(req.user.id); // ✅ CORRECT
  // ...
});
```

## How Data Storage Works

### 1. Update Profile
```
User updates name/email
       ↓
Frontend sends PUT request
       ↓
Backend validates data
       ↓
MongoDB User.save() - PERMANENT STORAGE
       ↓
Response with updated profile
       ↓
Frontend updates AuthContext
       ↓
localStorage updated (for quick access)
```

### 2. Page Refresh
```
Page refreshes
       ↓
Frontend calls GET /api/admin/profile
       ↓
Backend fetches from MongoDB (req.user.id)
       ↓
Returns profile data from database
       ↓
Form populated with database data
       ↓
Data persists ✅
```

### 3. Data Persistence Layers

**Layer 1: MongoDB (Permanent)**
- Primary source of truth
- Data stored permanently
- Survives server restart
- Never deleted unless explicitly removed

**Layer 2: AuthContext (Session)**
- In-memory state
- Updated when profile changes
- Cleared on logout

**Layer 3: localStorage (Browser)**
- Quick access cache
- Synced with AuthContext
- Cleared on logout
- Backup for page refresh

## JWT Token Structure

The JWT token created during login contains:
```javascript
{
  id: user._id,        // ✅ Use this
  email: user.email,
  role: user.role
}
```

NOT:
```javascript
{
  userId: user._id,    // ❌ This doesn't exist
  // ...
}
```

## Testing

### Test 1: Update and Refresh
1. Login as admin
2. Go to Profile page
3. Update name: "Admin Test Name"
4. Click "Save Changes"
5. ✅ Success notification
6. **Refresh page (F5)**
7. ✅ Name still shows "Admin Test Name"
8. Check MongoDB: `db.users.findOne({ role: 'admin' })`
9. ✅ Name is "Admin Test Name" in database

### Test 2: Close Browser and Reopen
1. Update profile
2. Close browser completely
3. Reopen browser
4. Login again
5. Go to Profile page
6. ✅ Updated data is still there

### Test 3: Server Restart
1. Update profile
2. Stop backend server
3. Restart backend server
4. Refresh frontend
5. ✅ Data persists from MongoDB

## MongoDB Storage Verification

Check data in MongoDB:
```bash
# Connect to MongoDB
mongosh

# Switch to database
use placement_portal

# Find admin user
db.users.findOne({ role: 'admin' })

# Output shows:
{
  _id: ObjectId("..."),
  email: "admin@college.edu",
  name: "Admin Test Name",  // ✅ Updated name stored
  role: "admin",
  password: "$2a$10$...",    // Hashed password
  createdAt: ISODate("...")
}
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────┐
│                  USER ACTION                     │
│            Update Profile Form                   │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│              FRONTEND (React)                    │
│  - Validate input                                │
│  - Call api.admin.updateProfile()                │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│         BACKEND (Express + MongoDB)              │
│  - Verify JWT token (req.user.id)               │
│  - Find user in MongoDB                          │
│  - Update user document                          │
│  - user.save() → PERMANENT STORAGE               │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│            MongoDB Database                      │
│  ┌─────────────────────────────────┐            │
│  │  users collection                │            │
│  │  {                               │            │
│  │    _id: ObjectId("..."),         │            │
│  │    name: "Updated Name", ← SAVED │            │
│  │    email: "new@email.com" ← SAVED│            │
│  │    role: "admin",                │            │
│  │    password: "hashed..."         │            │
│  │  }                               │            │
│  └─────────────────────────────────┘            │
│         ✅ DATA STORED PERMANENTLY               │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│         RESPONSE TO FRONTEND                     │
│  - Success message                               │
│  - Updated profile data                          │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│         FRONTEND UPDATES                         │
│  - AuthContext.updateUser()                      │
│  - localStorage.setItem('user', ...)             │
│  - Form shows updated data                       │
└─────────────────────────────────────────────────┘

         ON PAGE REFRESH:
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│         FETCH FROM DATABASE                      │
│  GET /api/admin/profile                          │
│  → MongoDB.findById(req.user.id)                 │
│  → Returns stored data                           │
│  → Form populated with database data             │
│  ✅ DATA PERSISTS                                │
└─────────────────────────────────────────────────┘
```

## Summary

The bug was a simple field name mismatch:
- JWT token uses `id` field
- Backend was looking for `userId` field
- This caused database queries to fail
- Data was being saved but not retrieved

**Now Fixed:**
- ✅ Data saves to MongoDB permanently
- ✅ Data loads from MongoDB on refresh
- ✅ Data persists across browser restarts
- ✅ Data persists across server restarts
- ✅ No data loss

The admin profile is now fully connected to MongoDB with permanent storage!
