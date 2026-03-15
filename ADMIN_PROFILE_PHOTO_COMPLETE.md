# Admin Profile Photo - Complete ✅

## Overview

Implemented complete profile photo functionality for admin users with permanent MongoDB storage. Photos persist across page refreshes and are stored in the database.

## Features Implemented

### 1. Database Storage
- Added `profilePhotoUrl` field to User model
- Photos stored in `/backend/uploads/` directory
- Photo URL saved to MongoDB permanently
- Old photos automatically deleted when new photo uploaded

### 2. Backend API
- **POST `/api/admin/profile-photo`** - Upload profile photo
- **GET `/api/admin/profile`** - Returns profile with photo URL
- File validation (size, type)
- Automatic old photo cleanup

### 3. Frontend UI
- Large avatar display (128x128px)
- Upload button with camera icon
- Loading state during upload
- Fallback to initials if no photo
- File size and format validation

## Implementation Details

### User Model Update
```javascript
{
  email: String,
  password: String,
  name: String,
  role: String,
  profilePhotoUrl: String,  // NEW - stores photo URL
  createdAt: Date
}
```

### Backend Routes

#### Upload Photo
```javascript
POST /api/admin/profile-photo
Headers: Authorization: Bearer <token>
Body: FormData with 'photo' file

Response:
{
  success: true,
  message: "Profile photo uploaded successfully",
  profilePhotoUrl: "/uploads/admin-photo-1234567890.jpg"
}
```

#### Get Profile (Updated)
```javascript
GET /api/admin/profile
Headers: Authorization: Bearer <token>

Response:
{
  success: true,
  profile: {
    id: "...",
    email: "admin@college.edu",
    name: "Admin User",
    role: "admin",
    profilePhotoUrl: "/uploads/admin-photo-1234567890.jpg",  // NEW
    createdAt: "..."
  }
}
```

### File Upload Configuration

**Multer Setup:**
- Storage: Disk storage in `/backend/uploads/`
- Filename: `admin-photo-{timestamp}-{random}.{ext}`
- Size limit: 5MB
- Allowed formats: JPEG, JPG, PNG, GIF
- Auto-create uploads directory if not exists

**Validation:**
- File size: Max 5MB
- File type: Images only (jpeg, jpg, png, gif)
- MIME type validation
- Extension validation

### Frontend Implementation

**Profile Photo Section:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Profile Photo</CardTitle>
  </CardHeader>
  <CardContent>
    <Avatar className="h-32 w-32">
      <AvatarImage src={photoUrl} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
    <Button onClick={handlePhotoClick}>
      <Upload /> Upload
    </Button>
    <input type="file" hidden ref={fileInputRef} />
  </CardContent>
</Card>
```

**Photo Upload Flow:**
1. User clicks upload button
2. File input opens
3. User selects image
4. Frontend validates size/type
5. FormData created with file
6. API call to upload endpoint
7. Backend saves file and URL
8. Response with new photo URL
9. Frontend updates avatar
10. Success toast notification

## Data Persistence

### Storage Layers

**1. File System (Permanent)**
```
backend/uploads/
  ├── admin-photo-1234567890.jpg  ← Physical file
  ├── admin-photo-0987654321.png
  └── ...
```

**2. MongoDB (Permanent)**
```javascript
{
  _id: ObjectId("..."),
  email: "admin@college.edu",
  name: "Admin User",
  profilePhotoUrl: "/uploads/admin-photo-1234567890.jpg",  ← URL stored
  // ...
}
```

**3. Frontend State (Session)**
```javascript
const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
// Updated after upload
// Loaded from database on page load
```

### Persistence Flow

```
Upload Photo
     ↓
Save to /backend/uploads/
     ↓
Save URL to MongoDB User document
     ↓
Return URL to frontend
     ↓
Update state
     ↓
Display photo
     ↓
Page Refresh
     ↓
Fetch profile from MongoDB
     ↓
Get profilePhotoUrl from database
     ↓
