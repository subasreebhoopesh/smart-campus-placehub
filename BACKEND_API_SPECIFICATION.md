# Backend API Specification - Smart Campus Pathways

## 📋 Complete API Documentation

This document provides a comprehensive list of all API endpoints needed to connect the frontend to a backend system.

---

## 🔐 Authentication APIs

### 1. User Login
```
POST /api/auth/login
Body: {
  email: string,
  password: string,
  role: 'student' | 'admin'
}
Response: {
  success: boolean,
  token: string,
  user: {
    id: string,
    name: string,
    email: string,
    role: string,
    profileImage?: string
  }
}
```

### 2. User Logout
```
POST /api/auth/logout
Headers: { Authorization: 'Bearer <token>' }
Response: {
  success: boolean,
  message: string
}
```

### 3. Refresh Token
```
POST /api/auth/refresh
Body: { refreshToken: string }
Response: {
  success: boolean,
  token: string
}
```

### 4. Password Reset Request
```
POST /api/auth/forgot-password
Body: { email: string }
Response: {
  success: boolean,
  message: string
}
```

### 5. Password Reset
```
POST /api/auth/reset-password
Body: {
  token: string,
  newPassword: string
}
Response: {
  success: boolean,
  message: string
}
```

---

## 👨‍🎓 Student APIs

### Student Profile

#### 1. Get Student Profile
```
GET /api/student/profile
Headers: { Authorization: 'Bearer <token>' }
Response: {
  success: boolean,
  data: {
    id: string,
    name: string,
    rollNumber: string,
    email: string,
    phone: string,
    branch: string,
    cgpa: number,
    tenthPercentage: number,
    twelfthPercentage: number,
    linkedin?: string,
    github?: string,
    profileImage?: string,
    skills: string[],
    about: string,
    placementStatus: 'placed' | 'unplaced' | 'not-eligible',
    company?: string,
    package?: number,
    profileCompletion: number,
    education: Array<{
      degree: string,
      institution: string,
      year: string,
      grade: string
    }>,
    projects: Array<{
      name: string,
      description: string,
      technologies?: string[],
      link?: string
    }>
  }
}
```

#### 2. Update Student Profile
```
PUT /api/student/profile
Headers: { Authorization: 'Bearer <token>' }
Body: {
  name?: string,
  phone?: string,
  cgpa?: number,
  tenthPercentage?: number,
  twelfthPercentage?: number,
  linkedin?: string,
  github?: string,
  about?: string,
  skills?: string[],
  education?: Array<object>,
  projects?: Array<object>
}
Response: {
  success: boolean,
  message: string,
  data: StudentProfile
}
```

#### 3. Upload Profile Photo
```
POST /api/student/profile/photo
Headers: { 
  Authorization: 'Bearer <token>',
  Content-Type: 'multipart/form-data'
}
Body: FormData with 'photo' field
Response: {
  success: boolean,
  photoUrl: string,
  message: string
}
```

#### 4. Upload Resume
```
POST /api/student/profile/resume
Headers: { 
  Authorization: 'Bearer <token>',
  Content-Type: 'multipart/form-data'
}
Body: FormData with 'resume' field (PDF)
Response: {
  success: boolean,
  resumeUrl: string,
  message: string
}
```

### Student Dashboard

#### 5. Get Dashboard Data
```
GET /api/student/dashboard
Headers: { Authorization: 'Bearer <token>' }
Response: {
  success: boolean,
  data: {
    profile: {
      name: string,
      rollNumber: string,
      branch: string,
      cgpa: number,
      placementStatus: string,
      profileCompletion: number
    },
    stats: {
      jobsApplied: number,
      inInterview: number,
      eligibleDrives: number
    },
    appliedJobs: Array<{
      company: string,
      role: string,
      status: string,
      date: string
    }>,
    eligibleDrives: Array<PlacementDrive>,
    skills: string[]
  }
}
```

### Job Opportunities

#### 6. Get All Opportunities
```
GET /api/student/opportunities
Headers: { Authorization: 'Bearer <token>' }
Query: {
  search?: string,
  status?: 'all' | 'upcoming' | 'ongoing',
  branch?: string,
  minCgpa?: number
}
Response: {
  success: boolean,
  data: Array<{
    id: string,
    companyId: string,
    companyName: string,
    companyLogo?: string,
    jobRole: string,
    date: string,
    eligibleBranches: string[],
    minCgpa: number,
    packageOffered: number,
    status: 'upcoming' | 'ongoing' | 'completed',
    registeredStudents: number,
    description: string,
    requirements?: string[],
    location?: string
  }>
}
```

