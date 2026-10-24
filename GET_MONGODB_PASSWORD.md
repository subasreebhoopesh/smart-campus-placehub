# 🔑 MongoDB Password எடுக்கறது எப்படி?

## **Option 1: Existing Password Use பண்ணு**

நீ MongoDB Atlas setup பண்ணும்போது password create பண்ணியிருப்ப. அது எங்கேயாவது save பண்ணி வச்சிருக்கியா?

---

## **Option 2: Password Reset பண்ணு** (2 mins)

### **Step 1: MongoDB Atlas க்கு போ**
```
https://cloud.mongodb.com
→ Login with your account
```

### **Step 2: Database Access**
```
→ Left sidebar → Security → Database Access
→ Find user: sreesuba2192005_db_user
→ Click "Edit" button
```

### **Step 3: Reset Password**
```
→ Click "Edit Password"
→ Choose: "Autogenerate Secure Password" (Recommended!)
→ Click "Show" to see password
→ Copy the password immediately!
→ Click "Update User"
```

### **Example Auto-Generated Password:**
```
Abc123Xyz789!@#
```

---

## **Step 4: Complete Connection String**

### **Your Final MongoDB URI:**
```
mongodb+srv://sreesuba2192005_db_user:Abc123Xyz789!@#@cluster0.kfs5czp.mongodb.net/placement_portal?retryWrites=true&w=majority
```

**⚠️ Important:**
- Replace `Abc123Xyz789!@#` with YOUR actual password
- Keep `?retryWrites=true&w=majority` at the end
- No spaces in the URL!

---

## **Special Characters in Password?**

If your password has special characters like `@`, `#`, `$`, `%`, you need to **URL-encode** them:

| Character | URL-Encoded |
|-----------|-------------|
| @ | %40 |
| # | %23 |
| $ | %24 |
| % | %25 |
| & | %26 |
| + | %2B |
| / | %2F |
| : | %3A |
| = | %3D |
| ? | %3F |

**Example:**
```
Password: Pass@123#
URL-Encoded: Pass%40123%23

Full URI:
mongodb+srv://sreesuba2192005_db_user:Pass%40123%23@cluster0.kfs5czp.mongodb.net/placement_portal?retryWrites=true&w=majority
```

---

## **Quick Test:**

Once you have your password, test it:

### **Option A: Use MongoDB Compass (Desktop App)**
```
Download: https://www.mongodb.com/try/download/compass
→ Paste your connection string
→ Click "Connect"
→ If success, password is correct!
```

### **Option B: Test in Code**
```bash
cd backend
node test-mongodb-connection.js
```

---

## **✅ Checklist:**

- [ ] MongoDB Atlas login successful
- [ ] Password reset/retrieved
- [ ] Connection string complete
- [ ] Special characters URL-encoded (if any)
- [ ] Connection tested (optional)
- [ ] Ready for Render deployment!

---

**இப்போ password கிடைச்சிருச்சா?** அப்புறம் Render-ல deploy பண்ணலாம்! 🚀
