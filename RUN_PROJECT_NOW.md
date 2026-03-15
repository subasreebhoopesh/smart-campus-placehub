# 🚀 Run Project - Quick Start Guide

## Prerequisites
- Node.js installed
- MongoDB running (local or cloud)
- Two terminal windows

## Step 1: Start Backend Server

Open Terminal 1 and run:

```bash
cd smart-campus-pathways-main/backend
node server.js
```

You should see:
```
🚀 Server running on port 3001
📡 API available at http://localhost:3001/api
💾 Using MongoDB database
👤 Default admin: admin@college.edu / admin123
```

## Step 2: Start Frontend

Open Terminal 2 and run:

```bash
cd smart-campus-pathways-main
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:8080/
➜  Network: use --host to expose
```

## Step 3: Access the Application

Open your browser and go to:
- **Homepage**: http://localhost:8080
- **Admin Login**: http://localhost:8080/admin/login
- **Student Login**: http://localhost:8080/student/login
- **HR Login**: http://localhost:8080/hr/login

## Default Credentials

### Admin
- Email: `admin@college.edu`
- Password: `admin123`

### Create Test Student
1. Go to http://localhost:8080/student/register
2. Fill in the registration form
3. Login with your credentials

## Test the Notification System

### As Admin:
1. Login as admin
2. Go to Dashboard
3. Click "Send Notifications" button
4. Fill in:
   - Title: "Test Notification"
   - Message: "This is a test notification"
   - Target: All Students
   - Priority: High
5. Click "Send Notification"

### As Student:
1. Login as student
2. Look at the bell icon in top navigation
3. You should see a red badge with "1"
4. Click the bell icon
5. See your notification
6. Click to mark as read or delete

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Check if port 3001 is available
- Verify `.env` file in backend folder

### Frontend won't start
- Run `npm install` in smart-campus-pathways-main folder
- Check if port 8080 is available
- Clear node_modules and reinstall if needed

### Notifications not showing
- Check browser console for errors
- Verify backend is running
- Check MongoDB connection
- Try logging out and back in

## Quick Commands

### Stop Servers
- Press `Ctrl + C` in each terminal

### Restart Backend
```bash
cd smart-campus-pathways-main/backend
node server.js
```

### Restart Frontend
```bash
cd smart-campus-pathways-main
npm run dev
```

### Create Admin User (if needed)
```bash
cd smart-campus-pathways-main/backend
node seed-admin.js
```

## Features to Test

1. **Notifications**
   - Send notification from admin
   - View notifications as student
   - Mark as read
   - Delete notifications
   - Mark all as read

2. **Homepage**
   - View real statistics
   - See recent placements
   - View upcoming drives
   - See partner companies

3. **Student Portal**
   - Register new student
   - Complete profile
   - View opportunities
   - Apply to drives
   - Check application status

4. **Admin Portal**
   - Manage students
   - Manage companies
   - Create placement drives
   - Review applications
   - Send notifications

5. **HR Portal**
   - View applications
   - Update application status
   - View student profiles

## Project Structure

```
smart-campus-pathways-main/
├── backend/
│   ├── models/
│   │   └── Notification.js (NEW!)
│   ├── routes/
│   │   └── notifications-mongodb.js (NEW!)
│   ├── utils/
│   │   └── notificationHelper.js (NEW!)
│   └── server.js (UPDATED!)
├── src/
│   ├── contexts/
│   │   └── NotificationContext.tsx (NEW!)
│   ├── components/
│   │   └── layout/
│   │       └── TopNav.tsx (UPDATED!)
│   ├── pages/
│   │   ├── Home.tsx (UPDATED!)
│   │   └── admin/
│   │       └── Dashboard.tsx (UPDATED!)
│   └── App.tsx (UPDATED!)
└── package.json
```

## Environment Variables

### Backend (.env)
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/placement_portal
JWT_SECRET=your_secret_key_here
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

## Database

The project uses MongoDB. Collections:
- users
- students
- companies
- placementdrives
- applications
- hrs
- notifications (NEW!)

## API Endpoints

### Notifications
- GET `/api/notifications` - Get all notifications
- GET `/api/notifications/unread-count` - Get unread count
- PATCH `/api/notifications/:id/read` - Mark as read
- PATCH `/api/notifications/mark-all-read` - Mark all as read
- DELETE `/api/notifications/:id` - Delete notification
- POST `/api/notifications/send` - Send notification
- POST `/api/notifications/broadcast` - Broadcast notification

## Support

If you encounter any issues:
1. Check the console for errors
2. Verify MongoDB is running
3. Check if both servers are running
4. Clear browser cache
5. Try in incognito mode

## Success Indicators

✅ Backend running on port 3001
✅ Frontend running on port 8080
✅ MongoDB connected
✅ Can login as admin
✅ Can see notification bell
✅ Can send and receive notifications
✅ Homepage shows data
✅ All features working

## Next Steps

1. Add more test data
2. Create multiple students
3. Create placement drives
4. Test application flow
5. Test notification system
6. Explore all features

---

**Status**: Ready to run! 🎉

**Last Updated**: February 9, 2026
