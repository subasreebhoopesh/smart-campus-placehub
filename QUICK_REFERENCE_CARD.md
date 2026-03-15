# Quick Reference Card 📋

## 🚀 Start Application
```bash
cd smart-campus-pathways-main
start-dev.bat
```

## 🌐 URLs
- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:3001/api
- **MongoDB**: mongodb://localhost:27017/placement_portal

## 🔑 Login Credentials

### Admin
- Email: `admin@college.edu`
- Password: `admin123`

### Test Student (create your own)
- Email: `student@test.com`
- Password: `test123`
- Roll: `CSE2021001`
- Branch: `CSE`

## ✅ Quick Test (2 min)

1. **Admin Login** → http://localhost:8080 → Admin Login
2. **Add Company** → Companies → Add Company → Fill → Save
3. **Create Drive** → Drives → Create Drive → Select Company → Save
4. **Student View** → New Incognito → Register Student → Opportunities
5. **✅ Success**: Student sees the drive!

## 🔧 Troubleshooting

### Servers Not Running?
```bash
# Backend
cd backend
npm start

# Frontend
cd ..
npm run dev
```

### MongoDB Not Running?
```bash
net start MongoDB
```

### Clear Cache
- F12 → Application → Clear Storage → Refresh

## 📊 Check Database
```bash
mongosh
use placement_portal
db.companies.find()
db.placementdrives.find()
```

## 🎯 What's Working
- ✅ Admin adds company → Saves to MongoDB
- ✅ Admin creates drive → Saves to MongoDB
- ✅ Student sees drive → Loads from MongoDB
- ✅ Student applies → Saves to MongoDB
- ✅ All data persists forever

## 📁 Key Files
- `backend/server.js` - Backend entry
- `backend/config/database-mongodb.js` - DB connection
- `src/pages/admin/Companies.tsx` - Company management
- `src/pages/admin/Drives.tsx` - Drive management
- `src/services/api.ts` - API service

## 🆘 Need Help?
Read these in order:
1. `QUICK_START.md` - Quick start guide
2. `STATUS_CHECK.md` - System status
3. `MONGODB_INTEGRATION_COMPLETE.md` - Full details
4. `FINAL_SUMMARY.md` - Complete summary

## ✨ Success Indicator
**If student can see the drive after admin creates it, everything works!**
