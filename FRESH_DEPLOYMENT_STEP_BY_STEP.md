# 🚀 FRESH DEPLOYMENT - COMPLETE STEP-BY-STEP GUIDE

## முதல்ல இதை புரிஞ்சுக்கோ (Overview):

**எல்லாத்தையும் delete பண்ணி new-ஆ deploy பண்றோம்!**

நாம் deploy பண்ண வேண்டியது:
1. **Backend** → Render (Free)
2. **Frontend** → Vercel (Free)
3. **Database** → MongoDB Atlas (Already have!)

---

# PART 1: DELETE OLD DEPLOYMENTS (Clean Start)

## Step 1.1: Delete Old Render Backend

1. Go to: **https://dashboard.render.com**
2. Click on **"smart-campus-placehub"** service
3. Scroll down → Click **"Settings"** (left sidebar, bottom)
4. Scroll to very bottom
5. Find **"Delete Web Service"** (red button)
6. Click it
7. Type the service name to confirm: `smart-campus-placehub`
8. Click **"Delete"**

✅ Backend deleted!

---

## Step 1.2: Delete Old Vercel Frontend

1. Go to: **https://vercel.com/dashboard**
2. Find **"smart-campus-placehub"** project
3. Click on it
4. Go to **"Settings"** tab (top right)
5. Scroll to very bottom
6. Find **"Delete Project"** section (red area)
7. Click **"Delete"**
8. Type project name to confirm: `smart-campus-placehub`
9. Click **"Delete"**

✅ Frontend deleted!

---

# PART 2: DEPLOY BACKEND (Render)

## Step 2.1: Create New Backend Service

1. Go to: **https://dashboard.render.com**
2. Click **"New +"** button (top right)
3. Select **"Web Service"**

### Step 2.2: Connect GitHub Repository

1. If already connected:
   - Click **"Connect a repository"**
   - Select your repo from list
   
2. If NOT connected:
   - Click **"Connect GitHub"**
   - Authorize Render
   - Select your repository

**Repository to select:**
- நீ எந்த repo-வில் code இருக்குனு சொல்லு! (Usually: `smart-campus-pathways` or similar)

### Step 2.3: Configure Backend Settings

**Fill these EXACTLY:**

```
Name: smart-campus-backend-new
Region: Oregon (US West)
Branch: main
Root Directory: smart-campus-pathways-main/backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

**IMPORTANT:** 
- Root Directory must be: `smart-campus-pathways-main/backend`
- நீ check பண்ணு உன் folder structure correct-ஆ இருக்கா!

### Step 2.4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these **5 variables**:

```
1. Name: MONGODB_URI
   Value: mongodb+srv://subasreebhoopesh:YPRAFyXgF1ORHfVl@cluster0.vgd6g.mongodb.net/placement_portal?retryWrites=true&w=majority&appName=Cluster0

2. Name: PORT
   Value: 5000

3. Name: JWT_SECRET
   Value: your-super-secret-jwt-key-2024

4. Name: NODE_ENV
   Value: production

