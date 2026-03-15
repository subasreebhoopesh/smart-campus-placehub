# 🚀 Deployment Checklist - Follow This!

## ✅ Pre-Deployment Checklist

### Step 1: MongoDB Atlas Setup (5 minutes)
- [ ] Go to https://www.mongodb.com/cloud/atlas
- [ ] Create FREE account (Sign up with Google)
- [ ] Create new cluster (FREE M0 tier)
- [ ] Choose region: Mumbai (closest to India)
- [ ] Create database user (username: admin, password: admin123)
- [ ] Add IP whitelist: 0.0.0.0/0 (allow all)
- [ ] Get connection string and save it:
```
mongodb+srv://admin:admin123@cluster0.xxxxx.mongodb.net/placement_portal
```

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### Step 2: GitHub Repository Setup (3 minutes)
- [ ] Go to https://github.com
- [ ] Create new repository: `smart-campus-pathways`
- [ ] Make it PUBLIC (for free deployment)
- [ ] Don't initialize with README (we have files already)

**Upload Code:**
```bash
cd smart-campus-pathways-main
git init
git add .
git commit -m "Initial commit - Placement Portal"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/smart-campus-pathways.git
git push -u origin main
```

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### Step 3: Render Backend Deployment (10 minutes)
- [ ] Go to https://render.com
- [ ] Sign up with GitHub account
- [ ] Click "New +" → "Web Service"
- [ ] Connect your GitHub repository
- [ ] Configure:
  - Name: `placehub-backend`
  - Root Directory: `backend`
  - Environment: `Node`
  - Build Command: `npm install`
  - Start Command: `node server.js`
  - Instance Type: **FREE**

**Environment Variables to Add:**
```
MONGODB_URI = mongodb+srv://admin:admin123@cluster0.xxxxx.mongodb.net/placement_portal
JWT_SECRET = mySecretKey12345RandomString
PORT = 3001
NODE_ENV = production
```

- [ ] Click "Create Web Service"
- [ ] Wait for deployment (5-10 minutes)
- [ ] Copy your backend URL: `https://placehub-backend.onrender.com`
- [ ] Test: Open `https://placehub-backend.onrender.com/api/health`
  - Should see: `{"status":"ok"}`

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### Step 4: Vercel Frontend Deployment (5 minutes)
- [ ] Go to https://vercel.com
- [ ] Sign up with GitHub account
- [ ] Click "Add New..." → "Project"
- [ ] Import your GitHub repository
- [ ] Configure:
  - Framework Preset: `Vite`
  - Root Directory: `./`
  - Build Command: `npm run build`
  - Output Directory: `dist`

**Environment Variable to Add:**
```
VITE_API_URL = https://placehub-backend.onrender.com/api
```

- [ ] Click "Deploy"
- [ ] Wait for deployment (2-3 minutes)
- [ ] Copy your frontend URL: `https://your-project.vercel.app`
- [ ] Test: Open the URL in browser

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### Step 5: Create Admin User (2 minutes)
- [ ] Go to Render dashboard
- [ ] Click your backend service
- [ ] Click "Shell" tab (top right)
- [ ] Run command:
```bash
cd backend
node seed-admin.js
```
- [ ] Should see: "Admin user created successfully"

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### Step 6: Final Testing (5 minutes)

**Test Backend:**
- [ ] Open: `https://placehub-backend.onrender.com/api/health`
- [ ] Should see: `{"status":"ok"}`

**Test Frontend:**
- [ ] Open: `https://your-project.vercel.app`
- [ ] Should see homepage

**Test Login:**
- [ ] Click "Login" button
- [ ] Enter credentials:
  - Email: `admin@college.edu`
  - Password: `admin123`
- [ ] Should login successfully
- [ ] Should see admin dashboard

**Test Features:**
- [ ] Create a company
- [ ] Create a placement drive
- [ ] Register as student (use different browser/incognito)
- [ ] Apply for drive
- [ ] Check admin can see application
- [ ] Test chat feature
- [ ] Test notifications

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 🎉 Deployment Complete!

### Your Live URLs:
- **Frontend:** `https://your-project.vercel.app`
- **Backend:** `https://placehub-backend.onrender.com`
- **Database:** MongoDB Atlas (Cloud)

### Login Credentials:
- **Admin:** admin@college.edu / admin123
- **Student:** Register new account

### Share Your Project:
- Add to resume/portfolio
- Share with college placement cell
- Share with friends
- Post on LinkedIn

---

## ⚠️ Important Notes

### Render Free Tier:
- Backend sleeps after 15 minutes of inactivity
- First request takes 30 seconds (waking up)
- After that, normal speed
- 750 hours/month free (enough for testing)

### MongoDB Atlas Free Tier:
- 512 MB storage
- Enough for 1000+ students
- Shared cluster

### Vercel Free Tier:
- Unlimited deployments
- Fast CDN
- Perfect for frontend

---

## 🔧 Troubleshooting

### Backend Not Responding?
- Wait 30 seconds (waking from sleep)
- Check Render logs
- Verify environment variables

### CORS Error?
- Check VITE_API_URL in Vercel
- Should be: `https://placehub-backend.onrender.com/api`
- Redeploy if needed

### MongoDB Connection Failed?
- Check IP whitelist (should be 0.0.0.0/0)
- Verify connection string
- Check username/password

### Login Not Working?
- Make sure admin user is created
- Check backend logs
- Verify JWT_SECRET is set

---

## 📞 Need Help?

If stuck:
1. Check Render logs (Shell tab)
2. Check Vercel deployment logs
3. Verify all environment variables
4. Try redeploying

---

## ✅ Final Checklist

- [ ] MongoDB Atlas database created
- [ ] GitHub repository created and code pushed
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Admin user created
- [ ] Login tested and working
- [ ] All features tested
- [ ] URLs saved and shared

**Total Time:** ~30 minutes
**Total Cost:** ₹0 (FREE!)

**Congratulations! Your project is LIVE! 🎉**
