# HR Module - Quick Test Guide

## 🚀 Quick Start

**Dev Server**: http://localhost:8080/

## 🧪 Complete Test Flow (10 Minutes)

### Step 1: Admin Creates HR Credential (2 min)

1. **Login as Admin**
   - Go to: http://localhost:8080/login
   - Email: `admin@college.edu`
   - Password: `admin123`
   - Click "Login"

2. **Navigate to HR Credentials**
   - Click "HR Credentials" in sidebar
   - Or go to: http://localhost:8080/admin/hr-credentials

3. **Create HR Login**
   - Click "Create HR Login" button
   - Select Company: "Google" (or any company)
   - HR Name: "John Doe"
   - Email: "hr@google.com"
   - Click "Generate" button for password (or enter: test123)
   - Click "Create Login"
   - ✅ Toast: "HR Credential Created!"

4. **Verify HR Account**
   - See HR account in the list
   - Click eye icon to show password
   - Note the email and password for next step

### Step 2: HR Login & Setup (3 min)

1. **Logout from Admin**
   - Click profile icon → Logout

2. **Go to HR Login**
   - Go to: http://localhost:8080/hr-login
   - Or click "HR Login" link

3. **Login as HR**
   - Email: `hr@google.com`
   - Password: `test123` (or generated password)
   - Click "Login"
   - ✅ Redirected to HR Dashboard

4. **Set Required Skills**
   - Click "Required Skills" in sidebar
   - Add skills one by one:
     - Type "React" → Click "Add"
     - Type "Node.js" → Click "Add"
     - Type "Python" → Click "Add"
     - Type "MongoDB" → Click "Add"
   - Or click common skills to add quickly
   - Click "Save Changes"
   - ✅ Toast: "Skills Saved!"

### Step 3: Create Test Application (2 min)

Since we don't have a student applying yet, let's create a test application manually:

1. **Open Browser Console** (F12)

2. **Run this code** to create a test application:

```javascript
const testApplication = {
  id: Date.now().toString(),
  studentId: "student-1",
  studentName: "Rahul Sharma",
  studentEmail: "rahul@college.edu",
  rollNumber: "CSE2021001",
  branch: "CSE",
  cgpa: 8.5,
  skills: ["React", "Node.js", "Python", "Java"],
  resumeUrl: "/resumes/rahul.pdf",
  appliedDate: new Date().toISOString().split('T')[0],
  status: "applied",
  remarks: "",
  companyId: "1", // Google's ID
  driveId: "1",
  jobRole: "Software Engineer"
};

const applications = JSON.parse(localStorage.getItem('applications') || '[]');
applications.push(testApplication);
localStorage.setItem('applications', JSON.stringify(applications));
console.log('Test application created!');
```

3. **Refresh the page** (F5)

### Step 4: HR Reviews Application (2 min)

1. **Go to Applications**
   - Click "Applications" in sidebar
   - Or go to: http://localhost:8080/hr/applications

2. **View Application**
   - See Rahul Sharma's application
   - ✅ Notice: "75% Match" badge (3 out of 4 skills match)
   - ✅ Skills in green badges are matching
   - Click "View" button

3. **Check Details**
   - See full student information
   - Skills with green background = matching
   - Skill Match: 75%
   - Click "Close"

### Step 5: HR Shortlists Student (1 min)

1. **Shortlist Student**
   - Click menu icon (⋮) on Rahul's application
   - Click "Shortlist"
   - Add remarks: "Strong technical skills, good match"
   - Click "Update Status"
   - ✅ Toast: "Status Updated!"

2. **Verify Status**
   - See purple "Shortlisted" badge
   - Status changed from "Applied" to "Shortlisted"

### Step 6: HR Selects Student (1 min)

1. **Select Student**
   - Click menu icon (⋮) again
   - Click "Select"
   - Add remarks: "Selected for final interview round"
   - Click "Update Status"
   - ✅ Toast: "Status Updated!"

2. **Verify Selection**
   - See green "Selected" badge ✅
   - Remarks updated

### Step 7: Test Filters & Search (1 min)

1. **Test Status Filter**
   - Click status dropdown
   - Select "Selected"
   - ✅ Only selected students shown
   - Select "All Status" to see all

2. **Test Search**
   - Type "Rahul" in search box
   - ✅ Only Rahul's application shown
   - Clear search

## 🎯 Additional Test Scenarios

### Test Scenario A: Multiple Applications

Create more test applications with different skill matches:

