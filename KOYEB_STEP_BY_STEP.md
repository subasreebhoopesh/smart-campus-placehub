# 🚀 Koyeb Deployment - Step by Step (Tamil + English)

## ✅ Ready? Let's Deploy! (Podu da!)

---

## 📱 STEP 1: Sign Up on Koyeb (3 minutes)

### **What to do:**

1. **Open this link in new tab:**
   ```
   https://app.koyeb.com/auth/signup
   ```

2. **Choose ONE option:**

   **Option A: GitHub (EASIEST! - Recommended!)**
   - Click **"Continue with GitHub"** button
   - GitHub page will open
   - Click **"Authorize Koyeb"**
   - Done! ✅
   
   **Option B: Email signup**
   - Enter your email
   - Create password
   - Click "Sign up"
   - Check email for verification
   - Click verification link
   - Done! ✅

3. **After signup:**
   - You'll see Koyeb dashboard
   - Should see "Create your first service" or similar

---

## 📱 STEP 2: Create New Service (2 minutes)

### **What to do:**

1. **On Koyeb dashboard:**
   - Look for **"Create Web Service"** button (big blue button)
   - Click it!

2. **Choose deployment source:**
   - You'll see options: GitHub, GitLab, Docker, etc.
   - Click **"GitHub"**

3. **Connect GitHub:**
   - Click **"Connect GitHub account"**
   - GitHub authorization page will open
   - Click **"Authorize Koyeb"**
   - It will ask which repos to give access
   - Select: **"All repositories"** (easier!) or select specific repo
   - Click **"Install"**

4. **Select your repository:**
   - You'll see list of your repos
   - Find: **"smart-campus-pathways-main"**
   - Click **"Select"** next to it

5. **Select branch:**
   - Choose **"main"** or **"master"** (whichever you have)

---

## 📱 STEP 3: Configure Service (5 minutes)

### **Basic Settings:**

1. **Service name:**
   ```
   smart-campus-backend
   ```
   (You can choose any name, but keep it simple!)

2. **Region:**
   - Choose closest to India:
   - **Frankfurt (fra)** ✅ (Best for India!)
   - or **Singapore (sin)** ✅ (Also good!)

3. **Instance type:**
   - Select: **"Free"** (Eco/Nano)
   - Should show: "Free" or "$0.00/month"

### **Build Configuration:**

4. **Builder:**
   - Select: **"Buildpack"** (should be default)

5. **Build command:**
   ```bash
   cd backend && npm install
   ```
   ⚠️ **Important:** Type this EXACTLY!

6. **Run command:**
   ```bash
   cd backend && npm start
   ```
   ⚠️ **Important:** Type this EXACTLY!

7. **Port:**
   - Should auto-detect as **8000**
   - If not, enter: **8000**