5. Name: FRONTEND_URL
   Value: https://your-vercel-url.vercel.app
   (We'll update this later after Vercel deploy!)
```

**For now, put temporary FRONTEND_URL:**
```
FRONTEND_URL = http://localhost:5173
```

We'll change it later!

### Step 2.5: Deploy Backend

1. Click **"Create Web Service"** (bottom)
2. **Wait 3-5 minutes** (deployment takes time!)
3. Watch logs - should see:
   ```
   ✅ Build successful
   🚀 Server running on port 5000
   💾 Using MongoDB database
   ```

### Step 2.6: Get Backend URL

After deployment success:
1. Look at top of page
2. You'll see: **`https://smart-campus-backend-new.onrender.com`**
3. **COPY THIS URL** - we need it for frontend!

### Step 2.7: Test Backend

Open browser, go to:
```
https://smart-campus-backend-new.onrender.com/api/health
```

Should show:
```json
{"status":"ok","database":"connected"}
```

If shows error, wait 1 minute (backend waking up) then try again!

✅ Backend Done!

---

# PART 3: DEPLOY FRONTEND (Vercel)

## Step 3.1: Create New Frontend Project

1. Go to: **https://vercel.com/new**
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository

### Step 3.2: Configure Frontend Settings

**Fill these:**

```
Project Name: smart-campus-frontend-new
Framework Preset: Vite
Root Directory: smart-campus-pathways-main
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**IMPORTANT:**
- Root Directory: `smart-campus-pathways-main` (NOT backend!)
- This is where `package.json` is with Vite config!

### Step 3.3: Add Environment Variable

Click **"Environment Variables"**

Add **ONE variable**:

```
Name: VITE_API_URL
Value: https://smart-campus-backend-new.onrender.com
```

**Replace with YOUR actual backend URL from Step 2.6!**

**DO NOT add `/api` at the end!**

❌ Wrong: `https://smart-campus-backend-new.onrender.com/api`  
✅ Right: `https://smart-campus-backend-new.onrender.com`

### Step 3.4: Deploy Frontend

1. Click **"Deploy"** button
2. **Wait 2-3 minutes**
3. Watch deployment logs
4. Should see:
   ```
   ✅ Build successful
   ✅ Deployment ready
   ```

### Step 3.5: Get Frontend URL

After deployment success:
1. You'll see: **`https://smart-campus-frontend-new.vercel.app`**
2. **COPY THIS URL**
3. Click **"Visit"** to open your website!

✅ Frontend Done!

---

# PART 4: FINAL CONFIGURATION

## Step 4.1: Update Backend FRONTEND_URL

Now we need to tell backend about frontend URL!

1. Go back to **Render Dashboard**
2. Click your backend service: **smart-campus-backend-new**
3. Go to **"Environment"** (left sidebar)
4. Find `FRONTEND_URL` variable
5. Click **"Edit"**
6. Change value to:
   ```
   https://smart-campus-frontend-new.vercel.app
   ```
   (Your actual Vercel URL!)
7. Click **"Save Changes"**
8. Render will **auto-redeploy** backend (wait 2 minutes)

✅ CORS configured!

---

# PART 5: TEST YOUR DEPLOYMENT

## Step 5.1: Test Backend Health

Open: `https://smart-campus-backend-new.onrender.com/api/health`

Expected: `{"status":"ok","database":"connected"}`

## Step 5.2: Test Frontend Website

Open: `https://smart-campus-frontend-new.vercel.app`

Should see: Login page!

## Step 5.3: Test Login

Try login with:

**Admin:**
```
Email: admin@college.edu
Password: admin123
```

**Student:**
```
Email: subasree@gmail.com
Password: suba123
```

If login works → **🎉 SUCCESS! Deployment complete!**

---

# TROUBLESHOOTING

## Problem 1: Backend shows "Cannot GET /health"

**Fix:** Use `/api/health` not `/health`
```
Correct: https://your-backend.onrender.com/api/health
```

## Problem 2: Login fails with "Failed to fetch"

**Causes:**
1. Backend sleeping (wait 1 minute, try again)
2. Wrong `VITE_API_URL` in Vercel
3. Wrong `FRONTEND_URL` in Render

**Fix:**
1. Check backend health first
2. Verify environment variables
3. Redeploy if needed

## Problem 3: CORS Error

**Fix:** Make sure `FRONTEND_URL` in Render matches your Vercel URL EXACTLY!

```
Render FRONTEND_URL: https://smart-campus-frontend-new.vercel.app
Vercel actual URL: https://smart-campus-frontend-new.vercel.app
```

Must be SAME!

---

# SUMMARY OF URLS

After deployment, you'll have:

**Backend:**
- URL: `https://smart-campus-backend-new.onrender.com`
- Health: `https://smart-campus-backend-new.onrender.com/api/health`

**Frontend:**
- URL: `https://smart-campus-frontend-new.vercel.app`
- Login: `https://smart-campus-frontend-new.vercel.app`

**Database:**
- MongoDB Atlas (already configured)

---

# NEXT STEPS AFTER SUCCESS

1. Test all features:
   - Admin login & dashboard
   - Student login & applications
   - HR login & candidate view
   - Company management

2. Share your URLs with users!

3. Monitor:
   - Render dashboard for backend logs
   - Vercel dashboard for frontend analytics

---

# நீ இப்ப என்ன செய்யனும்:

1. **First:** Delete old deployments (Part 1)
2. **Then:** Deploy backend (Part 2)
3. **Then:** Deploy frontend (Part 3)
4. **Finally:** Update FRONTEND_URL (Part 4)
5. **Test:** Login and verify (Part 5)

---

# இந்த Guide-ஐ Follow பண்ணு:

1. ஒவ்வொரு step-ஐ carefully read பண்ணு
2. Screenshots எடுத்து வச்சுக்கோ (if needed)
3. URL-கள copy பண்ணி safe-ஆ save பண்ணு
4. Any doubt-னா screenshot share பண்ணு!

**Ready-யா? Let's start! 🚀**

Type **"started"** when you begin!
Type **"step X done"** after each part!
Type **"help"** if stuck anywhere!
