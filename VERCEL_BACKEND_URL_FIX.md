# 🔧 Fix Vercel to Connect to Your Backend

## You deployed backend, but Vercel doesn't know about it!

---

## Step 1: Get Your Backend URL

Your backend URL from Render looks like:
```
https://your-app-name.onrender.com
```

Copy this URL! (Don't include `/api` yet)

---

## Step 2: Add Environment Variable to Vercel

1. Go to: **https://vercel.com/dashboard**
2. Click on your project: **smart-campus-placehub**
3. Click **"Settings"** tab
4. Click **"Environment Variables"** (left sidebar)
5. Click **"Add New"** button

### Add this variable:

```
Key:   VITE_API_URL
Value: https://your-backend-url.onrender.com/api
```

**Important:** Add `/api` at the end!

Example:
```
VITE_API_URL = https://placehub-backend.onrender.com/api
```

6. Select **ALL** environments (Production, Preview, Development)
7. Click **"Save"**

---

## Step 3: Redeploy Vercel

### Method 1: From Dashboard
1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click the **three dots (...)** on the right
4. Click **"Redeploy"**
5. Confirm **"Redeploy"**

### Method 2: From Git (if you have Git)
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

## Step 4: Wait & Test

1. Wait 1-2 minutes for deployment
2. Go to: **https://smart-campus-placehub.vercel.app**
3. Try to login!

---

## Common Errors & Fixes:

### Error: "Failed to fetch" or "Network error"

**Fix 1:** Check if backend URL is correct
- Go to your Render backend URL directly
- It should show something (not blank page)

**Fix 2:** Check CORS in backend
Your backend should allow your Vercel URL. 

Open `backend/server.js` and check this part:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    'https://smart-campus-placehub.vercel.app'  // ← Make sure this is here!
  ],
  credentials: true
}));
```

If it's not there, add it and redeploy backend!

---

### Error: "MongoDB connection failed"

Your backend needs a cloud MongoDB (not localhost).

**Fix:** Use MongoDB Atlas (Free)

1. Go to: **https://www.mongodb.com/cloud/atlas**
2. Create free account
3. Create free cluster
4. Get connection string
5. Add to Render environment variables:
   ```
   MONGODB_URI = your-atlas-connection-string
   ```
6. Redeploy backend in Render

---

### Error: "VITE_API_URL is not defined"

Vercel didn't load the environment variable.

**Fix:**
1. Make sure you selected ALL environments when adding variable
2. Redeploy (it won't work without redeploying!)

---

## Quick Check: Is Everything Set Up?

✅ Backend deployed on Render
✅ Backend URL added to Vercel (`VITE_API_URL`)
✅ Vercel redeployed after adding variable
✅ Backend CORS allows Vercel URL
✅ MongoDB is cloud-based (Atlas) not localhost

---

## Still Not Working?

Send me a screenshot of:
1. The error message in browser (Press F12 → Console tab)
2. Your Vercel environment variables page
3. Your Render backend logs

I'll fix it immediately! 🚀
