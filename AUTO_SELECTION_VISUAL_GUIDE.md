# Auto-Selection Feature - Visual Guide 🎯

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTO-SELECTION WORKFLOW                       │
└─────────────────────────────────────────────────────────────────┘

STEP 1: HR SETS REQUIRED SKILLS
┌──────────────────────────────────────┐
│  HR Login → Required Skills Page     │
│  Add Skills:                         │
│  ✓ JavaScript                        │
│  ✓ React                             │
│  ✓ Node.js                           │
│  ✓ MongoDB                           │
│  ✓ Express                           │
└──────────────────────────────────────┘
                ↓
        Saved to Company Profile

STEP 2: STUDENT ADDS SKILLS
┌──────────────────────────────────────┐
│  Student Login → Profile Page        │
│  Add Skills:                         │
│  ✓ JavaScript                        │
│  ✓ React                             │
│  ✓ Node.js                           │
│  ✓ MongoDB                           │
│  ✓ Python                            │
└──────────────────────────────────────┘
                ↓
        Saved to Student Profile

STEP 3: STUDENT APPLIES
┌──────────────────────────────────────┐
│  Student → Opportunities → Apply     │
│  Click "Apply Now" button            │
└──────────────────────────────────────┘
                ↓
        System Calculates Match

STEP 4: SKILL MATCHING
┌──────────────────────────────────────┐
│  Student Skills: 5 skills            │
│  Required Skills: 5 skills           │
│                                      │
│  Matched: 4 skills                   │
│  ✓ JavaScript                        │
│  ✓ React                             │
│  ✓ Node.js                           │
│  ✓ MongoDB                           │
│                                      │
│  Missing: 1 skill                    │
│  ✗ Express                           │
│                                      │
│  Match: 4/5 = 80%                    │
└──────────────────────────────────────┘
                ↓
        80% >= 75% → AUTO-SELECT!

STEP 5: AUTO-SELECTION
┌──────────────────────────────────────┐
│  Status: SELECTED ✅                 │
│  Auto-Selected: YES                  │
│  Skill Match: 80%                    │
└──────────────────────────────────────┘
                ↓
        Update Database & Send Notifications

STEP 6: NOTIFICATIONS
┌──────────────────────────────────────┐
│  TO STUDENT:                         │
│  🎊 Congratulations! Auto-Selected!  │
│  You have been automatically         │
│  SELECTED with 80% skill match!      │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  TO HR:                              │
│  ✨ Student Auto-Selected            │
│  [Name] was automatically selected   │
│  with 80% skill match.               │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  TO ADMIN:                           │
│  🎉 Student Auto-Selected!           │
│  [Name] was automatically SELECTED   │
│  for [Company] with 80% match.       │
└──────────────────────────────────────┘
```

## Match Percentage Examples

### Example 1: Perfect Match (100%)
```
Student Skills:    [JavaScript, React, Node.js, MongoDB, Express]
Required Skills:   [JavaScript, React, Node.js, MongoDB, Express]
Matched:           5/5 = 100%
Result:            ✅ AUTO-SELECTED
```

### Example 2: Excellent Match (80%)
```
Student Skills:    [JavaScript, React, Node.js, MongoDB, Python]
Required Skills:   [JavaScript, React, Node.js, MongoDB, Express]
Matched:           4/5 = 80%
Result:            ✅ AUTO-SELECTED
```

### Example 3: Good Match (75%)
```
Student Skills:    [JavaScript, React, Node.js, Python, Java]
Required Skills:   [JavaScript, React, Node.js, MongoDB]
Matched:           3/4 = 75%
Result:            ✅ AUTO-SELECTED
```

### Example 4: Shortlist Match (70%)
```
Student Skills:    [JavaScript, React, Python, Java, C++]
Required Skills:   [JavaScript, React, Node.js, MongoDB, Express, TypeScript, AWS]
Matched:           5/7 = 71%
Result:            🎉 AUTO-SHORTLISTED
```

### Example 5: Manual Review (60%)
```
Student Skills:    [JavaScript, React, Python, Java, C++]
Required Skills:   [JavaScript, React, Node.js, MongoDB, Express]
Matched:           2/5 = 40%
Result:            📝 APPLIED (Manual Review)
```

## Status Colors & Icons

```
┌─────────────────────────────────────────────────────────────┐
│  STATUS          │  COLOR   │  ICON  │  MEANING             │
├─────────────────────────────────────────────────────────────┤
│  SELECTED        │  Green   │  ✅    │  Auto-selected       │
│  SHORTLISTED     │  Blue    │  🎉    │  Auto-shortlisted    │
│  APPLIED         │  Yellow  │  📝    │  Pending review      │
│  REJECTED        │  Red     │  ❌    │  Not selected        │
│  ON HOLD         │  Orange  │  ⏸️    │  Under review        │
└─────────────────────────────────────────────────────────────┘
```

## Student View - Applications Page

```
┌─────────────────────────────────────────────────────────────┐
│  MY APPLICATIONS                                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🏢 Wipro - Software Engineer                               │
│  📦 Package: Rs. 6 LPA                                      │
│  📅 Applied: Feb 14, 2026                                   │
│  📊 Skill Match: 80%                                        │
│  ✅ Status: SELECTED                                        │
│  🎊 Auto-Selected based on skill match!                     │
│                                                              │
│  Matched Skills: JavaScript, React, Node.js, MongoDB        │
│  Missing Skills: Express                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## HR View - Applications Page

