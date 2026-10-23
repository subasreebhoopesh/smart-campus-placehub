# PlaceHub - Smart Campus Placement Portal
## Complete Project Documentation

---

## 1. PROJECT OVERVIEW

**Project Name:** PlaceHub - Smart Campus Placement Management System

**Description:** A full-stack web application designed to streamline the campus placement process for colleges. The system connects three key stakeholders - College Administrators, Company HR Representatives, and Students - through an intelligent, automated platform.

**Tech Stack:**
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (with Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens)
- **Architecture:** MERN Stack with REST API

---

## 2. SYSTEM ARCHITECTURE

### 2.1 Frontend Architecture
```
src/
├── pages/              # Page components
│   ├── admin/         # Admin dashboard pages
│   ├── hr/            # HR dashboard pages
│   └── student/       # Student dashboard pages
├── components/        # Reusable UI components
│   ├── layout/        # Layout components (Sidebar, TopNav)
│   └── ui/            # shadcn/ui components
├── contexts/          # React Context for state management
├── services/          # API service layer
└── lib/               # Utility functions
```

### 2.2 Backend Architecture
```
backend/
├── config/            # Database configuration
├── models/            # Mongoose schemas
├── routes/            # API route handlers
├── middleware/        # Authentication middleware
├── utils/             # Helper utilities
│   ├── skillMatcher.js    # AI skill matching
│   ├── studentRanking.js  # Student ranking algorithm
│   ├── emailService.js    # Email notifications
│   └── notificationHelper.js
└── server.js          # Express server entry point
```

### 2.3 Database Schema (MongoDB)

**Collections:**
- Users (Admin, HR, Students)
- Students (profiles, skills, documents)
- Companies (company details, required skills)
- PlacementDrives (job postings)
- Applications (student applications)
- Notifications (real-time alerts)
- Messages (chat system)
- Documents (verification system)
- Assessments (online tests)
- Interviews (scheduling)

---

## 3. KEY FEATURES

### 3.1 Admin Module
1. **Dashboard**
   - Real-time placement statistics
   - Student placement tracking
   - Company partnership overview
   - Recent activities feed

2. **Student Management**
   - View all student profiles
   - Track application status
   - Monitor placement progress
   - Generate reports

3. **Company Management**
   - Add/Edit company profiles
   - Manage placement drives
   - Track company engagement

4. **HR Credentials**
   - Create HR accounts for companies
   - Manage HR access
   - Monitor HR activities

5. **Analytics & Reports**
   - Placement statistics
   - Department-wise analysis
   - Company-wise reports
   - PDF/CSV export functionality

6. **Document Verification**
   - Verify student documents
   - Approve/Reject submissions
   - Track verification status

7. **Notifications**
   - Send announcements
   - Track notification status
   - Real-time alerts

### 3.2 HR Module
1. **Dashboard**
   - Application tracking
   - Student shortlisting
   - Placement statistics

2. **Required Skills Management**
   - Set company-specific skill requirements
   - Update skill criteria
   - View skill match analytics

3. **Applications Review**
   - View all applications
   - See skill match percentage
   - Shortlist/Reject candidates
   - Add remarks

4. **Student Profiles**
   - View detailed student information
   - Download resumes
   - Check skill compatibility
   - View academic performance

5. **Interview Scheduling**
   - Schedule interviews
   - Send interview notifications
   - Track interview status

6. **Chat System**
   - Direct messaging with students
   - Real-time communication
   - Message history

### 3.3 Student Module
1. **Dashboard**
   - Personalized opportunities
   - Application status
   - Upcoming interviews
   - Quick stats

2. **Profile Management**
   - Edit personal information
   - Upload profile photo
   - Add skills
   - Update academic details

3. **Resume Builder**
   - Professional resume templates
   - Auto-fill from profile
   - Download as PDF
   - Multiple formats

4. **Opportunities**
   - Browse placement drives
   - Filter by company/role
   - View job details
   - One-click apply

5. **My Applications**
   - Track application status
   - View skill match percentage
   - See HR/Admin remarks
   - Application timeline

6. **Documents**
   - Upload required documents
   - Track verification status
   - Document management

7. **Assessments**
   - Take online tests
   - View results
   - Practice assessments

8. **Chat**
   - Message with HR
   - Real-time communication
   - Notification alerts

9. **Resources**
   - Preparation materials
   - Interview tips
   - Company information

---

## 4. AI-POWERED FEATURES