#### 7. Apply for Job
```
POST /api/student/applications
Headers: { Authorization: 'Bearer <token>' }
Body: {
  driveId: string,
  coverLetter?: string
}
Response: {
  success: boolean,
  message: string,
  applicationId: string
}
```

### Applications

#### 8. Get My Applications
```
GET /api/student/applications
Headers: { Authorization: 'Bearer <token>' }
Query: {
  status?: 'all' | 'applied' | 'interview' | 'selected' | 'rejected'
}
Response: {
  success: boolean,
  data: Array<{
    id: string,
    company: string,
    role: string,
    package: number,
    appliedDate: string,
    status: 'applied' | 'interview' | 'selected' | 'rejected',
    nextStep: string,
    interviewDate?: string,
    feedback?: string
  }>,
  stats: {
    total: number,
    applied: number,
    interview: number,
    selected: number,
    rejected: number
  }
}
```

#### 9. Withdraw Application
```
DELETE /api/student/applications/:applicationId
Headers: { Authorization: 'Bearer <token>' }
Response: {
  success: boolean,
  message: string
}
```

### Career Resources

#### 10. Get Interview Questions
```
GET /api/resources/interview-questions
Query: {
  category?: string,
  department?: string,
  jobRole?: string
}
Response: {
  success: boolean,
  data: Array<{
    id: string,
    question: string,
    answer: string,
    category: string,
    difficulty?: 'easy' | 'medium' | 'hard'
  }>
}
```

#### 11. Save Interview Questions
```
POST /api/student/saved-questions
Headers: { Authorization: 'Bearer <token>' }
Body: {
  questionIds: string[],
  department: string,
  jobRole: string
}
Response: {
  success: boolean,
  message: string
}
```

#### 12. Get Resume Templates
```
GET /api/resources/resume-templates
Query: { type?: string }
Response: {
  success: boolean,
  data: Array<{
    id: string,
    name: string,
    type: string,
    description: string,
    sections: string[],
    tips: string[],
    downloadUrl: string
  }>
}
```

#### 13. Download Resume Template
```
GET /api/resources/resume-templates/:templateId/download
Headers: { Authorization: 'Bearer <token>' }
Response: File download (PDF/DOCX)
```

#### 14. Get Mock Interview Types
```
GET /api/resources/mock-interviews
Response: {
  success: boolean,
  data: Array<{
    id: string,
    type: string,
    description: string,
    duration: string,
    format: string,
    topics: string[]
  }>
}
```

#### 15. Schedule Mock Interview
```
POST /api/student/mock-interviews
Headers: { Authorization: 'Bearer <token>' }
Body: {
  interviewTypeId: string,
  preferredDate: string,
  preferredTime: string,
  notes?: string
}
Response: {
  success: boolean,
  message: string,
  bookingId: string,
  scheduledDate: string
}
```

---

## 👨‍💼 Admin APIs

### Admin Dashboard

#### 16. Get Admin Dashboard Data
```
GET /api/admin/dashboard
Headers: { Authorization: 'Bearer <token>' }
Response: {
  success: boolean,
  data: {
    stats: {
      totalStudents: number,
      partnerCompanies: number,
      activeDrives: number,
      placementRate: number,
      changes: {
        students: string,
        companies: string,
        drives: string,
        placementRate: string
      }
    },
    recentActivities: Array<{
      id: string,
      type: 'placement' | 'drive' | 'registration' | 'company',
      message: string,
      timestamp: string
    }>,
    upcomingDrives: Array<PlacementDrive>
  }
}
```

### Student Management