```
┌─────────────────────────────────────────────────────────────┐
│  APPLICATIONS FOR WIPRO                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  👤 Subasree (IT111)                                        │
│  📧 subasree@gmail.com                                      │
│  📊 CGPA: 8.5                                               │
│  📊 Skill Match: 80%                                        │
│  ✅ Status: SELECTED (Auto-Selected)                        │
│  📅 Applied: Feb 14, 2026                                   │
│                                                              │
│  Skills: JavaScript, React, Node.js, MongoDB, Python        │
│  Matched: JavaScript, React, Node.js, MongoDB               │
│  Missing: Express                                           │
│                                                              │
│  [View Resume] [Change Status]                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Admin Dashboard - Statistics

```
┌─────────────────────────────────────────────────────────────┐
│  PLACEMENT STATISTICS                                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Total Applications:        150                             │
│  Auto-Selected:             45  (30%)                       │
│  Auto-Shortlisted:          30  (20%)                       │
│  Manual Review:             75  (50%)                       │
│                                                              │
│  Average Skill Match:       65%                             │
│  Highest Match:             100%                            │
│  Lowest Match:              20%                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Quick Test Checklist

### ✅ HR Setup
- [ ] Login as HR (hr@wipro.com / password123)
- [ ] Go to "Required Skills" page
- [ ] Add 5 skills (e.g., JavaScript, React, Node.js, MongoDB, Express)
- [ ] Save skills

### ✅ Student Setup
- [ ] Login as Student (sneha@gmail.com / password123)
- [ ] Go to Profile page
- [ ] Add 4-5 skills (ensure 75%+ match with HR skills)
- [ ] Upload resume
- [ ] Save profile

### ✅ Test Application
- [ ] As student, go to Opportunities
- [ ] Find Wipro job
- [ ] Click "Apply Now"
- [ ] Should see success message with skill match percentage
- [ ] If match >= 75%, should see "Auto-Selected" message

### ✅ Verify Results
- [ ] Check student's Applications page - status should be "SELECTED"
- [ ] Check student's notifications - should have auto-selection notification
- [ ] Login as HR - should see notification about auto-selection
- [ ] Login as Admin - should see notification about auto-selection
- [ ] Check HR Applications page - should show student with "SELECTED" status

## Troubleshooting

### Student not auto-selected?
1. Check skill match percentage (must be >= 75%)
2. Ensure HR has set required skills
3. Ensure student has added skills in profile
4. Check console logs for skill matching details

### Notifications not received?
1. Check notification bell icon in top nav
2. Refresh the page
3. Check backend logs for notification creation
4. Ensure notification system is running

### Skills not matching?
1. Skills are case-insensitive
2. Partial matches work (e.g., "React" matches "React.js")
3. Check for typos in skill names
4. Ensure skills are saved properly

## Summary

The auto-selection feature provides:
- ✅ Instant selection for high-match candidates (>= 75%)
- 🎉 Automatic shortlisting for good matches (>= 70%)
- 📝 Manual review for lower matches
- 🔔 Real-time notifications to all stakeholders
- 📊 Transparent skill matching with detailed feedback
- ⚡ Faster hiring process
- 🎯 Fair and objective selection criteria
