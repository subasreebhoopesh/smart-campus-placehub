# HR Profile Page - Implementation Plan

## Current Issue:
- HR clicks "Profile" in dropdown menu
- Gets 404 error - page doesn't exist
- Need to create HR Profile page

## What to Create:

### 1. HR Profile Page
**File**: `src/pages/hr/Profile.tsx`

**Sections to Include**:

#### A. HR Information
- Name
- Email
- Company Name
- Role/Position
- Years of Experience
- Contact Information

#### B. Company Information
- Company Name
- Industry
- Location
- Website
- About Company

#### C. Active Job Openings
Show all placement drives for this HR's company:
- Job Role
- Required Skills
- Eligible Branches
- Min CGPA
- Package Offered
- Drive Date
- Status
- Number of Applications
- Number of Shortlisted
- Number of Selected

#### D. Recruitment Statistics
- Total Drives Conducted
- Total Applications Received
- Total Students Shortlisted
- Total Students Selected
- Average Package Offered

### 2. Add Route
**File**: `src/App.tsx`

Add route: `/hr/profile`

### 3. Backend Support
**File**: `backend/routes/hr-mongodb.js`

Add endpoint: `GET /api/hr/profile`

Returns:
- HR information
- Company information
- Active job openings
- Recruitment statistics

## Page Layout:

```
┌─────────────────────────────────────────────┐
│  HR Profile                                 │
├─────────────────────────────────────────────┤
│                                             │
│  HR Information                             │
│  Name: Wipro HR                             │
│  Email: hr@wipro.com                        │
│  Company: Wipro                             │
│  Experience: 5 years                        │
│                                             │
│  Company Information                        │
│  Industry: IT Services                      │
│  Location: Bangalore                        │
│  Website: wipro.com                         │
│                                             │
│  Active Job Openings (3)                    │
│  ┌─────────────────────────────────────┐   │
│  │ Software Engineer                   │   │
│  │ Skills: Java, Spring, MySQL         │   │
│  │ Package: 6-8 LPA                    │   │
│  │ Applications: 25 | Selected: 3      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Recruitment Statistics                     │
│  Total Drives: 5                            │
│  Total Applications: 120                    │
│  Total Selected: 15                         │
│  Avg Package: 7.5 LPA                       │
│                                             │
└─────────────────────────────────────────────┘
```

## Implementation Steps:

1. Create HR Profile page component
2. Add backend endpoint for HR profile data
3. Add route in App.tsx
4. Update Sidebar to highlight Profile when active
5. Fetch and display real data from MongoDB

## Data Sources:

### HR Information:
- From `User` collection (HR user data)
- From `HR` collection (HR-specific data)

### Company Information:
- From `Company` collection

### Job Openings:
- From `PlacementDrive` collection
- Filter by HR's companyId
- Include application statistics

### Statistics:
- Aggregate from `Application` collection
- Count by status for this company

Let's implement this!
