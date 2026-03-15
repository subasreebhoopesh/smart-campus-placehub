# Quick Test Guide - New Interactive Features

## 🚀 Application Running
**URL:** http://localhost:8080/student/dashboard

---

## ✅ 5-Minute Test Checklist

### 1. Career Resources - Interview Questions (1 min)
- [ ] Click "Interview Questions" card
- [ ] Select "Technical - Programming" from dropdown
- [ ] See 5 questions with answers
- [ ] Try "Behavioral - Leadership"
- [ ] Close dialog

**Expected Result:** Dialog opens, questions appear based on selection

---

### 2. Career Resources - Resume Templates (1 min)
- [ ] Click "Resume Templates" card
- [ ] Select "Software Engineer" from dropdown
- [ ] See sections and pro tips
- [ ] Try "Fresher - General"
- [ ] Close dialog

**Expected Result:** Template details appear with sections and tips

---

### 3. Career Resources - Mock Interviews (1 min)
- [ ] Click "Mock Interviews" card
- [ ] Select "Technical Round - Coding"
- [ ] See duration, format, and topics
- [ ] Try "Behavioral Round"
- [ ] Close dialog

**Expected Result:** Interview details appear with all information

---

### 4. Profile Photo Upload (1 min)
- [ ] Look at top-right corner of dashboard
- [ ] See avatar with student initials
- [ ] Click camera icon on avatar
- [ ] Select a photo from your computer
- [ ] See photo appear instantly
- [ ] See success toast notification

**Expected Result:** Photo uploads and appears in avatar

---

### 5. Apply Now Functionality (1 min)
- [ ] Go to: http://localhost:8080/student/opportunities
- [ ] Click "Apply Now" on any job card
- [ ] See confirmation dialog with job details
- [ ] Click "Confirm Application"
- [ ] See success toast

**Expected Result:** Application submitted with confirmation

---

## 🎯 What to Look For

### ✅ Working Features:
1. **Dialogs open smoothly** when clicking resource cards
2. **Dropdown menus** show all categories/templates/types
3. **Content changes** based on dropdown selection
4. **Profile photo** appears instantly after upload
5. **Toast notifications** appear for all actions
6. **Apply dialog** shows all job details correctly

### ❌ Common Issues (Should NOT happen):
- Dialog doesn't open
- Dropdown is empty
- Content doesn't change
- Photo doesn't upload
- No toast notifications
- Apply button does nothing

---

## 📊 Content to Verify

### Interview Questions Categories:
1. Technical - Programming (5 questions)
2. Technical - Data Structures (5 questions)
3. Behavioral - Leadership (5 questions)
4. Behavioral - Problem Solving (5 questions)
5. HR - General (5 questions)
6. Company Specific - Google (3 questions)
7. Company Specific - Microsoft (3 questions)

### Resume Templates:
1. Software Engineer
2. Data Scientist
3. Product Manager
4. Business Analyst
5. Fresher - General

### Mock Interview Types:
1. Technical Round - Coding
2. Technical Round - System Design
3. Behavioral Round
4. HR Round
5. Case Study Round

---

## 🐛 Error Testing

### Profile Photo Upload Errors:
1. **Upload large file (>2MB):**
   - Expected: Error toast "File too large"
   
2. **Upload non-image file (PDF, TXT):**
   - Expected: Error toast "Invalid file type"

3. **Upload valid image (<2MB):**
   - Expected: Success toast "Photo updated"

---

## 📸 Screenshots to Take

1. Dashboard with profile photo
2. Interview Questions dialog open
3. Resume Templates dialog with content
4. Mock Interviews dialog
5. Apply Now confirmation dialog
6. Success toast notification

---

## ✨ Feature Highlights

### What Makes This Special:
- **Interactive dialogs** instead of static pages
- **Dropdown-based navigation** for easy topic selection
- **35+ interview questions** with detailed answers
- **5 resume templates** with professional tips
- **5 mock interview types** with full details
- **One-click photo upload** with instant preview
- **Application confirmation** before submitting
- **Toast notifications** for user feedback

---

## 🎉 Success Criteria

All features working if:
- ✅ All 3 resource dialogs open and show content
- ✅ Dropdowns work and content changes
- ✅ Profile photo uploads successfully
- ✅ Apply Now shows confirmation dialog
- ✅ Toast notifications appear
- ✅ No console errors
- ✅ Smooth animations and transitions

---

**Test completed? All features working! 🚀**

**Next Steps:**
- Share with team for feedback
- Prepare for backend integration
- Add more interview questions
- Implement download/schedule functionality