### 4.1 Intelligent Skill Matching System
**Algorithm:** Compares student skills with company requirements

**Process:**
1. HR sets required skills for job posting
2. Student adds skills to profile
3. System calculates match percentage
4. Auto-shortlisting/selection based on threshold

**Match Calculation:**
- Case-insensitive comparison
- Partial matching support (React matches React.js)
- Percentage-based scoring

**Thresholds:**
- **≥75%:** Auto-Selected ✅
- **≥70%:** Auto-Shortlisted 🎉
- **<70%:** Manual Review Required 📝

**Files:**
- `backend/utils/skillMatcher.js`

### 4.2 Student Ranking Algorithm
**Criteria (100 points total):**
- CGPA: 30 points
- Skills Match: 25 points
- Projects: 20 points
- Academic Performance (10th/12th): 15 points
- Profile Completeness: 10 points

**Features:**
- Company-specific ranking
- Real-time score calculation
- Top N students identification
- Rank breakdown analysis

**Files:**
- `backend/utils/studentRanking.js`

### 4.3 Auto-Selection System
**Features:**
- Automatic candidate selection based on skill match
- Instant notifications to all stakeholders
- Placement count auto-update
- Audit trail maintenance

**Benefits:**
- Faster hiring process
- Fair and objective selection
- Reduced manual effort
- Transparent evaluation

---

## 5. DATABASE MODELS

### 5.1 User Model
```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String (admin/hr/student),
  profilePhotoUrl: String
}
```

### 5.2 Student Model
```javascript
{
  userId: ObjectId,
  rollNumber: String (unique),
  name: String,
  branch: String,
  year: Number,
  cgpa: Number,
  tenthPercentage: Number,
  twelfthPercentage: Number,
  skills: [String],
  projects: [Object],
  resumeUrl: String,
  phone: String,
  linkedin: String,
  github: String,
  about: String
}
```

### 5.3 Company Model
```javascript
{
  name: String,
  industry: String,
  website: String,
  contactPerson: String,
  contactEmail: String,
  contactPhone: String,
  jobRoles: [String],
  packageOffered: {min: Number, max: Number},
  requiredSkills: [String],
  visitHistory: [Date]
}
```

### 5.4 PlacementDrive Model
```javascript
{
  companyId: ObjectId,
  role: String,
  description: String,
  eligibilityCriteria: Object,
  requiredSkills: [String],
  packageOffered: Number,
  openDate: Date,
  closeDate: Date,
  status: String (upcoming/ongoing/closed),
  registeredStudents: Number,
  selectedStudents: Number
}
```

### 5.5 Application Model
```javascript
{
  studentId: ObjectId,
  driveId: ObjectId,
  companyId: ObjectId,
  status: String (applied/shortlisted/selected/rejected),
  skillMatchPercentage: Number,
  matchedSkills: [String],
  missingSkills: [String],
  autoShortlisted: Boolean,
  remarks: String,
  adminRemarks: String,
  hrRemarks: String,
  appliedDate: Date
}
```

---

## 6. API ENDPOINTS

### 6.1 Authentication
```
POST /api/auth/login              - User login
POST /api/auth/register           - Student registration
POST /api/auth/logout             - User logout
GET  /api/auth/verify             - Verify JWT token
```

### 6.2 Student APIs
```
GET    /api/students              - Get all students (Admin)
GET    /api/students/:id          - Get student details
PUT    /api/students/:id          - Update student profile
POST   /api/students/skills       - Add skills
POST   /api/students/photo        - Upload profile photo
```

### 6.3 Company APIs
```
GET    /api/companies             - Get all companies
POST   /api/companies             - Add new company (Admin)
PUT    /api/companies/:id         - Update company
DELETE /api/companies/:id         - Delete company
```

### 6.4 Placement Drive APIs
```
GET    /api/drives                - Get all drives
POST   /api/drives                - Create drive (Admin)
GET    /api/drives/:id            - Get drive details
PUT    /api/drives/:id            - Update drive
DELETE /api/drives/:id            - Delete drive
```

### 6.5 Application APIs
```
POST   /api/applications          - Apply for drive
GET    /api/applications/student  - Get student applications
GET    /api/applications/hr       - Get company applications
GET    /api/applications/admin/all - Get all applications
PUT    /api/applications/:id      - Update application status
```

