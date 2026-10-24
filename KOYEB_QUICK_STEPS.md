# ⚡ Koyeb - Super Quick Steps (Tamil)

## 🎯 20 Nimisham la Deploy Pannalam! (20 Minutes!)

---

## ✅ Step 1: Sign Up (3 min)
```
1. Open: https://app.koyeb.com/auth/signup
2. Click "Continue with GitHub"
3. Click "Authorize Koyeb"
4. DONE! ✅
```

---

## ✅ Step 2: Create Service (2 min)
```
1. Click "Create Web Service"
2. Click "GitHub"
3. Connect GitHub account
4. Select repo: "smart-campus-pathways-main"
5. Select branch: "main"
```

---

## ✅ Step 3: Configure (5 min)
```
Service name: smart-campus-backend
Region: Frankfurt (fra)
Instance: Free

Build command:
cd backend && npm install

Run command:
cd backend && npm start

Port: 8000
```

---

## ✅ Step 4: Environment Variables (5 min)

### Add these 4 variables:

```bash
1. NODE_ENV=production

2. PORT=8000

3. JWT_SECRET=koyeb-smart-campus-2024-secret-key

4. MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
   (Use your actual MongoDB Atlas connection string!)
```

### ⚠️ MongoDB Connection String:
- Go to: https://cloud.mongodb.com
- Click Cluster → Connect → Connect your application
- Copy the string
- Paste in MONGODB_URI

---

## ✅ Step 5: Deploy! (2 min)
```
1. Review all settings
2. Click "Deploy" button
3. Wait 2-5 minutes
4. Status shows "Healthy" → SUCCESS! ✅
```

---

## ✅ Step 6: Get URL (1 min)
```
Your backend URL:
https://smart-campus-backend-xxxxx.koyeb.app

Test it:
https://your-url.koyeb.app/api/health

Should see:
{"status":"ok","database":"connected"}
```

---

## ✅ Step 7: Update Frontend (3 min)

### Local `.env` file:
```bash
VITE_API_URL=https://your-koyeb-url.koyeb.app/api
```

### Vercel (if deployed):
```
1. Go to Vercel dashboard
2. Settings → Environment Variables
3. Edit VITE_API_URL
4. Set to: https://your-koyeb-url.koyeb.app/api
5. Save → Auto redeploys
```

---

## ✅ Step 8: Test! (2 min)
```
1. Open frontend
2. Try login
3. Check dashboard
4. All working? ✅ DONE!
```

---

## 🐛 Common Issues

### Build Failed?
```
Fix: Check build command is exactly:
cd backend && npm install
```

### MongoDB Connection Failed?
```
Fix:
1. Go to MongoDB Atlas
2. Network Access
3. Add IP: 0.0.0.0/0 (allow all)
```

### Frontend Can't Connect?
```
Fix:
1. Check VITE_API_URL in .env
2. Must end with /api
3. Hard refresh: Ctrl+Shift+R
```

---

## 📱 Quick Links

### Koyeb Signup:
```
https://app.koyeb.com/auth/signup
```

### MongoDB Atlas:
```
https://cloud.mongodb.com
```

### After Deploy:
```
Your backend: https://your-service.koyeb.app
Health check: https://your-service.koyeb.app/api/health
```

---

## ✅ Environment Variables (Copy-Paste Ready)

```
NODE_ENV=production
PORT=8000
JWT_SECRET=koyeb-smart-campus-2024-secret-key
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/YOUR_DB_NAME
```

⚠️ **Replace the MONGODB_URI with your actual values!**

---

## 🎯 Total Time: ~20 Minutes

```
Sign up:         3 min
Create service:  2 min
Configure:       5 min
Env variables:   5 min
Deploy:          2 min
Get URL:         1 min
Update frontend: 3 min
Test:            2 min
─────────────────────────
TOTAL:          23 min ✅
```

---

## 💪 Remember:

1. ✅ Follow steps exactly
2. ✅ Don't skip env variables
3. ✅ MongoDB URI must be correct
4. ✅ Wait for "Healthy" status
5. ✅ Test `/api/health` first

---

## 🆘 Help?

Tell me:
- Which step?
- What error?
- Screenshot?

**I'm here! 💪**

---

## 🎉 Success = Production Backend!

```
✅ Always-on (NO cold start!)
✅ Fast response
✅ Free forever
✅ Auto-deploy on git push
✅ Professional setup
✅ MongoDB connected
```

**Podu da! Mudiyum! 🚀💯**

---

**Keep this open while deploying!**
**Refer to KOYEB_STEP_BY_STEP.md for detailed guide!**
