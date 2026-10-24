# 🚀 Railway Backend Deployment Guide (Tamil + English)

## **Step 1: Railway Account Setup** 

### **1.1 Create Railway Account**
1. **Railway.app** க்கு போ: https://railway.app
2. **"Start a New Project"** click பண்ணு
3. **GitHub-ல login** பண்ணு (free tier போதும்!)
4. Railway உன் GitHub account-க்கு access கேக்கும் - **Allow** பண்ணு

---

## **Step 2: GitHub Repository-ஐ Railway-ல Connect பண்ணுறது**

### **2.1 New Project Create**
```
1. Railway Dashboard-ல "New Project" click பண்ணு
2. "Deploy from GitHub repo" select பண்ணு
3. உன் repository search பண்ணு: "smart-campus-pathways-main"
4. Repository select பண்ணு
```

### **2.2 Root Directory Configure** (IMPORTANT!)
```
Railway automatically backend folder-ஐ detect பண்ணும்
```

---

## **Step 3: Environment Variables Add பண்ணுறது**

Railway Dashboard-ல **Variables** tab-க்கு போ. இந்த variables add பண்ணு:

### **Required Variables:**

#### **1. MONGODB_URI**
```
mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/placement_portal?retryWrites=true&w=majority
```
**Where to get?**
- MongoDB Atlas Dashboard → Connect → Get connection string
- Replace `<username>`, `<password>`, and database name

#### **2. JWT_SECRET**
```
your-super-secret-random-string-change-this
```
**Example:**
```
smartCampus2024SecretKey!@#RandomString
```

#### **3. PORT**
```
3001
```

#### **4. NODE_ENV**
```
production
```

#### **5. FRONTEND_URL**
```
https://smart-campus-placehub.vercel.app
```

---

## **Step 4: Deploy பண்ணுறது** 🎯

### **4.1 Automatic Deployment**
```
✅ Railway automatically detect பண்ணி deploy ஆரம்பிக்கும்
✅ Build logs-ல progress பார்க்கலாம்
✅ 2-5 minutes-ல deployment complete ஆகும்
```

### **4.2 Check Deployment Status**
```
Railway Dashboard → Deployments → Latest deployment
```

**Success indicators:**
- ✅ Status: "Success" or "Active"
- ✅ Green checkmark
- ✅ Backend URL available

---

## **Step 5: Backend URL எடுக்கறது**

### **5.1 Get Your Railway Backend URL**
```
1. Railway Dashboard → Your Project
2. Settings → Domains
3. "Generate Domain" click பண்ணு
4. URL கிடைக்கும்: https://your-project-name.up.railway.app
```

**Example URL:**
```
https://smart-campus-backend-production.up.railway.app
```

---

## **Step 6: Test Backend Connection**

### **6.1 Test Health Endpoint**
Browser-ல இந்த URL open பண்ணு:
```
https://your-railway-url.up.railway.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

### **6.2 Test Stats Endpoint**
```
https://your-railway-url.up.railway.app/api/public/stats
```

**Expected Response:**
```json
{
  "totalStudents": 10,
  "totalCompanies": 10,
  "placedStudents": 5,
  "highestPackage": 45,
  "activeDrives": 3
}
```

---

## **Step 7: Vercel Frontend-ஐ Update பண்ணுறது**

### **7.1 Vercel Dashboard-க்கு போ**
```
https://vercel.com/dashboard
→ Your Project: smart-campus-placehub
→ Settings → Environment Variables
```

### **7.2 Update VITE_API_URL**
```
Variable Name: VITE_API_URL
Value: https://your-railway-url.up.railway.app/api
```

**Example:**
```
VITE_API_URL=https://smart-campus-backend-production.up.railway.app/api
```

### **7.3 Redeploy Frontend**
```
Vercel → Deployments → Redeploy latest
(or just push to GitHub - auto deploys)
```

---

## **Step 8: Final Testing** ✅

### **8.1 Open Your Live Application**
```
https://smart-campus-placehub.vercel.app
```

### **8.2 Test Complete Flow**
```
1. ✅ Login: admin@college.edu / admin123
2. ✅ Dashboard data loads
3. ✅ Create placement drive
4. ✅ View students, companies
5. ✅ All features working
```

---

## **🎉 Deployment Complete Architecture**

```
┌──────────────────────────────────┐
│  👥 Users                        │
└────────────┬─────────────────────┘
             │
             ↓
┌──────────────────────────────────┐
│  🌐 Vercel Frontend              │
│  smart-campus-placehub           │
│  .vercel.app                     │
└────────────┬─────────────────────┘
             │
             │ VITE_API_URL
             ↓
┌──────────────────────────────────┐
│  🚀 Railway Backend              │
│  your-project-name               │
│  .up.railway.app                 │
│  - Node.js + Express             │
│  - All API Routes                │
└────────────┬─────────────────────┘
             │
             │ MONGODB_URI
             ↓
┌──────────────────────────────────┐
│  🍃 MongoDB Atlas                │
│  Cluster: placement_portal       │
│  - All Collections               │
│  - Real-time Data                │
└──────────────────────────────────┘
```

---

## **Railway Free Tier Limits** 📊

```
✅ 500 hours/month (enough for 24/7!)
✅ $5 free credits/month
✅ Automatic HTTPS
✅ Custom domains supported
✅ Auto-deploy on git push
```

---

## **Common Issues & Fixes** 🔧

### **Issue 1: Build Failed**
```
Solution: Check package.json in backend folder
Railway build command: cd backend && npm install
```

### **Issue 2: Database Connection Error**
```
Solution: Verify MONGODB_URI in Railway variables
- Check username/password
- MongoDB Atlas → Network Access → Allow all IPs (0.0.0.0/0)
```

### **Issue 3: CORS Error**
```
Solution: Add FRONTEND_URL in Railway variables
Value: https://smart-campus-placehub.vercel.app
```

### **Issue 4: Port Issues**
```
Solution: Railway automatically assigns PORT
Your code already handles: process.env.PORT || 3001
```

---

## **Monitoring & Logs** 📊

### **View Logs:**
```
Railway Dashboard → Your Project → Deployments → View Logs
```

### **Restart Service:**
```
Railway Dashboard → Settings → Restart
```

---

## **Next Steps After Deployment** 🎯

1. ✅ Test all admin features
2. ✅ Test student registration & login
3. ✅ Test placement drive creation
4. ✅ Test application process
5. ✅ Share URL with users!

---

## **Need Help?** 💬

### **Quick Commands to Test:**

**Test Backend:**
```bash
curl https://your-railway-url.up.railway.app/api/health
```

**Test with Frontend:**
1. Open Vercel URL
2. F12 → Console
3. Check API calls
4. All should point to Railway URL

---

## **Pro Tips** 💡

1. **Custom Domain:** Railway allows custom domains (optional)
2. **Auto Deploy:** Push to GitHub = Auto deploy both frontend & backend
3. **Environment Sync:** Keep `.env.example` updated for team
4. **Monitoring:** Use Railway metrics to track usage

---

## **Summary Checklist** ✅

- [ ] Railway account created
- [ ] GitHub repo connected
- [ ] Environment variables added
- [ ] Backend deployed successfully
- [ ] Backend URL obtained
- [ ] Vercel updated with backend URL
- [ ] Frontend redeployed
- [ ] Health check passed
- [ ] Complete flow tested
- [ ] All features working

---

**🎉 Congratulations! Your project is now LIVE!** 🚀

Frontend: https://smart-campus-placehub.vercel.app
Backend: https://your-railway-url.up.railway.app

**Share இந்த URLs-ஐ உன் friends/college-க்கு!** 🎓✨
