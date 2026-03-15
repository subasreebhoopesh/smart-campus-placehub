# 📧 Email Notifications - Tamil Guide

## ✅ என்ன இருக்கு?

உங்க placement portal-ல **complete email notification system** already இருக்கு! 🎉

---

## 📬 எந்த மாதிரி Emails?

### 1. **Selection Email** 🎉
**எப்போ?**: Student select ஆனா
**Content**: 
- Company name
- Job role
- Package details
- Congratulations message

### 2. **Shortlist Email** ✨
**எப்போ?**: Interview-க்கு shortlist ஆனா
**Content**:
- Company details
- Position
- Preparation reminder

### 3. **Interview Schedule** 📅
**எப்போ?**: Interview date fix ஆனா
**Content**:
- Date, time, venue
- Reminder message
- Good luck wishes

### 4. **New Application (HR-க்கு)** 📋
**எப்போ?**: Student apply பண்ணினா
**Content**:
- Student details
- Skill match %
- Review reminder

### 5. **Placement Alert (Admin-க்கு)** 🎊
**எப்போ?**: Student placed ஆனா
**Content**:
- Student name
- Company details
- Package info

### 6. **Document Verification** ✅
**எப்போ?**: Documents verify பண்ணினா
**Content**:
- Approved/Rejected status
- Remarks
- Action needed

---

## 🔧 Setup எப்படி பண்றது?

### Step 1: Gmail App Password Create பண்ணுங்க

#### 1. Google Account-க்கு போங்க
```
https://myaccount.google.com/
```

#### 2. 2-Step Verification Enable பண்ணுங்க
- Security → 2-Step Verification
- Turn On click பண்ணுங்க
- Phone number verify பண்ணுங்க

#### 3. App Password Create பண்ணுங்க
- Security → App passwords
- "Mail" select பண்ணுங்க
- "Other (Custom name)" select பண்ணுங்க
- Name: "Placement Portal"
- Generate click பண்ணுங்க
- 16-character password copy பண்ணுங்க

#### 4. .env File Update பண்ணுங்க

`backend/.env` file-ல add பண்ணுங்க:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

**Example**:
```env
EMAIL_USER=placement@college.edu
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

---

## 🧪 Test பண்றது எப்படி?

### Terminal-ல run பண்ணுங்க:

```bash
cd smart-campus-pathways-main/backend
node test-email.js
```

### Output:
```
📧 Testing Email Notification System...

1️⃣  Testing SELECTION Email...
   Result: ✅ Success

2️⃣  Testing SHORTLIST Email...
   Result: ✅ Success

3️⃣  Testing INTERVIEW SCHEDULE Email...
   Result: ✅ Success

✅ All email tests completed!
```

---

## 📧 Email எப்போ Send ஆகும்?

### Automatic Triggers:

1. **Admin New Drive Create பண்ணினா**
   → Eligible students-க்கு email

2. **HR Application Status Update பண்ணினா**
   → Student-க்கு email

3. **Student Selected ஆனா**
   → Congratulations email

4. **Interview Schedule பண்ணினா**
   → Reminder email

5. **Student Apply பண்ணினா**
   → HR-க்கு notification email

---

## 🎨 Email Design

### Professional Look:
- ✅ Clean HTML template
- ✅ Responsive design
- ✅ Color-coded by type
- ✅ College branding ready

### Sample Email:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Congratulations!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello Rahul Kumar,

You have been SELECTED!

┌─────────────────────────────┐
│ Company: Google India       │
│ Position: Software Engineer │
│ Package: Rs. 45 LPA        │
└─────────────────────────────┘

This is a significant achievement!

Best wishes,
Placement Cell Team
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ⚙️ Configuration

### .env File Complete Setup:

```env
# MongoDB
MONGODB_URI=your-mongodb-connection-string

# JWT
JWT_SECRET=your-secret-key

# Email (Gmail)
EMAIL_USER=placement@college.edu
EMAIL_PASSWORD=your-16-char-app-password

# Server
PORT=3001
```

---

## 🔍 Troubleshooting

### Problem 1: Email Send ஆகல
**Solution**:
- .env file check பண்ணுங்க
- App password correct-ஆ இருக்கா பாருங்க
- Internet connection check பண்ணுங்க

### Problem 2: "Invalid login" Error
**Solution**:
- 2-step verification enable பண்ணுங்க
- App password மறுபடியும் create பண்ணுங்க
- Regular password use பண்ணாதீங்க

### Problem 3: Emails Spam-ல போகுது
**Solution**:
- First few emails spam-ல தான் போகும்
- "Not spam" mark பண்ணுங்க
- Future emails inbox-ல வரும்

### Problem 4: Email Simulation Mode
**Solution**:
- .env file-ல EMAIL_USER add பண்ணுங்க
- Server restart பண்ணுங்க

---

## 📊 Email Types Summary

| Email Type | Recipient | Trigger | Status |
|-----------|-----------|---------|--------|
| Selection | Student | HR marks selected | ✅ Ready |
| Shortlist | Student | HR shortlists | ✅ Ready |
| Interview | Student | Interview scheduled | ✅ Ready |
| New App | HR | Student applies | ✅ Ready |
| Placement | Admin | Student placed | ✅ Ready |
| Doc Verify | Student | Docs verified | ✅ Ready |

---

## 🚀 Quick Start

### 1. Gmail Setup (5 minutes)
```
1. Google Account → Security
2. 2-Step Verification → Enable
3. App passwords → Create
4. Copy 16-char password
```

### 2. Update .env (1 minute)
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

### 3. Test (1 minute)
```bash
cd backend
node test-email.js
```

### 4. Done! ✅
Emails automatically send ஆகும்!

---

## 💡 Tips

1. **Professional Email Use பண்ணுங்க**
   - placement@college.edu
   - Not personal Gmail

2. **Test First**
   - test-email.js run பண்ணுங்க
   - Verify emails received

3. **Monitor Logs**
   - Console-ல email logs பாருங்க
   - Errors track பண்ணுங்க

4. **User Preferences**
   - Students email disable பண்ணலாம்
   - Settings-ல option இருக்கும்

---

## 📁 Files Location

```
backend/
├── utils/
│   └── emailService.js      ← Email functions
├── test-email.js            ← Test script
└── .env                     ← Configuration
```

---

## ✅ Status

- ✅ Email service ready
- ✅ 6 templates available
- ✅ Auto-trigger integrated
- ✅ Error handling done
- ✅ Professional design
- ⏳ Gmail setup needed (by you)
- ⏳ Testing required

---

## 🎉 Ready!

Email notification system **fully implemented**! Gmail setup பண்ணினா ready! 📧✨

Students இனி எந்த update-யும் miss பண்ணமாட்டாங்க! 🚀

---

## 📞 Help

Issues இருந்தா:
1. .env file check பண்ணுங்க
2. test-email.js run பண்ணுங்க
3. Console logs பாருங்க
4. Gmail settings verify பண்ணுங்க

Happy Emailing! 📧💫