Display photo ✅ PERSISTS
```

## Old Photo Cleanup

When uploading a new photo:
1. Check if user has existing photo URL
2. If yes, construct file path
3. Check if file exists on disk
4. Delete old file
5. Save new photo
6. Update URL in database

```javascript
if (user.profilePhotoUrl) {
  const oldPhotoPath = path.join(__dirname, '..', user.profilePhotoUrl);
  if (fs.existsSync(oldPhotoPath)) {
    fs.unlinkSync(oldPhotoPath);  // Delete old photo
  }
}
```

## API Service

```typescript
// Upload profile photo
uploadProfilePhoto: async (file: File) => {
  const formData = new FormData();
  formData.append('photo', file);
  
  const response = await fetch('/api/admin/profile-photo', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  
  return response.json();
}
```

## UI Features

### Avatar Display
- Size: 128x128 pixels
- Rounded circle
- Shows uploaded photo if available
- Shows first letter of name as fallback
- Smooth loading transition

### Upload Button
- Positioned at bottom-right of avatar
- Circular button with upload icon
- Loading spinner during upload
- Disabled while uploading

### Validation Messages
- "Photo size must be less than 5MB"
- "Please upload an image file"
- "Profile photo updated successfully"
- "Failed to upload photo"

## Testing

### Test Photo Upload
1. Login as admin
2. Go to Profile page
3. Click upload button on avatar
4. Select an image file
5. ✅ Photo uploads
6. ✅ Avatar updates immediately
7. ✅ Success notification

### Test Photo Persistence
1. Upload photo
2. Refresh page (F5)
3. ✅ Photo still displays
4. Check MongoDB: `db.users.findOne({ role: 'admin' })`
5. ✅ profilePhotoUrl field has value
6. Check file system: `backend/uploads/`
7. ✅ Photo file exists

### Test Photo Replacement
1. Upload first photo
2. Upload second photo
3. ✅ Old photo deleted from disk
4. ✅ New photo displayed
5. ✅ Only one photo file per admin

### Test File Validation
1. Try uploading 10MB file
2. ✅ Error: "Photo size must be less than 5MB"
3. Try uploading PDF file
4. ✅ Error: "Please upload an image file"

## File Structure

```
backend/
  ├── uploads/
  │   ├── admin-photo-1234567890.jpg  ← Admin photos
  │   ├── photo-9876543210.jpg        ← Student photos
  │   └── ...
  ├── routes/
  │   └── admin-mongodb.js  ← Photo upload endpoint
  └── models/
      └── User.js  ← profilePhotoUrl field

frontend/
  └── src/
      ├── pages/
      │   └── admin/
      │       └── Profile.tsx  ← Photo upload UI
      └── services/
          └── api.ts  ← uploadProfilePhoto method
```

## Security

1. **Authentication Required**: JWT token must be valid
2. **Role Check**: Only admin role can upload
3. **File Type Validation**: Only images allowed
4. **File Size Limit**: Max 5MB
5. **Unique Filenames**: Timestamp + random number
6. **Path Sanitization**: Prevents directory traversal

## Error Handling

**Backend Errors:**
- No file uploaded
- Invalid file type
- File too large
- User not found
- Database save error

**Frontend Errors:**
- File size validation
- File type validation
- Network errors
- Upload failures

All errors show user-friendly toast notifications.

## Photo URL Format

```
/uploads/admin-photo-1234567890-123456789.jpg
         └─────┬─────┘ └────┬────┘ └──┬──┘
           prefix     timestamp   random  ext
```

**Full URL in Frontend:**
```
http://localhost:3001/uploads/admin-photo-1234567890.jpg
```

## Files Modified/Created

### Modified:
1. `backend/models/User.js` - Added profilePhotoUrl field
2. `backend/routes/admin-mongodb.js` - Added photo upload endpoint
3. `src/services/api.ts` - Added uploadProfilePhoto method
4. `src/pages/admin/Profile.tsx` - Added photo upload UI

### No New Files Created
- Uses existing uploads directory
- Uses existing multer package

## Summary

Admin profile photo functionality is now complete with:
- ✅ Photo upload with validation
- ✅ Permanent storage in MongoDB
- ✅ File system storage
- ✅ Photo persistence across refreshes
- ✅ Old photo cleanup
- ✅ User-friendly UI
- ✅ Error handling
- ✅ Security measures

The admin can now upload a profile photo that persists permanently in the database and displays correctly even after page refresh!
