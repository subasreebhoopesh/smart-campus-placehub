# MySQL Setup Guide for Placement Portal

## Current Issue
❌ **Database connection failed: Access denied for user 'root'@'localhost' (using password: NO)**

This means MySQL is either:
1. Not installed
2. Not running
3. Requires a password that's not configured

## Solution Options

### Option 1: Install MySQL (If Not Installed)

#### Windows:
1. Download MySQL Installer: https://dev.mysql.com/downloads/installer/
2. Run the installer
3. Choose "Developer Default" setup
4. Set root password during installation (remember this!)
5. Complete installation

#### Mac:
```bash
brew install mysql
brew services start mysql
# Set root password
mysql_secure_installation
```

#### Linux:
```bash
sudo apt-get install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

### Option 2: Start MySQL (If Already Installed)

#### Windows:
1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find "MySQL" or "MySQL80" in the list
4. Right-click → Start

Or use Command Prompt as Administrator:
```cmd
net start MySQL80
```

#### Mac:
```bash
brew services start mysql
```

#### Linux:
```bash
sudo systemctl start mysql
```

### Option 3: Configure MySQL Password

#### If MySQL has NO password (common for local dev):
Update `backend/.env`:
```env
DB_PASSWORD=
```

#### If MySQL HAS a password:
Update `backend/.env`:
```env
DB_PASSWORD=your_mysql_password
```

#### To SET a password if you don't have one:
```bash
# Login to MySQL (no password)
mysql -u root

# Set password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
FLUSH PRIVILEGES;
EXIT;
```

Then update `backend/.env`:
```env
DB_PASSWORD=newpassword
```

## Setup Database Tables

Once MySQL is running and configured:

### Method 1: Using MySQL Command Line
```bash
# Navigate to backend folder
cd backend

# Run setup script
mysql -u root -p < setup-database.sql
# Enter your MySQL password when prompted
```

### Method 2: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to localhost
3. File → Open SQL Script
4. Select `backend/setup-database.sql`
5. Click Execute (⚡ icon)

### Method 3: Manual Setup
```bash
# Login to MySQL
mysql -u root -p

# Copy and paste contents of backend/database.sql
# Or run:
source backend/database.sql
```

## Verify Setup

### 1. Check MySQL is Running
```bash
# Windows (PowerShell as Admin)
Get-Service MySQL80

# Mac/Linux
brew services list | grep mysql
# or
sudo systemctl status mysql
```

### 2. Test MySQL Connection
```bash
mysql -u root -p
# Enter password
# If you see mysql> prompt, it's working!
```

### 3. Check Database Exists
```sql
SHOW DATABASES;
USE placement_portal;
SHOW TABLES;
```

Should show:
- users
- students
- companies
- hr
- placement_drives
- applications
- required_skills

### 4. Test Backend Connection
Open browser: `http://localhost:3001/api/health`

Should see:
```json
{"success": true, "message": "Server is running"}
```

## Default Admin Credentials

After running `setup-database.sql`, you'll have:

**Email**: admin@college.edu  
**Password**: admin123

## Restart Backend Server

After fixing MySQL:
1. Stop backend server (Ctrl+C in terminal)
2. Start again: `node server.js`
3. Should see: ✅ Database connected successfully

## Common Issues

### Issue: "mysql: command not found"
**Solution**: MySQL not in PATH. Use full path:
```bash
# Windows
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p

# Mac (if installed via brew)
/usr/local/mysql/bin/mysql -u root -p
```

### Issue: "Access denied for user 'root'@'localhost'"
**Solution**: Wrong password in `.env` file
- Check your MySQL password
- Update `backend/.env` → `DB_PASSWORD=your_password`
- Restart backend server

### Issue: "Can't connect to MySQL server"
**Solution**: MySQL not running
- Start MySQL service (see Option 2 above)
- Check firewall isn't blocking port 3306

### Issue: "Unknown database 'placement_portal'"
**Solution**: Database not created
- Run `setup-database.sql` (see Setup Database Tables above)

### Issue: "Table 'placement_portal.users' doesn't exist"
**Solution**: Tables not created
- Run `setup-database.sql` completely
- Or run `backend/database.sql`

## Alternative: Use SQLite (Simpler for Development)

If MySQL is too complex, you can switch to SQLite:

1. Install SQLite package:
```bash
cd backend
npm install sqlite3
```

2. Update `backend/config/database.js` to use SQLite
3. No server needed - database is just a file!

(Let me know if you want me to set this up)

## Quick Test Without Database

The frontend will work without database, but you won't be able to:
- Login (authentication requires database)
- Create/view drives
- Apply for jobs
- See applications

For full functionality, MySQL must be set up.

## Need Help?

If you're still stuck:
1. Check which step failed
2. Copy the exact error message
3. Let me know your operating system
4. I'll provide specific instructions

## Summary

**Minimum steps to get working**:
1. Install MySQL (if not installed)
2. Start MySQL service
3. Set/update password in `backend/.env`
4. Run `mysql -u root -p < backend/setup-database.sql`
5. Restart backend server
6. Login with admin@college.edu / admin123

That's it! 🚀
