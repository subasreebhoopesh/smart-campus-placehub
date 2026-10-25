# 🚀 RENDER FRESH DEPLOYMENT GUIDE
## புதுசா Render-ல Deploy பண்ணுறது

---

## ✅ Current Status:
- ✅ Local login working
- ✅ MongoDB Atlas cloud database connected
- ✅ Fresh data seeded (9 users)
- ✅ Backend ready for deployment
- 🔄 Ready to deploy on Render

---

## 📝 STEP-BY-STEP RENDER DEPLOYMENT

### **STEP 1: Create New Render Account (if needed)**
1. Go to: https://render.com
2. Sign up with GitHub (recommended) or Email
3. Confirm your email

---

### **STEP 2: Deploy Backend on Render**

#### A. Push Code to GitHub First (if not done)
```bash
cd backend
git init
git add .
git commit -m "Backend ready for deployment"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

#### B. Create Web Service on Render
1. Go to https://dashboard.render.com
2. Click **"New +"** → Select **"Web Service"**
3. Connect your GitHub repository
4. Fill in the details:

**Basic Settings:**
- **Name:** `placement-portal-backend` (or any name you want)
- **Region:** Singapore (closest to India)
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** `Free`

---

### **STEP 3: Add Environment Variables**

In Render dashboard, add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `JWT_SECRET` | `placehub_jwt_secret_2024_stable` |
| `MONGODB_URI` | `mongodb+srv://campusadmin:gTi4EzoT5pqpuhAx@cluster0.daypvo7.mongodb.net/placement_portal?retryWrites=true&w=majority` |
| `UPLOAD_DIR` | `./uploads` |

**How to add:**
1. Scroll down to **"Environment Variables"** section
2. Click **"Add Environment Variable"**
3. Copy-paste each KEY and VALUE
4. Click **"Save Changes"**

---

### **STEP 4: Deploy!**
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for build to complete
3. Look for: ✅ **"Live"** status

---

### **STEP 5: Get Backend URL**
Once deployed, you'll get a URL like:
```
https://placement-portal-backend.onrender.com
```

**Copy this URL!** You'll need it for frontend deployment.

---

### **STEP 6: Deploy Frontend on Vercel**

#### A. Update Frontend API URL
Before deploying frontend, we need to update the API URL.

**You need to update:**
- File: `src/services/api.ts`
- Change: `baseURL` from `http://localhost:3001/api` to `https://YOUR-RENDER-URL.onrender.com/api`

#### B. Deploy on Vercel
1. Go to: https://vercel.com
2. Sign in with GitHub
3. Click **"Add New"** → **"Project"**
4. Import your repository
5. **Root Directory:** Leave empty (project root)
6. **Framework Preset:** Vite
7. **Build Command:** `npm run build`
8. **Output Directory:** `dist`

#### C. Add Environment Variable
In Vercel:
- **Name:** `VITE_API_URL`
- **Value:** `https://YOUR-RENDER-BACKEND-URL.onrender.com/api`

9. Click **"Deploy"**
10. Wait 2-3 minutes

---

## 🎉 DEPLOYMENT COMPLETE!

Once both are deployed:

### **Test Your Live App:**
1. Open your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Login with:
   - **Admin:** admin@college.edu / admin123
   - **Student:** raj@example.com / password123
   - **HR:** hr@techcorp.com / password123

---

## 🔧 Important Notes:

1. **Render Free Tier:** Backend sleeps after 15 mins of inactivity. First request will be slow (takes 30-60 seconds to wake up).
2. **MongoDB Atlas IP:** Your cloud MongoDB is already configured to accept all IPs (`0.0.0.0/0`), so Render can connect.
3. **File Uploads:** On Render free tier, uploaded files are temporary. Use cloud storage (Cloudinary, AWS S3) for production.

---

## 📱 Need Help?

**Common Issues:**

1. **"Connection refused" error:** 
   - Check Render logs: Dashboard → Your Service → Logs
   - Verify MongoDB URI in environment variables

2. **"Failed to fetch" on login:**
   - Verify frontend VITE_API_URL points to correct Render URL
   - Check Render service is "Live" (not sleeping)

3. **Backend keeps sleeping:**
   - This is normal on free tier
   - Consider keeping backend awake with a cron job (external ping service)

---

## 🎯 QUICK DEPLOYMENT CHECKLIST:

- [ ] Code pushed to GitHub
- [ ] Render Web Service created
- [ ] Environment variables added in Render
- [ ] Backend deployed (Status: Live)
- [ ] Got Render backend URL
- [ ] Updated frontend API URL
- [ ] Vercel project created
- [ ] Environment variable added in Vercel
- [ ] Frontend deployed
- [ ] Tested login on live URL

---

## 🚀 YOUR LIVE URLS:

**Backend (Render):** [Add your URL here after deployment]

**Frontend (Vercel):** [Add your URL here after deployment]

---

**LOGIN CREDENTIALS (Cloud Database):**
- Admin: admin@college.edu / admin123
- Students: raj@example.com, priya@example.com, etc. / password123
- HR: hr@techcorp.com, hr@innovate.com, etc. / password123

---

✅ **Your project is now live on the internet with cloud database!** 🎉
