# Admin Profile - Quick Guide 🚀

## Access the Profile Page

1. Login as admin: http://localhost:8080/admin/login
   - Email: `admin@college.edu`
   - Password: `admin123`

2. Click **"Profile"** in the sidebar (icon: 👤)

## Update Your Information

### Change Name or Email
1. Edit the "Full Name" field
2. Edit the "Email Address" field
3. Click **"Save Changes"**
4. ✅ Success notification appears

### Change Password
1. Enter your **Current Password**
2. Enter **New Password** (minimum 6 characters)
3. Enter **Confirm New Password** (must match)
4. Click **"Save Changes"**
5. ✅ Password updated successfully

### Update Both
You can update name/email AND password in the same submission!

## Features

✨ **Show/Hide Password**: Click the eye icon to toggle password visibility

🔒 **Secure**: Current password required to change password

✅ **Validation**: 
- Name cannot be empty
- Email must be valid and unique
- Passwords must match
- New password minimum 6 characters

💾 **Auto-Save**: All changes saved to MongoDB database

🔔 **Notifications**: Success/error messages for every action

## Test the Backend API

Run the test script:
```bash
cd backend
node test-admin-profile.js
```

This will test all profile operations automatically.

## Navigation

**Sidebar Menu Order:**
1. Dashboard
2. Students
3. Companies
4. Placement Drives
5. Applications
6. HR Credentials
7. Analytics
8. Reports
9. **👤 Profile** ← NEW!
10. Settings

## Common Issues

**"Current password is incorrect"**
- Make sure you're entering the right current password
- Default admin password is `admin123`

**"Email already in use"**
- Another user (student/HR) has this email
- Choose a different email address

**"New passwords do not match"**
- Check both new password fields match exactly
- Use the eye icon to verify

## Security Notes

🔐 All passwords are hashed with bcrypt
🔑 JWT authentication required
👮 Admin role verification on every request
📧 Email uniqueness enforced across all users
