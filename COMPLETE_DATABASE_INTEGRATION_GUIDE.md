# 🔗 Complete Database Integration Guide

## Current Status

### ✅ Already Connected to MongoDB Backend

**Student Pages:**
- ✅ Login/Register - Fully connected
- ✅ Profile - Fully connected (CRUD operations)
- ✅ Applications - Fully connected (view own applications)
- ✅ Opportunities - Fully connected (view and apply to drives)

**Admin Pages:**
- ✅ Companies - Fully connected (CRUD operations)
- ✅ Drives - Fully connected (CRUD operations)
- ✅ Students - Partially connected (view only)
- ✅ HR Credentials - Fully connected (CRUD operations)

**HR Pages:**
- ✅ Applications - Fully connected (view and update)
- ✅ Skills - Partially connected

### ❌ Not Yet Connected (Using Mock Data)

**Student Pages:**
- ❌ Dashboard - Uses hardcoded mock data
- ❌ Resources - Newly created, not connected

**Admin Pages:**
- ❌ Analytics - Uses mock data
- ❌ Reports - Uses mock data
- ❌ Dashboard - Partially connected

**HR Pages:**
- ❌ Dashboard - Uses mock data

## 📋 What Needs to Be Done

### 1. PDF Download for Resume

**Required:** Install PDF generation library

```bash
npm install jspdf html2canvas
```

**Implementation:** Update Resources.tsx to use jsPDF

### 2. Auto-fill Resume from Student Profile

**Required:** Fetch student profile data and pre-populate form

**Backend:** Already has `/api/students/profile` endpoint

**Frontend:** Update Resources.tsx to fetch and use profile data

### 3. Connect Remaining Pages to Database

**Pages to Update:**
- Student Dashboard
- Admin Dashboard
- Admin Analytics
- Admin Reports
- HR Dashboard

## 🚀 Step-by-Step Implementation

### STEP 1: Install PDF Library

Run this command in your project root:

```bash
cd smart-campus-pathways-main
npm install jspdf html2canvas
```

### STEP 2: Update Resources Page

The Resources page needs to:
1. Fetch student profile on load
2. Pre-fill resume form with profile data
3. Generate PDF instead of HTML

**File to Update:** `src/pages/student/Resources.tsx`

**Changes Needed:**
- Add `useEffect` to fetch profile
- Import jsPDF library
- Update `handleDownloadResume` to generate PDF
- Pre-populate form fields

### STEP 3: Connect Student Dashboard

**File:** `src/pages/student/Dashboard.tsx`

**Current:** Uses hardcoded `studentProfile` object

**Needed:**
- Fetch student profile from `/api/students/profile`
- Fetch applications from `/api/applications/student`
- Calculate stats from real data

### STEP 4: Connect Admin Dashboard

**File:** `src/pages/admin/Dashboard.tsx`

**Needed Backend Endpoints:**
- GET `/api/admin/stats` - Overall statistics
- GET `/api/admin/recent-activities` - Recent activities

**Changes:**
- Fetch real stats from backend
- Display actual data instead of mock

### STEP 5: Connect Admin Analytics

**File:** `src/pages/admin/Analytics.tsx`

**Needed Backend Endpoints:**
- GET `/api/analytics/placement-stats`
- GET `/api/analytics/branch-wise`
- GET `/api/analytics/company-wise`

### STEP 6: Connect Admin Reports

**File:** `src/pages/admin/Reports.tsx`

**Needed:**
- Generate reports from real database data
- Export functionality

### STEP 7: Connect HR Dashboard

**File:** `src/pages/hr/Dashboard.tsx`

**Needed Backend Endpoint:**
- GET `/api/hr/stats` - HR-specific statistics

## 📝 Detailed Implementation for Each Step

### Implementation 1: PDF Download with Auto-fill

```typescript
// Add to Resources.tsx

import { useEffect } from 'react';
import { studentAPI } from '@/services/api';
import jsPDF from 'jspdf';

// Inside component, add state for profile
const [profileData, setProfileData] = useState<any>(null);

// Fetch profile on mount
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const data = await studentAPI.getProfile();
      setProfileData(data);
      
      // Pre-fill form with profile data
      setResumeData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        summary: data.about || '',
        skills: data.skills?.join(', ') || '',
        experience: '', // Can add to profile model
        education: `${data.branch} - CGPA: ${data.cgpa}`,
        projects: data.projects?.map(p => p.name).join('\n') || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };
  
  fetchProfile();
}, []);

// Update download function to generate PDF
const handleDownloadResume = () => {
  const doc = new jsPDF();
  
  // Add content to PDF
  doc.setFontSize(24);
  doc.text(resumeData.name, 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(resumeData.email, 105, 30, { align: 'center' });
  doc.text(resumeData.phone, 105, 37, { align: 'center' });
  
  // Add sections
  let yPos = 50;
  
  if (resumeData.summary) {
    doc.setFontSize(14);
    doc.text('Professional Summary', 20, yPos);
    yPos += 7;
    doc.setFontSize(11);
    const summaryLines = doc.splitTextToSize(resumeData.summary, 170);
    doc.text(summaryLines, 20, yPos);
    yPos += summaryLines.length * 5 + 10;
  }
  
  if (resumeData.skills) {
    doc.setFontSize(14);
    doc.text('Skills', 20, yPos);
    yPos += 7;
    doc.setFontSize(11);
    doc.text(resumeData.skills, 20, yPos);
    yPos += 10;
  }
  
  // Add more sections...
  
  // Save PDF
  doc.save(`${resumeData.name}_Resume.pdf`);
};
```