#### 17. Get All Students
```
GET /api/admin/students
Headers: { Authorization: 'Bearer <token>' }
Query: {
  page?: number,
  limit?: number,
  search?: string,
  branch?: string,
  placementStatus?: string,
  minCgpa?: number,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
}
Response: {
  success: boolean,
  data: Array<Student>,
  pagination: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

#### 18. Get Student Details
```
GET /api/admin/students/:studentId
Headers: { Authorization: 'Bearer <token>' }
Response: {
  success: boolean,
  data: StudentProfile
}
```

#### 19. Update Student Status
```
PUT /api/admin/students/:studentId/status
Headers: { Authorization: 'Bearer <token>' }
Body: {
  placementStatus: 'placed' | 'unplaced' | 'not-eligible',
  company?: string,
  package?: number
}
Response: {
  success: boolean,
  message: string
}
```

#### 20. Delete Student
```
DELETE /api/admin/students/:studentId
Headers: { Authorization: 'Bearer <token>' }
Response: {
  success: boolean,
  message: string
}
```

### Company Management

#### 21. Get All Companies
```
GET /api/admin/companies
Headers: { Authorization: 'Bearer <token>' }
Query: {
  page?: number,
  limit?: number,
  search?: string,
  industry?: string
}
Response: {
  success: boolean,
  data: Array<{
    id: string,
    name: string,
    industry: string,
    website: string,
    logo?: string,
    contactPerson: string,
    contactEmail: string,
    contactPhone: string,
    jobRoles: string[],
    packageOffered: { min: number, max: number },
    visitHistory: Array<{
      date: string,
      studentsHired: number
    }>,
    createdAt: string
  }>,
  pagination: object
}
```

#### 22. Add Company
```
POST /api/admin/companies
Headers: { Authorization: 'Bearer <token>' }
Body: {
  name: string,
  industry: string,
  website: string,
  contactPerson: string,
  contactEmail: string,
  contactPhone: string,
  jobRoles: string[],
  packageOffered: { min: number, max: number }
}
Response: {
  success: boolean,
  message: string,
  companyId: string
}
```

#### 23. Update Company
```
PUT /api/admin/companies/:companyId
Headers: { Authorization: 'Bearer <token>' }
Body: Company fields to update
Response: {
  success: boolean,
  message: string
}
```

#### 24. Delete Company
```
DELETE /api/admin/companies/:companyId
Headers: { Authorization: 'Bearer <token>' }
Response: {
  success: boolean,
  message: string
}
```

### Placement Drives

#### 25. Get All Drives
```
GET /api/admin/drives
Headers: { Authorization: 'Bearer <token>' }
Query: {
  page?: number,
  limit?: number,
  status?: 'upcoming' | 'ongoing' | 'completed',
  companyId?: string
}
Response: {
  success: boolean,
  data: Array<PlacementDrive>,
  pagination: object
}
```

#### 26. Create Placement Drive
```
POST /api/admin/drives
Headers: { Authorization: 'Bearer <token>' }
Body: {
  companyId: string,
  jobRole: string,
  date: string,
  eligibleBranches: string[],
  minCgpa: number,
  packageOffered: number,
  description: string,
  requirements?: string[],
  location?: string
}
Response: {
  success: boolean,
  message: string,
  driveId: string
}
```

#### 27. Update Drive
```
PUT /api/admin/drives/:driveId
Headers: { Authorization: 'Bearer <token>' }
Body: Drive fields to update
Response: {
  success: boolean,
  message: string
}
```

#### 28. Update Drive Status
```
PUT /api/admin/drives/:driveId/status
Headers: { Authorization: 'Bearer <token>' }
Body: {
  status: 'upcoming' | 'ongoing' | 'completed'
}
Response: {
  success: boolean,
  message: string
}
```

#### 29. Get Drive Applications
```
GET /api/admin/drives/:driveId/applications
Headers: { Authorization: 'Bearer <token>' }
Query: {
  status?: string,
  branch?: string
}
Response: {
  success: boolean,
  data: Array<{
    applicationId: string,
    student: StudentProfile,
    appliedDate: string,
    status: string,
    interviewDate?: string
  }>
}
```

#### 30. Update Application Status
```
PUT /api/admin/applications/:applicationId/status
Headers: { Authorization: 'Bearer <token>' }
Body: {
  status: 'applied' | 'interview' | 'selected' | 'rejected',
  interviewDate?: string,
  feedback?: string
}
Response: {
  success: boolean,
  message: string
}
```

### Notifications

#### 31. Send Bulk Notifications
```
POST /api/admin/notifications/send
Headers: { Authorization: 'Bearer <token>' }
Body: {
  target: 'all' | 'placed' | 'unplaced' | 'cse' | 'it' | 'ece' | 'eee' | 'mech' | 'civil',
  message: string,
  title?: string,
  type?: 'email' | 'push' | 'both'
}
Response: {
  success: boolean,
  message: string,
  recipientCount: number,
  sentAt: string
}
```

#### 32. Get Notification History
```
GET /api/admin/notifications
Headers: { Authorization: 'Bearer <token>' }
Query: {
  page?: number,
  limit?: number
}
Response: {
  success: boolean,
  data: Array<{
    id: string,
    target: string,
    message: string,
    recipientCount: number,
    sentAt: string,
    sentBy: string
  }>,
  pagination: object
}
```

### Data Export

#### 33. Export Data
```
POST /api/admin/export
Headers: { Authorization: 'Bearer <token>' }
Body: {
  format: 'csv' | 'xlsx' | 'pdf' | 'json',
  dataTypes: Array<'students' | 'companies' | 'drives' | 'applications'>,
  filters?: {
    dateRange?: { start: string, end: string },
    branch?: string,
    status?: string
  }
}
Response: {
  success: boolean,
  downloadUrl: string,
  fileName: string,
  expiresAt: string
}
```

#### 34. Download Exported File
```
GET /api/admin/export/:fileId/download
Headers: { Authorization: 'Bearer <token>' }
Response: File download
```

### Analytics

#### 35. Get Analytics Data
```
GET /api/admin/analytics
Headers: { Authorization: 'Bearer <token>' }
Query: {
  type: 'branch-wise' | 'monthly' | 'package' | 'top-recruiters',
  year?: number
}
Response: {
  success: boolean,
  data: {
    branchWisePlacement?: Array<{
      branch: string,
      placed: number,
      total: number,
      percentage: number
    }>,
    monthlyPlacements?: Array<{
      month: string,
      placements: number
    }>,
    packageDistribution?: Array<{
      range: string,
      count: number
    }>,
    topRecruiters?: Array<{
      company: string,
      hires: number,
      avgPackage: number
    }>
  }
}
```

### Reports

#### 36. Generate Report
```
POST /api/admin/reports/generate
Headers: { Authorization: 'Bearer <token>' }
Body: {
  reportType: 'placement-summary' | 'company-wise' | 'branch-wise' | 'student-list',
  format: 'pdf' | 'xlsx',
  filters?: {
    year?: number,
    branch?: string,
    company?: string
  }
}
Response: {
  success: boolean,
  reportUrl: string,
  fileName: string
}
```

#### 37. Get Report History
```
GET /api/admin/reports
Headers: { Authorization: 'Bearer <token>' }
Query: {
  page?: number,
  limit?: number
}
Response: {
  success: boolean,
  data: Array<{
    id: string,
    reportType: string,
    generatedBy: string,
    generatedAt: string,
    downloadUrl: string
  }>,
  pagination: object
}
```

### Settings

#### 38. Get System Settings
```
GET /api/admin/settings
Headers: { Authorization: 'Bearer <token>' }
Response: {
  success: boolean,
  data: {
    collegeName: string,
    academicYear: string,
    defaultMinCgpa: number,
    contactEmail: string,
    maintenanceMode: boolean,
    emailNotifications: boolean,
    pushNotifications: boolean
  }
}
```

#### 39. Update System Settings
```
PUT /api/admin/settings
Headers: { Authorization: 'Bearer <token>' }
Body: Settings fields to update
Response: {
  success: boolean,
  message: string
}
```

#### 40. Update Admin Profile
```
PUT /api/admin/profile
Headers: { Authorization: 'Bearer <token>' }
Body: {
  firstName?: string,
  lastName?: string,
  email?: string,
  phone?: string,
  designation?: string
}
Response: {
  success: boolean,
  message: string
}
```

#### 41. Upload Admin Profile Photo
```
POST /api/admin/profile/photo
Headers: { 
  Authorization: 'Bearer <token>',
  Content-Type: 'multipart/form-data'
}
Body: FormData with 'photo' field
Response: {
  success: boolean,
  photoUrl: string
}
```

#### 42. Change Password
```
PUT /api/admin/profile/password
Headers: { Authorization: 'Bearer <token>' }
Body: {
  currentPassword: string,
  newPassword: string
}
Response: {
  success: boolean,
  message: string
}
```

---

## 📊 Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  }
}
```

