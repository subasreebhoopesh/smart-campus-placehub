# 🚀 Deploy Backend to Render.com - Step by Step

## Step 1: Sign Up on Render.com
1. Go to: **https://render.com**
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (easiest way)

---

## Step 2: Create Web Service
1. After login, click **"New +"** button (top right)
2. Select **"Web Service"**

---

## Step 3: Connect Your Repository
1. Click **"Connect a repository"**
2. Find your project: **smart-campus-pathways**
3. Click **"Connect"**

---

## Step 4: Configure Backend Settings

### Basic Settings:
```
Name: placehub-backend
Region: Choose closest to you (e.g., Singapore)
Branch: main (or master)
Root Directory: backend
Runtime: Node
```

### Build & Start Commands:
```
Build Command: npm install
Start Command: node server.js
```

### Plan:
```
Select: Free (0$/month)
```

---

## Step 5: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these **3 variables**:

```
MONGODB_URI = mongodb://localhost:27017/placement_portal
PORT = 3001
NODE_ENV = production
```

⚠️ **Important:** Replace `MONGODB_URI` with your actual MongoDB connection string if using MongoDB Atlas (cloud MongoDB).

---

## Step 6: Deploy!

1. Click **"Create Web Service"**
2. Wait 2-3 minutes for deployment
3. You'll get a URL like: `https://placehub-backend.onrender.com`

**Copy this URL!** You'll need it in the next step.

---

## Step 7: Update Vercel Environment Variable

1. Go to: **https://vercel.com**
2. Open your project: **smart-campus-placehub**
3. Go to **Settings** → **Environment Variables**
4. Add new variable:

```
Key: VITE_API_URL
Value: https://placehub-backend.onrender.com/api
```

5. Click **"Save"**

---

## Step 8: Redeploy Frontend

### Option A: Through Vercel Dashboard
1. Go to **Deployments** tab
2. Click **...** (three dots) on latest deployment
3. Click **"Redeploy"**

### Option B: Push to GitHub
```bash
git add .
git commit -m "Update backend URL"
git push
```

Vercel will auto-deploy.

---

## Step 9: Test Your Deployed Site!

1. Go to: **https://smart-campus-placehub.vercel.app**
2. Try to login with:
   - **Email:** sreesuba219.2005@gmail.com
   - **Password:** Suba@2005

---

## ✅ Final Architecture:

```
Frontend (Vercel):
https://smart-campus-placehub.vercel.app
         ↓
         ↓ (connects to)
         ↓
Backend (Render):
https://placehub-backend.onrender.com
         ↓
         ↓ (connects to)
         ↓
Database (MongoDB):
Local or MongoDB Atlas
```

---

## 🆘 Troubleshooting:

### If Backend Deploy Fails:
- Check if `backend/package.json` exists
- Check if `backend/server.js` exists
- Check Build Logs in Render dashboard

### If Frontend Still Can't Connect:
- Make sure VITE_API_URL is saved in Vercel
- Make sure you **redeployed** after adding the variable
- Check browser console for errors (F12)

### If MongoDB Connection Fails:
- Use **MongoDB Atlas** (free cloud database)
- Go to: https://www.mongodb.com/cloud/atlas
- Create free cluster
- Get connection string
- Update `MONGODB_URI` in Render

---

## 💡 Alternative: Use MongoDB Atlas (Recommended)

MongoDB Atlas is a free cloud database that works better with deployed apps:

1. Go to: **https://www.mongodb.com/cloud/atlas**
2. Sign up for free
3. Create a free cluster
4. Click **"Connect"** → **"Connect your application"**
5. Copy the connection string
6. Replace `mongodb://localhost...` with the Atlas connection string
7. Update in Render's environment variables

---

## 🎯 Want me to do it for you?

If you want, I can:
1. Create the MongoDB Atlas database for you
2. Generate the proper connection strings
3. Create the deployment configuration files

Just say: **"deploy it for me"** 😊