### Implementation 2: Connect Student Dashboard

```typescript
// Update Dashboard.tsx

import { useState, useEffect } from 'react';
import { studentAPI, applicationAPI } from '@/services/api';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, appsData] = await Promise.all([
          studentAPI.getProfile(),
          applicationAPI.getStudentApplications()
        ]);
        
        setProfile(profileData);
        setApplications(appsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate stats from real data
  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    interview: applications.filter(a => a.status === 'shortlisted').length,
    selected: applications.filter(a => a.status === 'selected').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  // Use real profile data
  const studentProfile = {
    name: profile?.name || 'Student',
    rollNumber: profile?.rollNumber || '',
    branch: profile?.branch || '',
    cgpa: profile?.cgpa || 0,
    skills: profile?.skills || [],
    appliedJobs: applications,
  };

  // Rest of component...
}
```

### Implementation 3: Backend Endpoints Needed

**File:** `backend/routes/admin.js` (or create if doesn't exist)

```javascript
// GET /api/admin/stats
router.get('/stats', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const [
      totalStudents,
      totalCompanies,
      totalDrives,
      totalApplications,
      placedStudents
    ] = await Promise.all([
      Student.countDocuments(),
      Company.countDocuments(),
      PlacementDrive.countDocuments(),
      Application.countDocuments(),
      Application.countDocuments({ status: 'selected' })
    ]);

    res.json({
      totalStudents,
      totalCompanies,
      totalDrives,
      totalApplications,
      placedStudents,
      placementRate: totalStudents > 0 
        ? ((placedStudents / totalStudents) * 100).toFixed(1) 
        : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});
```

**File:** `backend/routes/hr.js`

```javascript
// GET /api/hr/stats
router.get('/stats', authMiddleware, requireRole('hr'), async (req, res) => {
  try {
    const hr = await HR.findOne({ userId: req.user.id });
    
    const [
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      selectedApplications
    ] = await Promise.all([
      Application.countDocuments({ companyId: hr.companyId }),
      Application.countDocuments({ companyId: hr.companyId, status: 'applied' }),
      Application.countDocuments({ companyId: hr.companyId, status: 'shortlisted' }),
      Application.countDocuments({ companyId: hr.companyId, status: 'selected' })
    ]);

    res.json({
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      selectedApplications
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});
```

## 🎯 Priority Order

### High Priority (Do First)
1. ✅ **PDF Download** - Install library and update Resources.tsx
2. ✅ **Auto-fill Resume** - Fetch profile and pre-populate form
3. ✅ **Student Dashboard** - Connect to real data

### Medium Priority
4. **Admin Dashboard** - Add stats endpoint and connect
5. **HR Dashboard** - Add stats endpoint and connect

### Low Priority (Can do later)
6. **Admin Analytics** - Complex charts and reports
7. **Admin Reports** - Export functionality

## 📦 Required NPM Packages

```bash
# For PDF generation
npm install jspdf

# For HTML to PDF (alternative)
npm install html2pdf.js

# For better PDF with images
npm install jspdf html2canvas
```

## ✅ Testing Checklist

After implementing:

- [ ] PDF downloads correctly
- [ ] Resume auto-fills from profile
- [ ] Student dashboard shows real data
- [ ] Admin dashboard shows real stats
- [ ] HR dashboard shows real stats
- [ ] All pages load without errors
- [ ] Data updates in real-time
- [ ] No mock data remaining

## 🚀 Quick Start

1. **Install PDF library:**
   ```bash
   npm install jspdf html2canvas
   ```

2. **Update Resources.tsx** with PDF generation code

3. **Add profile fetch** to auto-fill resume

4. **Update dashboards** one by one

5. **Test thoroughly** after each change

## 📝 Summary

**Current State:**
- Most CRUD operations connected ✅
- Some dashboards use mock data ❌

**Target State:**
- All pages connected to MongoDB ✅
- PDF download working ✅
- Auto-fill from profile ✅
- Real-time data everywhere ✅

**Estimated Time:**
- PDF + Auto-fill: 30 minutes
- Student Dashboard: 20 minutes
- Admin/HR Dashboards: 40 minutes
- Testing: 30 minutes
- **Total: ~2 hours**

The system is already 80% connected to the database. Just need to complete the remaining dashboards and add PDF functionality!
