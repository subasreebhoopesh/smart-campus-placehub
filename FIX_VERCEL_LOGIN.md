# 🚨 Fix Vercel Login Issue

## The Problem:
Your Vercel site (https://smart-campus-placehub.vercel.app/) **cannot connect to localhost:3001**

- ❌ Vercel frontend → localhost backend = **IMPOSSIBLE**
- Internet cannot access your computer's localhost!

---

## ✅ Solution: Deploy Backend to Render.com (FREE)

### Step 1: Sign Up on Render.com
1. Go to: https://render.com
2. Sign up with GitHub (Free account)

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Or use "Deploy from Git"

### Step 3: Configure Backend
```
Name: placehub-backend
Root Directory: backend
Build Command: npm install
Start Command: node server.js
```

### Step 4: Add Environment Variables
Click **"Environment"** and add:
```
MONGODB_URI = mongodb+srv://your-connection-string
PORT = 3001
JWT_SECRET = your-secret-key
NODE_ENV = production
```

### Step 5: Deploy!
- Click **"Create Web Service"**
- Wait 2-3 minutes for deployment
- You'll get a URL like: `https://placehub-backend.onrender.com`

---

## Step 6: Update Frontend API URL

After backend is deployed, update your frontend to use the new backend URL:

**File: `src/services/api.ts`**

Change from:
```typescript
const API_BASE_URL = 'http://localhost:3001/api';
```

To:
```typescript
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://placehub-backend.onrender.com/api'
  : 'http://localhost:3001/api';
```

This makes it use:
- **Render backend** when deployed to Vercel
- **Localhost backend** when running locally

---

## Step 7: Redeploy to Vercel

After updating api.ts:
```bash
git add .
git commit -m "Connect to deployed backend"
git push
```

Vercel will auto-deploy the new version.

---

## 🎯 Final Result:

✅ **Localhost (Development):**
- Frontend: http://localhost:8080
- Backend: http://localhost:3001
- Status: ✅ Working

✅ **Deployed (Production):**
- Frontend: https://smart-campus-placehub.vercel.app
- Backend: https://placehub-backend.onrender.com
- Status: ✅ Will work after setup

---

## 🔥 Quick Alternative: Use localhost for now

If you don't want to deploy backend right now:
- ✅ **Use:** http://localhost:8080 (local version)
- ❌ **Don't use:** Vercel URL until backend is deployed

---

## Need Help?

Just tell me "deploy backend" and I'll guide you step by step! 😊
