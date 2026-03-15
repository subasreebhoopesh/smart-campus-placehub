# Quick Start Guide

## Prerequisites
1. MySQL installed and running
2. Node.js installed (v16 or higher)
3. Database created and tables set up

## Step-by-Step Startup

### 1. Start MySQL
**Windows**:
- Open Services → Find MySQL → Start
- Or open MySQL Workbench and connect

**Mac**:
```bash
brew services start mysql
```

**Linux**:
```bash
sudo systemctl start mysql
```

### 2. Verify Database Setup
```bash
mysql -u root -p
```

```sql
USE placement_portal;
SHOW TABLES;
-- Should show: users, students, companies, hr, placement_drives, applications, required_skills
```

If tables don't exist:
```bash
mysql -u root -p < backend/database.sql
```

### 3. Start Backend Server
Open **Terminal 1**:
```bash
cd backend
npm install  # Only first time
node server.js
```

**Expected Output**:
```
🚀 Server running on port 3001
📡 API available at http://localhost:3001/api
```

**Test Backend**:
Open browser: `http://localhost:3001/api/health`

Should see:
```json
{"success": true, "message": "Server is running"}
```

### 4. Start Frontend Server
Open **Terminal 2** (keep backend running):
```bash
# In project root (smart-campus-pathways-main)
npm install  # Only first time
npm run dev
```

**Expected Output**:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:8080/
```

### 5. Access Application
Open browser: `http://localhost:8080`

## Quick Test

### Create Admin Account (First Time Only)
**Option 1: Using API**
```bash
# Use Postman or curl
POST http://localhost:3001/api/auth/signup
Content-Type: application/json

{
  "email": "admin@college.edu",
  "password": "admin123",
  "name": "Admin User",
  "role": "admin"
}
```

**Option 2: Direct MySQL**
```sql
-- Password is 'admin123' hashed with bcrypt
INSERT INTO users (email, password, name, role) 
VALUES (
  'admin@college.edu', 
  '$2b$10$rOzJw5xKxH5L5vXqH5L5L.5L5L5L5L5L5L5L5L5L5L5L5L5L5L5L5',
  'Admin User',
  'admin'
);
```

### Login and Test
1. Go to `http://localhost:8080/admin/login`
2. Email: `admin@college.edu`
3. Password: `admin123`
4. Should redirect to admin dashboard

### Add Company
1. Go to Companies page
2. Click "Add Company"
3. Fill details and save
4. Should see company in list

### Create Drive
1. Go to Drives page
2. Click "Create Drive"
3. Select company from dropdown
4. Fill details and save
5. Should see drive in list

### Create Student Account
```bash
POST http://localhost:3001/api/auth/signup
Content-Type: application/json

{
  "email": "student@college.edu",
  "password": "student123",
  "name": "Student User",
  "role": "student",
  "rollNumber": "CSE2021001",
  "branch": "CSE"
}
```

### Login as Student
1. Go to `http://localhost:8080/student/login`
2. Email: `student@college.edu`
3. Password: `student123`
4. Go to Profile → Update CGPA to 8.0
5. Go to Opportunities → Should see drives

## Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is already in use
# Windows:
netstat -ano | findstr :3001

# Mac/Linux:
lsof -i :3001

# Kill the process if needed
```

### Frontend won't start
```bash
# Check if port 8080 is already in use
# Try different port:
npm run dev -- --port 8081
```

### "Failed to fetch" error
1. Check backend is running (Terminal 1)
2. Check `http://localhost:3001/api/health`
3. Check `.env` file has `VITE_API_URL=http://localhost:3001/api`
4. Restart frontend server

### MySQL connection error
1. Check MySQL is running
2. Check `backend/.env` has correct credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=placement_portal
   ```
3. Test connection:
   ```bash
   mysql -u root -p
   ```

## Environment Files

### backend/.env
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=placement_portal
JWT_SECRET=your_secret_key_change_in_production
PORT=3001
```

### .env (frontend root)
```env
VITE_API_URL=http://localhost:3001/api
```

## Stopping Servers

### Stop Backend
Press `Ctrl + C` in Terminal 1

### Stop Frontend
Press `Ctrl + C` in Terminal 2

### Stop MySQL (Optional)
**Windows**: Services → MySQL → Stop

**Mac**:
```bash
brew services stop mysql
```

**Linux**:
```bash
sudo systemctl stop mysql
```

## Daily Workflow

1. Start MySQL (if not auto-start)
2. Open Terminal 1 → `cd backend && node server.js`
3. Open Terminal 2 → `npm run dev`
4. Open browser → `http://localhost:8080`
5. Work on your project
6. When done: Ctrl+C in both terminals

## Production Deployment

For production, you'll need to:
1. Set up proper MySQL server
2. Configure environment variables
3. Build frontend: `npm run build`
4. Use PM2 or similar for backend: `pm2 start server.js`
5. Set up nginx or Apache as reverse proxy
6. Enable HTTPS with SSL certificate

See `COMPLETE_SETUP_GUIDE.md` for detailed production setup.