### Pagination Format
```json
{
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10,
  "hasNext": true,
  "hasPrev": false
}
```

---

## 🔒 Authentication & Authorization

### Headers Required:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Token Expiry:
- Access Token: 1 hour
- Refresh Token: 7 days

### Role-Based Access:
- **Student Routes:** `/api/student/*` - Requires student role
- **Admin Routes:** `/api/admin/*` - Requires admin role
- **Public Routes:** `/api/auth/*`, `/api/resources/*` - No auth required

---

## 📝 Data Models

### Student Model
```typescript
interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  phone: string;
  branch: 'CSE' | 'IT' | 'ECE' | 'EEE' | 'MECH' | 'CIVIL';
  cgpa: number;
  tenthPercentage: number;
  twelfthPercentage: number;
  profileImage?: string;
  resumeUrl?: string;
  skills: string[];
  about: string;
  linkedin?: string;
  github?: string;
  placementStatus: 'placed' | 'unplaced' | 'not-eligible';
  company?: string;
  package?: number;
  education: Education[];
  projects: Project[];
  createdAt: string;
  updatedAt: string;
}
```

### Company Model
```typescript
interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  logo?: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  jobRoles: string[];
  packageOffered: {
    min: number;
    max: number;
  };
  visitHistory: Array<{
    date: string;
    studentsHired: number;
  }>;
  createdAt: string;
}
```

