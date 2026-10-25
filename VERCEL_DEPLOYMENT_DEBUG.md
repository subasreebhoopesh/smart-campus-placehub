# Vercel Deployment Debug Guide

## Current Status

The frontend is deployed on Vercel but experiencing "Network error" during login. This is likely because the environment variable hasn't been properly applied.

## Debugging Steps

### 1. Check Console Logs
1. Open https://smart-campus-placehub.vercel.app/admin/login
2. Open browser Developer Tools (F12)
3. Go to Console tab
4. Look for logs starting with 🌐 or 🔧
5. These will show:
   - Production API URL being used
   - VITE_API_URL environment variable value
   - Build mode

**Expected output:**
```
🌐 Production API URL: https://smart-campus-placehub.onrender.com/api
🔧 Environment Variables: { VITE_API_URL: "https://smart-campus-placehub.onrender.com/api", MODE: "production", PROD: true }
```

**If you see localhost instead:**
```
🌐 Production API URL: http://localhost:3001/api
```
This means the environment variable wasn't applied during build.

### 2. Force Vercel Redeploy

If the environment variable is still showing `localhost`, the deployment needs to be rebuilt:

**Option A: Via Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Find your project: smart-campus-placehub
3. Go to "Deployments" tab
4. Click on the latest deployment
5. Click "..." menu → "Redeploy"
6. ✅ Check "Use existing Build Cache" = OFF
7. Click "Redeploy"

**Option B: Via Git Push (Already done)**
We've pushed 4 commits to trigger redeployment:
- ✅ Commit d444fae: CORS fix
- ✅ Commit 653aaf7: First redeploy trigger
- ✅ Commit 3dd213b: Production env config
- ✅ Commit 3588139: Production documentation
- ✅ Commit (new): Debug logging added

### 3. Verify Environment Variable in Vercel

1. Go to Vercel Dashboard → Project Settings
2. Go to "Environment Variables" section
3. Confirm:
   - Key: `VITE_API_URL`
   - Value: `https://smart-campus-placehub.onrender.com/api`
   - Environment: ✅ Production ✅ Preview ✅ Development

### 4. Check Deployment Logs

1. In Vercel Dashboard → Deployments
2. Click on the latest deployment
3. Look for "Build Logs"
4. Search for "VITE_API_URL" in the logs
5. It should show during the build process

## Known Issues

### Environment Variable Not Applied
**Symptom:** Console shows `localhost:3001` instead of Render URL

**Causes:**
1. Environment variable wasn't set before deployment
2. Build cache is being used from old deployment
3. Variable was set but deployment wasn't triggered

**Solution:**
- Set environment variable in Vercel
- Force redeploy WITHOUT build cache
- Push new git commit to trigger fresh build

### CORS Error After Login
**Symptom:** "CORS policy" error in console

**Status:** ✅ Already fixed in backend
- Backend now allows all origins with `origin: true`
- This is temporary for testing; should be restricted to Vercel URL in production

## Test Credentials

Once deployment is working, test with:

**Admin:**
- Email: admin@college.edu
- Password: admin123

**Student:**
- Email: raj@example.com
- Password: password123

**HR:**
- Email: hr@techcorp.com
- Password: password123

## Production URLs

- **Frontend:** https://smart-campus-placehub.vercel.app
- **Backend:** https://smart-campus-placehub.onrender.com
- **Backend API:** https://smart-campus-placehub.onrender.com/api
- **Health Check:** https://smart-campus-placehub.onrender.com/api/health

## Next Steps

1. ✅ Added debug logging to console
2. ⏳ Push commit to trigger redeploy
3. ⏳ Wait for Vercel build (1-2 minutes)
4. ⏳ Check console logs
5. ⏳ Test login
6. If still failing → Manual redeploy from Vercel Dashboard

---

**Created:** After 3 previous deployment attempts
**Reason:** Need to verify environment variable is being applied correctly
