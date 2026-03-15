# 📧 Email Setup - Simple Steps (Tamil + English)

## ✅ Email System Already Ready!

உங்க project-ல email system **already complete** ஆ இருக்கு! Just Gmail setup பண்ணா போதும்! 🎉

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Gmail App Password Create பண்ணுங்க

#### 1️⃣ Google Account-க்கு போங்க
Browser-ல open பண்ணுங்க:
```
https://myaccount.google.com/
```

#### 2️⃣ 2-Step Verification Enable பண்ணுங்க
- Left side-ல **"Security"** click பண்ணுங்க
- **"2-Step Verification"** கண்டுபிடிங்க
- **"Turn On"** button click பண்ணுங்க
- உங்க phone number verify பண்ணுங்க (SMS code வரும்)

#### 3️⃣ App Password Create பண்ணுங்க
- மறுபடியும் **"Security"** page-க்கு போங்க
- கீழே scroll பண்ணி **"App passwords"** கண்டுபிடிங்க
- Click பண்ணுங்க (password கேட்கும், enter பண்ணுங்க)
- **"Select app"** dropdown-ல **"Mail"** select பண்ணுங்க
- **"Select device"** dropdown-ல **"Other (Custom name)"** select பண்ணுங்க
- Name type பண்ணுங்க: **"Placement Portal"**
- **"Generate"** button click பண்ணுங்க
- **16-character password** show ஆகும் (spaces இருக்கும்)
- **Copy பண்ணுங்க!** (இது important!)

Example password: `abcd efgh ijkl mnop`

---

### Step 2: .env File Update பண்ணுங்க

#### 1️⃣ File Open பண்ணுங்க
```
smart-campus-pathways-main/backend/.env
```

#### 2️⃣ கீழே இந்த 2 lines add பண்ணுங்க:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

#### 3️⃣ உங்க details replace பண்ணுங்க:
- `your-email@gmail.com` → உங்க Gmail address
- `abcd efgh ijkl mnop` → Step 1-ல copy பண்ண password

#### Example:
```env
EMAIL_USER=placement@college.edu
EMAIL_PASSWORD=xmkp qwer tyui asdf
```

#### 4️⃣ File Save பண்ணுங்க (Ctrl+S)

---

### Step 3: Backend Restart பண்ணுங்க

#### Terminal-ல:
```bash
# Backend stop பண்ணுங்க (Ctrl+C)
# மறுபடியும் start பண்ணுங்க:
cd smart-campus-pathways-main/backend
node server.js
```

---

### Step 4: Test பண்ணுங்க

#### New Terminal open பண்ணி run பண்ணுங்க:
```bash
cd smart-campus-pathways-main/backend
node test-email.js
```

#### Success Output:
```
📧 Testing Email Notification System...

1️⃣  Testing SELECTION Email...
   ✅ Email sent successfully

2️⃣  Testing SHORTLIST Email...
   ✅ Email sent successfully

3️⃣  Testing INTERVIEW SCHEDULE Email...
   ✅ Email sent successfully

✅ All email tests completed!
```

#### உங்க Gmail inbox check பண்ணுங்க - 3 test emails வந்திருக்கும்! 📧

---

## 📧 எந்த Emails Send ஆகும்?

### 1. Student Selected ஆனா 🎉
```
Subject: 🎉 Congratulations! Selected at Google
Content: Company, Role, Package details
```

### 2. Interview-க்கு Shortlist ஆனா ✨
```
Subject: ✨ Shortlisted for Microsoft
Content: Company, Position, Preparation reminder
```

### 3. Interview Schedule ஆனா 📅
```
Subject: 📅 Interview Scheduled - Amazon
Content: Date, Time, Venue details
```

### 4. Student Apply பண்ணினா (HR-க்கு) 📋
```
Subject: 📋 New Application Received
Content: Student details, Skill match %
```

### 5. Student Placed ஆனா (Admin-க்கு) 🎊
```
Subject: 🎉 Student Placed
Content: Student, Company, Package info
```

### 6. Documents Verify பண்ணினா ✅
```
Subject: ✅ Documents Verified
Content: Status, Remarks
```

---

## 🎯 Automatic Triggers

Emails **automatically** send ஆகும் when:

1. ✅ Admin new drive create பண்ணும்போது
2. ✅ HR application status update பண்ணும்போது
3. ✅ Student selected/shortlisted ஆகும்போது
4. ✅ Interview schedule பண்ணும்போது
5. ✅ Student apply பண்ணும்போது

**No manual work needed!** System automatically handle பண்ணும்! 🚀

---

## 🔍 Troubleshooting

### Problem 1: "Invalid login" Error
**Solution:**
- 2-step verification enable பண்ணுங்க
- App password மறுபடியும் create பண்ணுங்க
- Regular password use பண்ணாதீங்க (App password தான் use பண்ணணும்)

### Problem 2: Emails Send ஆகல
**Solution:**
- .env file-ல EMAIL_USER and EMAIL_PASSWORD correct-ஆ இருக்கா check பண்ணுங்க
- Backend restart பண்ணுங்க
- Internet connection check பண்ணுங்க

### Problem 3: Emails Spam-ல போகுது
**Solution:**
- First few emails spam-ல தான் போகும்
- Inbox-ல open பண்ணி "Not spam" click பண்ணுங்க
- Future emails inbox-ல வரும்

### Problem 4: Test Email வரல
**Solution:**
- Gmail inbox check பண்ணுங்க (Spam folder-யும் பாருங்க)
- 2-3 minutes wait பண்ணுங்க
- Console-ல error messages பாருங்க

---

## ✅ Final .env File Example

```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=placement_portal
JWT_SECRET=your_jwt_secret_key_change_this_in_production
UPLOAD_DIR=./uploads
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/placement_portal

# Email Configuration (ADD THESE!)
EMAIL_USER=placement@college.edu
EMAIL_PASSWORD=xmkp qwer tyui asdf
```

---

## 📊 Summary

| Step | Action | Time |
|------|--------|------|
| 1 | Gmail App Password create | 3 min |
| 2 | .env file update | 1 min |
| 3 | Backend restart | 30 sec |
| 4 | Test emails | 1 min |
| **Total** | **Setup complete!** | **5 min** |

---

## 🎉 Done!

இப்போ உங்க placement portal-ல email notifications **fully working**! 📧✨

Students இனி எந்த update-யும் miss பண்ணமாட்டாங்க! 🚀

---

## 💡 Important Notes

1. **Professional Email Use பண்ணுங்க**
   - placement@college.edu (recommended)
   - Not personal Gmail

2. **App Password Safe-ஆ வெச்சுக்கங்க**
   - .env file commit பண்ணாதீங்க
   - Share பண்ணாதீங்க

3. **Test First**
   - test-email.js run பண்ணி verify பண்ணுங்க
   - Production-ல use பண்ணும் முன்னாடி

4. **Monitor Logs**
   - Backend console-ல email logs பாருங்க
   - Errors track பண்ணுங்க

---

## 📞 Need Help?

Issues இருந்தா:
1. .env file மறுபடியும் check பண்ணுங்க
2. Backend restart பண்ணுங்க
3. test-email.js run பண்ணுங்க
4. Console logs பாருங்க

Happy Emailing! 📧💫
