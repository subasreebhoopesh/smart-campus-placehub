# 🚀 Project Deployment Guide (Tamil + English)

## Project-a Epdi Deploy Panrathu? (How to Deploy the Project?)

Your project has 2 parts:
1. **Frontend** - React + Vite (Port 8080)
2. **Backend** - Node.js + Express + MongoDB (Port 3001)

---

## Option 1: Free Deployment (Recommended for Students)

### 🎯 Frontend Deployment - Vercel (Free)

**Step 1: Build the Frontend**
```bash
cd smart-campus-pathways-main
npm run build
```

**Step 2: Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: Vite
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variable:
   - Name: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com/api` (add after backend deployment)
7. Click "Deploy"

**Your frontend will be live at:** `https://your-project.vercel.app`

---

### 🎯 Backend Deployment - Render (Free)

**Step 1: Prepare Backend**

Create `smart-campus-pathways-main/backend/package.json` and add start script:
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

**Step 2: Deploy to Render**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Name: `placehub-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
6. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Any random string (e.g., `mySecretKey123`)
   - `PORT`: `3001`
7. Click "Create Web Service"

**Your backend will be live at:** `https://placehub-backend.onrender.com`

---

### 🎯 Database - MongoDB Atlas (Free)

**Step 1: Create MongoDB Database**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free
3. Create a new cluster (Free tier - M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/placement_portal
   ```
6. Replace `<password>` with your actual password

**Step 2: Add Connection String to Render**
- Go back to Render backend settings
- Add environment variable:
  - Name: `MONGODB_URI`
  - Value: Your MongoDB connection string

---

## Option 2: Deploy on Your Own Server (VPS)

### Requirements:
- Ubuntu/Linux server
- Node.js installed
- MongoDB installed or MongoDB Atlas
- Domain name (optional)

### Steps:

**1. Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**2. Install MongoDB (or use MongoDB Atlas)**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**3. Clone Your Project**
```bash
git clone https://github.com/your-username/smart-campus-pathways.git
cd smart-campus-pathways
```

**4. Setup Backend**
```bash
cd backend
npm install

# Create .env file
nano .env
```

Add to .env:
```
MONGODB_URI=mongodb://localhost:27017/placement_portal
JWT_SECRET=yourSecretKey123
PORT=3001
```

**5. Setup Frontend**
```bash
cd ..
npm install
npm run build
```

**6. Install PM2 (Process Manager)**
```bash
sudo npm install -g pm2
```

**7. Start Backend**
```bash
cd backend
pm2 start server.js --name "placehub-backend"
pm2 save
pm2 startup
```

**8. Install Nginx (Web Server)**
```bash
sudo apt-get install -y nginx
```

**9. Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/placehub
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/smart-campus-pathways/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**10. Enable Site**
```bash
sudo ln -s /etc/nginx/sites-available/placehub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**11. Setup SSL (Optional but Recommended)**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Option 3: Deploy on Heroku (Paid)

### Frontend + Backend Together

**1. Create Heroku Account**
- Go to [heroku.com](https://heroku.com)
- Sign up

**2. Install Heroku CLI**
```bash
npm install -g heroku
heroku login
```

**3. Create Heroku App**
```bash
cd smart-campus-pathways-main
heroku create placehub-app
```

**4. Add MongoDB**
```bash
heroku addons:create mongolab:sandbox
```

**5. Configure Build**
Create `Procfile` in root:
```
web: cd backend && node server.js
```

**6. Deploy**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

---

## 📝 Important Notes

### Environment Variables to Set:

**Frontend (.env):**
```
VITE_API_URL=https://your-backend-url.com/api
```

**Backend (.env):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/placement_portal
JWT_SECRET=yourRandomSecretKey123
PORT=3001
NODE_ENV=production
```

### After Deployment:

1. **Create Admin User**
```bash
# SSH into your server or use Render shell
cd backend
node seed-admin.js
```

2. **Test Your Deployment**
- Frontend: `https://your-frontend-url.com`
- Backend: `https://your-backend-url.com/api/health`
- Login: admin@college.edu / admin123

---

## 🎯 Recommended Setup for Students (FREE):

1. **Frontend**: Vercel (Free, Fast, Easy)
2. **Backend**: Render (Free tier, 750 hours/month)
3. **Database**: MongoDB Atlas (Free tier, 512MB)

**Total Cost: ₹0 (FREE!)**

---

## 🔧 Troubleshooting

### Issue: CORS Error
**Solution:** Add to backend `server.js`:
```javascript
app.use(cors({
  origin: 'https://your-frontend-url.vercel.app',
  credentials: true
}));
```

### Issue: MongoDB Connection Failed
**Solution:** 
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for all IPs)
- Verify connection string is correct
- Check username/password

### Issue: Build Failed
**Solution:**
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📞 Support

If you face any issues:
1. Check server logs
2. Verify environment variables
3. Test API endpoints manually
4. Check MongoDB connection

**Your project is ready to deploy! Good luck! 🚀**

---

## Quick Commands Summary

```bash
# Build frontend
npm run build

# Start backend locally
cd backend && node server.js

# Deploy to Vercel (frontend)
vercel --prod

# Deploy to Render (backend)
# Use Render dashboard

# Check if servers are running
curl https://your-backend-url.com/api/health
```

**Deployment complete! Your placement portal is now live! 🎉**
