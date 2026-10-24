# 🗄️ Get MongoDB Atlas Connection String

## 📋 You Need This for Koyeb Deployment!

Your local MongoDB (`mongodb://localhost:27017`) won't work on Koyeb because it's on your computer!

You need **MongoDB Atlas** (free cloud MongoDB).

---

## 🎯 Two Options:

### **Option 1: You Already Have MongoDB Atlas** ✅
- Skip to "Get Connection String" section below

### **Option 2: You Don't Have MongoDB Atlas** ❌
- Follow "Create New MongoDB Atlas" section below

---

## 📱 Option 1: Get Connection String (If You Have Atlas)

### **Steps:**

1. **Go to MongoDB Atlas:**
   ```
   https://cloud.mongodb.com
   ```

2. **Login** with your account

3. **Find your cluster:**
   - You should see your cluster (like "Cluster0")
   - Click on it

4. **Click "Connect" button**

5. **Choose "Connect your application"**

6. **Copy the connection string:**
   - Should look like:
     ```
     mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/
     ```

7. **Replace `<password>` with your actual password:**
   ```
   mongodb+srv://username:yourActualPassword@cluster0.xxxxx.mongodb.net/placement_portal
   ```
   
   ⚠️ **Important:** Add your database name at the end: `/placement_portal`

8. **Done! Use this in Koyeb!** ✅

---

## 📱 Option 2: Create New MongoDB Atlas (10 minutes)

### **If you don't have MongoDB Atlas account:**

### **Step 1: Sign Up (2 min)**

1. Go to: https://www.mongodb.com/cloud/atlas/register

2. Fill the form:
   - Email
   - Password
   - First name / Last name

3. Or sign up with Google (easier!)

4. Click "Create your Atlas account"

5. Verify email if needed

---

### **Step 2: Create Organization (1 min)**

1. Choose organization name: `Smart Campus`

2. Click "Next"

---

### **Step 3: Create Project (1 min)**

1. Project name: `Placement Portal`

2. Click "Next"

3. Click "Create Project"

---

### **Step 4: Create Free Cluster (3 min)**

1. Click "Build a Database"

2. Choose **"M0 FREE"** (important!)

3. **Cloud Provider:**
   - Choose: **AWS** or **Google Cloud**

4. **Region:**
   - Choose closest to India:
   - **Mumbai (ap-south-1)** ✅ Best!
   - or **Singapore (ap-southeast-1)** ✅ Also good

5. **Cluster Name:**
   - Keep default "Cluster0" or name it: `PlacementDB`

6. Click **"Create"** button

7. Wait 1-3 minutes while cluster is created

---

### **Step 5: Create Database User (2 min)**

1. You'll see "Security Quickstart"

2. **Authentication Method:**
   - Keep "Username and Password" selected

3. **Create user:**
   - Username: `placementuser`
   - Password: Click "Autogenerate Secure Password"
   - **COPY THIS PASSWORD!** Save it somewhere safe!

4. Click "Create User"

---

### **Step 6: Whitelist IP Address (1 min)**

1. **Where would you like to connect from?**

2. Click **"Add My Current IP Address"**

3. Then ALSO click **"Add a Different IP Address"**
   - IP Address: `0.0.0.0/0`
   - Description: `Allow all (for deployment)`
   - Click "Add Entry"

4. Click "Finish and Close"

---

### **Step 7: Get Connection String (1 min)**

1. Click "Go to Databases"

2. You'll see your cluster

3. Click **"Connect"** button

4. Choose **"Connect your application"**

5. **Driver:** Node.js
   **Version:** 5.5 or later

6. **Copy the connection string:**
   ```
   mongodb+srv://placementuser:<password>@cluster0.xxxxx.mongodb.net/
   ```

7. **Replace `<password>`:**
   - Use the password you copied earlier
   - Replace `<password>` with actual password

8. **Add database name at end:**
   ```
   mongodb+srv://placementuser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/placement_portal
   ```

9. **This is your MONGODB_URI!** ✅

---

## 📝 Final Connection String Format

Your final string should look like:

```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.xxxxx.mongodb.net/DBNAME
```

**Example:**
```
mongodb+srv://placementuser:MySecret123@cluster0.abc123.mongodb.net/placement_portal
```

### **Parts:**
- `placementuser` = Your MongoDB username
- `MySecret123` = Your MongoDB password
- `cluster0.abc123.mongodb.net` = Your cluster URL
- `placement_portal` = Your database name

---

## ✅ Test Your Connection String

### **Before using in Koyeb, test locally:**

1. **Stop your local MongoDB** (if running)

2. **Update backend/.env:**
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/placement_portal
   ```

3. **Start backend:**
   ```bash
   cd backend
   node server.js
   ```

4. **Check console:**
   - Should see: "MongoDB connected successfully"
   - Or similar success message

5. **Test health endpoint:**
   ```
   http://localhost:3001/api/health
   ```
   - Should see: `{"status":"ok","database":"connected"}`

6. **If working → Use this same string in Koyeb!** ✅

---

## 🐛 Common Issues

### **"Authentication failed"**
```
Fix: Password is wrong
- Make sure no special characters need encoding
- Or regenerate password in Atlas
```

### **"Connection timeout"**
```
Fix: IP not whitelisted
- Go to Atlas → Network Access
- Add IP: 0.0.0.0/0
```

### **"Database doesn't exist"**
```
Fix: Add database name at end
mongodb+srv://...mongodb.net/placement_portal
                                ↑ Add this!
```

### **"Invalid connection string"**
```
Fix: Check format
- Must start with: mongodb+srv://
- Must include: username:password
- Must include: @cluster.mongodb.net
```

---

## 📱 What to Do in Atlas Dashboard

### **Network Access:**
- Make sure `0.0.0.0/0` is added
- This allows Koyeb to connect

### **Database Users:**
- Your user should have "Read and Write" access
- Not "Read Only"!

### **Database:**
- After first deployment, you'll see `placement_portal` database
- With collections: users, students, companies, etc.

---

## 💡 Pro Tips

1. **Save your connection string safely:**
   - In password manager
   - In notes
   - You'll need it!

2. **Don't share publicly:**
   - Never commit to GitHub
   - Never post in public
   - It has your password!

3. **Use environment variables:**
   - In Koyeb: Set as MONGODB_URI
   - In local: In .env file
   - Never hardcode!

---

## ✅ Ready for Koyeb!

Once you have your connection string:

```
mongodb+srv://username:password@cluster.mongodb.net/placement_portal
```

**Use it in Koyeb environment variables:**

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/placement_portal
```

**Then deploy!** 🚀

---

## 🆘 Need Help?

If stuck getting MongoDB Atlas:
1. Screenshot the error
2. Tell me which step
3. I'll help fix!

**MongoDB Atlas is FREE and easy!**
**You got this! 💪**

---

**Next Step:** Go back to `KOYEB_STEP_BY_STEP.md` and continue deployment!

**Podu da! 🚀**