### 6.6 HR APIs
```
GET    /api/hr/skills             - Get company required skills
POST   /api/hr/skills             - Set required skills
GET    /api/hr/stats              - Get HR dashboard stats
GET    /api/hr/applications       - Get applications for company
```

### 6.7 Notification APIs
```
GET    /api/notifications         - Get user notifications
POST   /api/notifications         - Create notification
PUT    /api/notifications/:id/read - Mark as read
DELETE /api/notifications/:id     - Delete notification
```

### 6.8 Document APIs
```
GET    /api/documents             - Get student documents
POST   /api/documents             - Upload document
PUT    /api/documents/:id/verify  - Verify document (Admin)
DELETE /api/documents/:id         - Delete document
```

### 6.9 Assessment APIs
```
GET    /api/assessments           - Get all assessments
POST   /api/assessments           - Create assessment (Admin)
GET    /api/assessments/:id       - Get assessment details
POST   /api/assessments/:id/submit - Submit assessment
GET    /api/assessments/results   - Get results
```

### 6.10 Chat APIs
```
GET    /api/messages              - Get messages
POST   /api/messages              - Send message
GET    /api/messages/users        - Get chat users
PUT    /api/messages/:id/read     - Mark as read
```

---

## 7. AUTHENTICATION & SECURITY

### 7.1 JWT Authentication
- Token-based authentication
- Stored in localStorage
- Sent in Authorization header
- Middleware validation on protected routes

### 7.2 Password Security
- Bcrypt hashing (salt rounds: 10)
- No plain-text storage
- Secure password reset flow

### 7.3 Role-Based Access Control
- Admin: Full system access
- HR: Company-specific access
- Student: Own profile access only

### 7.4 API Security
- CORS configuration
- Helmet for HTTP headers
- Request rate limiting
- Input validation
- SQL injection prevention

---

## 8. FRONTEND LIBRARIES

### 8.1 Core Libraries
- React 18.3.1
- React Router DOM 6.30.1
- TypeScript 5.8.3
- Vite 5.4.19