8. **Root directory:**
   - Leave as **/** (root)
   - Don't change this!

---

## 📱 STEP 4: Environment Variables (5 minutes)

### **This is VERY IMPORTANT!**

Look for **"Environment Variables"** section (might need to scroll down)

Click **"Add Environment Variable"** button **FOUR times** and add these:

### **Variable 1: NODE_ENV**
```
Key:   NODE_ENV
Value: production
```

### **Variable 2: PORT**
```
Key:   PORT
Value: 8000
```

### **Variable 3: JWT_SECRET**
```
Key:   JWT_SECRET
Value: koyeb-smart-campus-2024-secret-key-change-this-later
```
(You can use any random string here - just keep it secret!)

### **Variable 4: MONGODB_URI**
```
Key:   MONGODB_URI
Value: YOUR_MONGODB_CONNECTION_STRING
```

**⚠️ IMPORTANT:** Replace `YOUR_MONGODB_CONNECTION_STRING` with your actual MongoDB Atlas connection string!

**Where to find MongoDB connection string?**
1. Go to: https://cloud.mongodb.com/
2. Click on your cluster → "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Format should be:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/dbname
   ```

### **Optional Variable 5: FRONTEND_URL (Recommended)**
```
Key:   FRONTEND_URL
Value: https://smart-campus-placehub.vercel.app
```
(Use your Vercel frontend URL if you have it deployed)

---

## 📱 STEP 5: Deploy! (2 minutes)

### **Final steps:**

1. **Review all settings:**
   - ✅ Service name: smart-campus-backend
   - ✅ Region: Frankfurt/Singapore
   - ✅ Build command: cd backend && npm install
   - ✅ Run command: cd backend && npm start
   - ✅ Port: 8000
   - ✅ Environment variables: 4-5 variables added

2. **Click the big "Deploy" button at bottom!**

3. **Wait for deployment:**
   - Status will show: "Building..."
   - You'll see build logs (real-time!)
   - Wait 2-5 minutes
   - Status will change to: "Deploying..."
   - Then finally: **"Healthy"** ✅

4. **If you see "Healthy" status → SUCCESS!** 🎉

---

## 📱 STEP 6: Get Your Backend URL (1 minute)

### **After deployment succeeds:**

1. **Your service URL will be shown at the top:**
   ```
   https://smart-campus-backend-YOUR-ID.koyeb.app
   ```
   (YOUR-ID will be some random string Koyeb generates)

2. **Copy this URL!** You'll need it for frontend!

3. **Test it immediately:**
   - Open new tab
   - Go to: `https://your-service-url.koyeb.app/api/health`
   - You should see:
     ```json
     {
       "status": "ok",
       "database": "connected"
     }
     ```

4. **If you see this → PERFECT!** ✅

---

## 📱 STEP 7: Update Frontend (3 minutes)

### **Now connect frontend to backend:**

1. **Open your project folder**

2. **Edit `.env` file in root:**
   ```bash
   # OLD (comment out):
   # VITE_API_URL=http://localhost:3001/api

   # NEW (add this):
   VITE_API_URL=https://your-service-name.koyeb.app/api
   ```

   ⚠️ **Replace `your-service-name.koyeb.app` with YOUR actual Koyeb URL!**

3. **Save the file**

4. **If running locally, restart frontend:**
   ```bash
   npm run dev
   ```

5. **If deployed on Vercel:**
   - Go to Vercel dashboard
   - Find your project
   - Settings → Environment Variables
   - Edit `VITE_API_URL` 
   - Change to: `https://your-koyeb-url.koyeb.app/api`
   - Save
   - Redeploy (Vercel will auto-deploy)

---

## ✅ STEP 8: Test Everything! (2 minutes)

### **Test these endpoints:**

1. **Health Check:**
   ```
   https://your-service.koyeb.app/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Try login from frontend:**
   - Open your frontend
   - Try to login
   - Should work! ✅

3. **Check all features:**
   - Login works ✅
   - Dashboard loads ✅
   - Data shows ✅
   - No errors in console ✅

---

## 🎉 SUCCESS! You're Done!

### **What you achieved:**

- ✅ Backend deployed on Koyeb
- ✅ Always-on (NO cold start!)
- ✅ MongoDB connected
- ✅ APIs working
- ✅ Frontend connected
- ✅ Professional deployment
- ✅ Free tier!

**Time taken:** ~20 minutes
**Cost:** $0 (Free forever!)

---

## 🐛 Troubleshooting

### **Build Failed?**

**Error: "Cannot find module"**
- Fix: Check build command is exactly: `cd backend && npm install`

**Error: "npm not found"**
- This shouldn't happen (Koyeb has npm by default)
- Try: Change builder to "Dockerfile" and create Dockerfile

### **Deployment Succeeded But Not Working?**

**1. Check environment variables:**
- Go to Koyeb dashboard
- Click your service
- Go to "Environment" tab
- Make sure all 4 variables are there

**2. Check logs:**
- Click "Logs" tab in Koyeb
- Look for errors
- Common errors:
  - MongoDB connection failed → Check MONGODB_URI
  - Port already in use → Should use PORT=8000

**3. MongoDB connection failed?**

Go to MongoDB Atlas:
- Network Access
- Click "Add IP Address"
- Click "Allow Access from Anywhere"
- Add IP: `0.0.0.0/0`
- Save

### **Frontend Can't Connect?**

**1. Check CORS:**
Your backend already has CORS setup for Vercel!

**2. Check frontend .env:**
Make sure `VITE_API_URL` is correct!

**3. Clear browser cache:**
- Press Ctrl+Shift+R (hard refresh)
- Or clear cache in browser settings

---

## 📊 Koyeb Dashboard Features

### **Useful tabs:**

1. **Overview:**
   - See service status
   - See URL
   - See region

2. **Deployments:**
   - See deployment history
   - See build logs
   - Rollback if needed

3. **Logs:**
   - Real-time logs
   - Very useful for debugging!

4. **Settings:**
   - Change instance size
   - Update environment variables
   - Change region

5. **Environment:**
   - View/edit environment variables

---

## 💰 Free Tier Details

### **What you get FREE:**

- ✅ 1 Web Service
- ✅ Shared CPU & RAM (512 MB)
- ✅ Always-on (NO SLEEP!)
- ✅ Automatic HTTPS
- ✅ Custom domain support
- ✅ Unlimited bandwidth (fair use)
- ✅ No credit card required

### **Limits:**

- Max 1 service on free tier
- Shared resources (slower than paid)
- But for your project: **PERFECT!** ✅

---

## 🔄 How to Update/Redeploy

### **When you make code changes:**

1. **Push changes to GitHub:**
   ```bash
   git add .
   git commit -m "Update backend"
   git push
   ```

2. **Koyeb auto-deploys!**
   - Koyeb watches your repo
   - Automatically rebuilds & redeploys
   - You don't need to do anything!

3. **Check deployment:**
   - Go to Koyeb dashboard
   - See new deployment in progress
   - Wait for "Healthy" status

---

## 🆘 Need Help?

### **If stuck, check:**

1. ✅ Build command correct? `cd backend && npm install`
2. ✅ Run command correct? `cd backend && npm start`
3. ✅ All environment variables added?
4. ✅ MongoDB IP whitelist includes `0.0.0.0/0`?
5. ✅ Port is 8000?

### **Still stuck?**

Tell me:
- What step you're on
- What error you see
- Screenshot if possible

**I'll help immediately!** 💪

---

## 📝 Quick Reference Card

### **Koyeb URL Format:**
```
https://SERVICE-NAME-xxxxx.koyeb.app
```

### **Your API Endpoints:**
```
https://your-service.koyeb.app/api/health
https://your-service.koyeb.app/api/auth/login
https://your-service.koyeb.app/api/students
... etc
```

### **Environment Variables Needed:**
1. NODE_ENV=production
2. PORT=8000
3. JWT_SECRET=your-secret-key
4. MONGODB_URI=mongodb+srv://...
5. FRONTEND_URL=https://your-vercel-url (optional)

---

## 🌟 Advantages of Koyeb

### **Why Koyeb is PERFECT for you:**

1. ✅ **NO COLD START!**
   - Always fast response
   - No 30-60s delay
   - Professional user experience

2. ✅ **Easy Setup**
   - 20 minutes total
   - No complex configuration
   - Works with existing code

3. ✅ **Auto-Deploy**
   - Push to GitHub → Auto deploy
   - No manual steps
   - Always up-to-date

4. ✅ **Good Logs**
   - Real-time logs
   - Easy debugging
   - See all errors

5. ✅ **Free Forever**
   - No trial period
   - No credit card
   - Good enough for production

---

## 🎯 Final Checklist

Before you say "DONE!":

- [ ] Backend deployed on Koyeb
- [ ] Status shows "Healthy"
- [ ] `/api/health` returns OK
- [ ] MongoDB connected
- [ ] Frontend `.env` updated with Koyeb URL
- [ ] Vercel env updated (if deployed)
- [ ] Login works from frontend
- [ ] Dashboard loads
- [ ] No errors in browser console
- [ ] No cold start delay! ⚡

---

## 💪 You Got This!

**Remember:**
- ✅ Follow steps EXACTLY
- ✅ Don't skip environment variables
- ✅ Test after each step
- ✅ Ask if stuck!

**Deployment is NOT hard!**
**You've built this amazing project!**
**Deploying is the EASY part!**

**Podu da! Namba mudiyum! 🚀💯**

---

*Keep this guide open while deploying!*

**Good luck! Vetri Nichayam! 🎉**