```javascript
// 100% Match Student
const app2 = {
  id: Date.now().toString() + "2",
  studentId: "student-2",
  studentName: "Priya Patel",
  studentEmail: "priya@college.edu",
  rollNumber: "CSE2021002",
  branch: "CSE",
  cgpa: 9.2,
  skills: ["React", "Node.js", "Python", "MongoDB"], // All match!
  resumeUrl: "/resumes/priya.pdf",
  appliedDate: new Date().toISOString().split('T')[0],
  status: "applied",
  companyId: "1",
  driveId: "1",
  jobRole: "Software Engineer"
};

// 0% Match Student
const app3 = {
  id: Date.now().toString() + "3",
  studentId: "student-3",
  studentName: "Amit Kumar",
  studentEmail: "amit@college.edu",
  rollNumber: "CSE2021003",
  branch: "CSE",
  cgpa: 7.8,
  skills: ["Java", "Spring Boot", "MySQL"], // No match
  resumeUrl: "/resumes/amit.pdf",
  appliedDate: new Date().toISOString().split('T')[0],
  status: "applied",
  companyId: "1",
  driveId: "1",
  jobRole: "Software Engineer"
};

const applications = JSON.parse(localStorage.getItem('applications') || '[]');
applications.push(app2, app3);
localStorage.setItem('applications', JSON.stringify(applications));
console.log('Multiple applications created!');
```

**Expected Results:**
- Priya: 100% Match badge (strong candidate)
- Rahul: 75% Match badge
- Amit: 0% Match (no matching skills)

### Test Scenario B: Different Statuses

Test all status updates:

1. **Shortlist** Priya (100% match)
2. **Select** Priya
3. **Reject** Amit (0% match)
4. **On Hold** another student

Verify each status shows correct badge color:
- Applied: Blue
- Shortlisted: Purple
- Selected: Green ✅
- Rejected: Red ❌
- On Hold: Orange ⏸️

### Test Scenario C: Admin View

1. **Logout from HR**
2. **Login as Admin**
3. **Go to HR Credentials**
4. **Verify:**
   - Can see HR account
   - Can show/hide password
   - Can edit HR details
   - Can delete HR account

## ✅ Success Checklist

### Admin Module
- [ ] Can create HR credentials
- [ ] Can select company for HR
- [ ] Can generate random password
- [ ] Can view all HR accounts
- [ ] Can show/hide passwords
- [ ] Can edit HR credentials
- [ ] Can delete HR accounts
- [ ] HR Credentials menu item in sidebar

### HR Module
- [ ] Separate HR login page exists
- [ ] Can login with HR credentials
- [ ] Redirects to HR dashboard
- [ ] Dashboard shows correct stats
- [ ] Can add required skills
- [ ] Can remove skills
- [ ] Can save skills
- [ ] Common skills suggestions work

### HR Applications
- [ ] Can view applications
- [ ] Only sees own company's applications
- [ ] Skill match percentage displayed
- [ ] Matching skills highlighted in green
- [ ] Can search applications
- [ ] Can filter by status
- [ ] Can view full details
- [ ] Can shortlist students
- [ ] Can select students
- [ ] Can reject students
- [ ] Can put on hold
- [ ] Can add remarks
- [ ] Status updates immediately
- [ ] Toast notifications work

### UI/UX
- [ ] All pages responsive
- [ ] Status badges color-coded
- [ ] Icons displayed correctly
- [ ] Dialogs open/close properly
- [ ] Forms validate required fields
- [ ] Search works in real-time
- [ ] Filters work correctly

## 🐛 Troubleshooting

### Issue: HR can't login
**Solution**: 
1. Make sure HR credential was created by admin
2. Check email and password are correct
3. Verify in localStorage: `localStorage.getItem('hrCredentials')`

### Issue: No applications showing
**Solution**:
1. Create test application using console code above
2. Make sure companyId matches HR's company
3. Refresh the page

### Issue: Skill match not showing
**Solution**:
1. Make sure HR has set required skills
2. Check localStorage: `localStorage.getItem('requiredSkills_1')`
3. Refresh applications page

### Issue: Status not updating
**Solution**:
1. Check browser console for errors
2. Verify application exists in localStorage
3. Try refreshing the page

## 📊 Test Data Reference

### Admin Login
```
Email: admin@college.edu
Password: admin123
```

### Test HR Login
```
Email: hr@google.com
Password: test123
```

### Test Required Skills
```
React, Node.js, Python, MongoDB
```

### Test Student Data
```
Name: Rahul Sharma
Roll: CSE2021001
Branch: CSE
CGPA: 8.5
Skills: React, Node.js, Python, Java
Expected Match: 75% (3/4 skills)
```

## 🎉 Expected Results

After completing all steps, you should have:

1. ✅ HR credential created for Google
2. ✅ HR can login successfully
3. ✅ Required skills set (React, Node.js, Python, MongoDB)
4. ✅ Test application visible in HR dashboard
5. ✅ Skill match percentage showing (75%)
6. ✅ Matching skills highlighted in green
7. ✅ Student shortlisted with remarks
8. ✅ Student selected with final remarks
9. ✅ Status badge showing "Selected" in green
10. ✅ All filters and search working

## 🚀 Next Steps

1. Test with multiple companies
2. Create multiple HR accounts
3. Test with different skill combinations
4. Test all status transitions
5. Verify data persistence across sessions
6. Test on different browsers
7. Test responsive design on mobile

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Verify localStorage data
3. Clear localStorage and start fresh: `localStorage.clear()`
4. Restart dev server
5. Check `HR_MODULE_IMPLEMENTATION.md` for detailed documentation

---

**Quick Reset**: To start fresh, run in console:
```javascript
localStorage.clear();
location.reload();
```

Then start from Step 1!