### 8.2 UI Components
- @radix-ui/* (30+ components)
- shadcn/ui components
- Lucide React (icons)
- Tailwind CSS 3.4.17
- tailwindcss-animate

### 8.3 Form Handling
- React Hook Form 7.61.1
- Zod 3.25.76 (validation)
- @hookform/resolvers

### 8.4 Charts & Visualization
- Recharts 2.15.4

### 8.5 PDF Generation
- jspdf 4.1.0
- jspdf-autotable 5.0.7
- html2pdf.js 0.14.0
- html2canvas 1.4.1

### 8.6 State Management
- TanStack Query 5.83.0
- React Context API

---

## 9. BACKEND DEPENDENCIES

### 9.1 Core
- Express.js 4.x
- Node.js 18+
- Mongoose 8.x

### 9.2 Authentication
- jsonwebtoken
- bcrypt/bcryptjs

### 9.3 File Upload
- multer

### 9.4 Security
- helmet
- cors
- express-rate-limit

### 9.5 Email
- nodemailer

### 9.6 Utilities
- dotenv
- compression

---

## 10. INSTALLATION & SETUP

### 10.1 Prerequisites
```bash
Node.js v18 or higher
MongoDB (local or Atlas)
Git
```

### 10.2 Installation Steps

**1. Clone Repository**
```bash
git clone <repository-url>
cd smart-campus-pathways
```

**2. Install Dependencies**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

**3. Environment Configuration**

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3001
```

**Backend (backend/.env):**
```
PORT=3001
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=mongodb://localhost:27017/placement_portal
NODE_ENV=development
```

**4. Seed Admin User**
```bash
cd backend
node seed-admin.js
cd ..
```

**5. Start Servers**

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**6. Access Application**
```
Frontend: http://localhost:8080
Backend API: http://localhost:3001
```

---

## 11. DEFAULT CREDENTIALS

### 11.1 Admin Login
```
Email: admin@college.edu
Password: admin123
```

### 11.2 Student Registration
Students can self-register through the Student Login page

### 11.3 HR Accounts
Created by Admin through HR Credentials section

---

## 12. PROJECT STRUCTURE

```
smart-campus-pathways/
├── src/                    # React frontend
│   ├── pages/              # All page components
│   │   ├── admin/          # Admin pages
│   │   ├── hr/             # HR pages
│   │   └── student/        # Student pages
│   ├── components/         # Reusable components
│   │   ├── layout/         # Layout components
│   │   └── ui/             # UI components
│   ├── contexts/           # React contexts
│   ├── services/           # API services
│   ├── lib/                # Utilities
│   ├── hooks/              # Custom hooks
│   └── App.tsx             # Main app component
├── backend/                # Express backend
│   ├── config/             # Configuration
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Middlewares
│   ├── utils/              # Utilities
│   ├── uploads/            # Uploaded files
│   └── server.js           # Server entry
├── public/                 # Static files
├── package.json            # Frontend dependencies
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

---

## 13. NOTIFICATION SYSTEM

### 13.1 Notification Types
- Application updates
- Placement notifications
- Auto-shortlist alerts
- Interview schedules
- Admin announcements
- Document verification status
- Chat messages

### 13.2 Notification Delivery
- Real-time in-app notifications
- Bell icon with unread count
- Notification dropdown
- Priority-based sorting
- Mark as read functionality

### 13.3 Notification Triggers
- Student applies for job
- HR updates application status
- Admin marks student as placed
- Auto-selection/shortlisting occurs
- Interview scheduled
- Document verified

---

## 14. CHAT SYSTEM

### 14.1 Features
- Real-time messaging
- Student-HR communication
- Message history
- Unread message indicators
- Online/offline status
- Message timestamps

### 14.2 Implementation
- REST API based
- MongoDB message storage
- Read receipt tracking
- User list with last message
- Search functionality

---

## 15. DOCUMENT VERIFICATION

### 15.1 Document Types
- Resume/CV
- 10th Marksheet
- 12th Marksheet
- Degree Certificate
- ID Proof
- Other documents

### 15.2 Verification Flow
1. Student uploads documents
2. Admin reviews submissions
3. Admin approves/rejects with remarks
4. Student receives notification
5. Status updated in profile

---

## 16. ASSESSMENT SYSTEM

### 16.1 Features
- Online test creation
- Multiple choice questions
- Timer-based tests
- Auto-grading
- Result analytics
- Question bank

### 16.2 Assessment Flow
1. Admin creates assessment
2. Students take test
3. Auto-grading on submission
4. Results stored
5. Performance analytics

---

## 17. DEPLOYMENT

### 17.1 Frontend Deployment
**Platforms:** Netlify, Vercel, Render
```bash
npm run build
# Deploy dist folder
```

### 17.2 Backend Deployment
**Platforms:** Render, Railway, Heroku
```bash
# Set environment variables
# Deploy backend folder
```

### 17.3 Database
**Options:** MongoDB Atlas (recommended)
```
Create free cluster
Get connection string
Update MONGODB_URI
```

---

## 18. TESTING

### 18.1 Test Credentials Available
Multiple test users for each role with sample data

### 18.2 Test Scripts
```bash
# Test skill matching
node backend/test-auto-selection.js

# Test notifications
node backend/test-notifications.js

# Test authentication
node backend/test-login.js
```

---

## 19. PERFORMANCE OPTIMIZATION

### 19.1 Frontend
- Code splitting
- Lazy loading
- Image optimization
- Caching strategies
- Minification & compression

### 19.2 Backend
- Database indexing
- Query optimization
- Response compression
- Connection pooling
- Caching

### 19.3 Database
- Indexed fields
- Aggregation pipelines
- Efficient queries
- Connection limits

---

## 20. FUTURE ENHANCEMENTS

1. **Resume Parsing**
   - Auto-extract skills from PDF
   - Parse education details
   - Work experience extraction

2. **Advanced AI Features**
   - ML-based candidate recommendation
   - Predictive analytics
   - Skill gap analysis

3. **Real-time Features**
   - WebSocket integration
   - Live interview scheduling
   - Real-time dashboard updates

4. **Mobile Application**
   - React Native app
   - Push notifications
   - Offline support

5. **Analytics Dashboard**
   - Advanced reporting
   - Data visualization
   - Export options

6. **Integration**
   - LinkedIn integration
   - Google Calendar sync
   - Email automation

---

## 21. SUPPORT & MAINTENANCE

### 21.1 Logging
- Server logs
- Error tracking
- Activity monitoring

### 21.2 Backup
- Database backup scripts
- Automated backups
- Recovery procedures

### 21.3 Updates
- Dependency updates
- Security patches
- Feature additions

---

## 22. CONTACT & LICENSE

**Project Type:** College Placement Management System
**Architecture:** MERN Stack (MongoDB, Express, React, Node.js)
**Status:** Production Ready ✅

---

**END OF DOCUMENTATION**