### Placement Drive Model
```typescript
interface PlacementDrive {
  id: string;
  companyId: string;
  companyName: string;
  jobRole: string;
  date: string;
  eligibleBranches: string[];
  minCgpa: number;
  packageOffered: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  registeredStudents: number;
  selectedStudents: number;
  description: string;
  requirements?: string[];
  location?: string;
  createdAt: string;
}
```

### Application Model
```typescript
interface Application {
  id: string;
  studentId: string;
  driveId: string;
  company: string;
  role: string;
  package: number;
  appliedDate: string;
  status: 'applied' | 'interview' | 'selected' | 'rejected';
  interviewDate?: string;
  feedback?: string;
  nextStep: string;
}
```

---

## 🚀 Implementation Priority

### Phase 1 - Core Features (Week 1-2)
1. Authentication APIs (1-5)
2. Student Profile APIs (1-4)
3. Student Dashboard API (5)
4. Job Opportunities APIs (6-7)

### Phase 2 - Applications & Resources (Week 3-4)
5. Applications APIs (8-9)
6. Career Resources APIs (10-15)
7. Admin Dashboard API (16)
8. Student Management APIs (17-20)

### Phase 3 - Admin Features (Week 5-6)
9. Company Management APIs (21-24)
10. Placement Drives APIs (25-30)
11. Notifications APIs (31-32)
12. Data Export APIs (33-34)

### Phase 4 - Analytics & Reports (Week 7-8)
13. Analytics APIs (35)
14. Reports APIs (36-37)
15. Settings APIs (38-42)

---

## 🛠️ Technology Stack Recommendations

### Backend Framework:
- **Node.js + Express.js** (Recommended)
- **Python + FastAPI** (Alternative)
- **Java + Spring Boot** (Enterprise)

### Database:
- **PostgreSQL** (Relational data)
- **MongoDB** (Document store)
- **Redis** (Caching)

### File Storage:
- **AWS S3** (Cloud storage)
- **Cloudinary** (Image optimization)
- **Local Storage** (Development)

### Authentication:
- **JWT** (JSON Web Tokens)
- **bcrypt** (Password hashing)
- **OAuth 2.0** (Social login - optional)

### Email Service:
- **SendGrid**
- **AWS SES**
- **Nodemailer**

### Real-time Features:
- **Socket.io** (WebSockets)
- **Server-Sent Events** (SSE)

---

## 📚 API Documentation Tools

### Recommended Tools:
1. **Swagger/OpenAPI** - Interactive API documentation
2. **Postman** - API testing and documentation
3. **Insomnia** - REST client
4. **API Blueprint** - API design

### Generate Swagger Documentation:
```yaml
openapi: 3.0.0
info:
  title: Smart Campus Pathways API
  version: 1.0.0
  description: Complete API for placement management system
servers:
  - url: http://localhost:3000/api
    description: Development server
  - url: https://api.smartcampus.com/api
    description: Production server
```

---

## 🧪 Testing

### API Testing Checklist:
- [ ] All endpoints return correct status codes
- [ ] Authentication works properly
- [ ] Authorization checks role-based access
- [ ] Validation errors return proper messages
- [ ] File uploads work correctly
- [ ] Pagination works as expected
- [ ] Search and filters function properly
- [ ] Data export generates correct files
- [ ] Email notifications are sent
- [ ] Error handling is consistent

### Testing Tools:
- **Jest** - Unit testing
- **Supertest** - API testing
- **Postman** - Manual testing
- **Artillery** - Load testing

---

## 📖 Next Steps

1. **Choose Backend Stack** - Select framework and database
2. **Setup Project** - Initialize backend project
3. **Implement Authentication** - Start with auth APIs
4. **Create Database Schema** - Design tables/collections
5. **Implement Core APIs** - Follow priority order
6. **Test APIs** - Use Postman/Swagger
7. **Connect Frontend** - Update frontend to use APIs
8. **Deploy** - Deploy to production server

---

## 📞 Support

For backend implementation support:
- Review this specification document
- Check API examples in Postman collection
- Refer to data models for database schema
- Follow implementation priority for phased development

---

**Total APIs: 42 endpoints**
**Estimated Development Time: 8 weeks**
**Team Size: 2-3 backend developers**

Ready for backend development! 🚀
