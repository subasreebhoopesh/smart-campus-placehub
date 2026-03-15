# Smart Campus Pathways - Complete System Documentation

## System Overview

A complete placement management system with MongoDB backend integration. The system supports three user roles: Admin, HR, and Student, each with specific functionalities.

## Architecture

### Frontend (React + TypeScript)
- Port: 8080
- Framework: React with Vite
- UI: Tailwind CSS + shadcn/ui components
- State Management: React Context API
- Routing: React Router

### Backend (Node.js + Express)
- Port: 3001
- Framework: Express.js
- Database: MongoDB (localhost:27017)
- Authentication: JWT tokens
- Password Hashing: bcrypt

### Database (MongoDB)
- Database Name: placement_portal
- Collections: users, students, companies, placementdrives, applications, hrs

## User Roles & Features

### 1. Admin
**Login:** admin@college.edu / admin123

**Features:**
- Dashboard with analytics
- Company Management (CRUD)
- Placement Drive Management (CRUD)
- Student Management (view all students)
- HR Credentials Management
- Reports and Analytics
- System Settings

**Access:** `/admin-login`

### 2. HR (Human Resources)
**Login:** Created by admin via backend script

**Features:**
- Dashboard with company-specific stats
- View Applications (only for their company)
- Review Student Profiles
- Shortlist/Select/Reject Applications
- Add Remarks to Applications
- Set Required Skills
- Skill-based Candidate Matching

**Access:** `/hr-login`

**Key Feature:** Each HR is linked to a specific company and can only see applications for their company's drives.

### 3. Student
**Login:** Self-registration

**Features:**
- Dashboard with placement stats
- Complete Profile (CGPA, skills, projects, resume)
- View Available Opportunities (filtered by eligibility)
- Apply to Placement Drives
- Track Application Status
- View Application Remarks/Feedback

**Access:** `/student-login` or `/student-register`

## Complete Data Flow

### Scenario: Student Applies to a Job

1. **Admin Creates Company**
   - Admin logs in
   - Creates company (e.g., "Google")
   - Company stored in MongoDB

2. **Admin Creates HR Account**
   ```bash
   node create-hr.js hr@google.com hr123 "Google HR" "Google"
   ```
   - User created with role 'hr'
   - HR profile linked to Google company
   - HR can now login

3. **Admin Creates Placement Drive**
   - Admin creates drive for Google
   - Sets: job role, eligible branches, min CGPA, package
   - Drive stored with companyId reference

4. **Student Registers**
   - Student fills registration form
   - User + Student profile created
   - Auto-login after registration

5. **Student Completes Profile**
   - Adds CGPA, skills, projects
   - Uploads resume
   - Profile updated in MongoDB

6. **Student Views Opportunities**
   - System fetches drives from MongoDB
   - Filters by student's branch and CGPA
   - Shows eligible drives only

7. **Student Applies**
   - Clicks "Apply Now"
   - Application created with:
     - studentId (reference)
     - driveId (reference)
     - companyId (from drive)
     - status: "applied"
   - Drive's registered count incremented

8. **HR Views Applications**
   - HR logs in
   - System finds HR's company
   - Fetches applications where companyId matches
   - Populates student details (name, email, skills, etc.)
   - Shows in Applications page

9. **HR Reviews & Shortlists**
   - HR views complete student profile
   - Sees skill match percentage
   - Updates status to "shortlisted"
   - Adds remarks
   - Student sees updated status

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String (admin/hr/student),
  createdAt: Date
}
```

### Students Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  rollNumber: String (unique),
  branch: String,
  cgpa: Number,
  skills: [String],
  projects: [{
    name: String,
    description: String,
    technologies: String,
    link: String
  }],
  resumeUrl: String,
  profilePhotoUrl: String,
  tenthPercentage: Number,
  twelfthPercentage: Number,
  phone: String,
  linkedin: String,
  github: String,
  about: String,
  createdAt: Date
}
```

### Companies Collection
```javascript
{
  _id: ObjectId,
  name: String,
  industry: String,
  website: String,
  location: String,
  description: String,
  contactPerson: String,
  contactEmail: String,
  contactPhone: String,
  jobRoles: [String],
  packageOffered: String,
  visitHistory: [String],
  createdAt: Date
}
```

### PlacementDrives Collection
```javascript
{
  _id: ObjectId,
  companyId: ObjectId (ref: Company),
  jobRole: String,
  description: String,
  eligibleBranches: [String],
  minCgpa: Number,
  packageOffered: String,
  driveDate: Date,
  status: String (upcoming/ongoing/completed),
  registeredStudents: Number,
  selectedStudents: Number,
  createdAt: Date
}
```

### Applications Collection
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: Student),
  driveId: ObjectId (ref: PlacementDrive),
  companyId: ObjectId (ref: Company),
  status: String (applied/shortlisted/selected/rejected/on hold),
  remarks: String,
  appliedDate: Date
}
```

### HRs Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  companyId: ObjectId (ref: Company),
  createdAt: Date
}
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Companies
- `GET /api/companies` - Get all companies
- `POST /api/companies` - Create company (admin)
- `PUT /api/companies/:id` - Update company (admin)
- `DELETE /api/companies/:id` - Delete company (admin)

### Placement Drives
- `GET /api/drives` - Get all drives
- `POST /api/drives` - Create drive (admin)
- `PUT /api/drives/:id` - Update drive (admin)
- `DELETE /api/drives/:id` - Delete drive (admin)

### Applications
- `POST /api/applications` - Apply to drive (student)
- `GET /api/applications/student` - Get student's applications
- `GET /api/applications/hr` - Get HR's company applications
- `PUT /api/applications/:id/status` - Update status (HR)

### Students
- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile` - Update student profile
- `POST /api/students/resume` - Upload resume
- `POST /api/students/profile-photo` - Upload photo

## Setup Instructions

### 1. Install Dependencies
```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### 2. Start MongoDB
```bash
mongod
```

### 3. Create Admin Account
```bash
cd backend
node seed-admin.js
```

### 4. Start Backend Server
```bash
cd backend
npm start
```

### 5. Start Frontend
```bash
npm run dev
```

### 6. Access Application
- Frontend: http://localhost:8080
- Backend: http://localhost:3001
- Admin: http://localhost:8080/admin-login

## Creating HR Accounts

HR accounts must be created via backend script:

```bash
cd backend
node create-hr.js <email> <password> <name> <companyName>
```

**Example:**
```bash
node create-hr.js hr@google.com hr123 "Google HR" "Google"
```

**Note:** Company must exist before creating HR account.

## Key Features Implemented

### ✅ Complete Backend Integration
- All data stored in MongoDB
- No localStorage for critical data
- Real-time data synchronization

### ✅ Company-Specific HR Access
- Each HR linked to specific company
- HR sees only their company's applications
- Secure company-based filtering

### ✅ Student Profile Management
- Complete profile with skills, projects
- Resume and photo upload
- Academic records (10th, 12th, CGPA)
- Contact information

### ✅ Eligibility Filtering
- Drives filtered by branch
- CGPA-based eligibility
- Real-time availability check

### ✅ Application Management
- Students can apply to drives
- Track application status
- View feedback from HR

### ✅ Skill-Based Matching
- HR sets required skills
- System calculates match percentage
- Highlights matching candidates

### ✅ Status Management
- Applied → Shortlisted → Selected
- Rejected / On Hold options
- Remarks and feedback

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Company-based data isolation
- Protected API routes

## Testing Checklist

- [ ] Admin can login
- [ ] Admin can create companies
- [ ] Admin can create drives
- [ ] HR account can be created via script
- [ ] HR can login
- [ ] HR sees only their company's applications
- [ ] Student can register
- [ ] Student can complete profile
- [ ] Student sees eligible drives
- [ ] Student can apply to drives
- [ ] HR sees student applications
- [ ] HR can update application status
- [ ] Skill matching works correctly
- [ ] All data persists in MongoDB

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify port 3001 is available
- Check .env file configuration

### HR sees no applications
- Verify HR is linked to correct company
- Check if drives exist for that company
- Ensure students have applied
- Check backend console logs

### Student can't see drives
- Check branch eligibility
- Verify CGPA meets minimum
- Ensure drive status is "upcoming"

### Login fails
- Verify credentials are correct
- Check if backend is running
- Check MongoDB connection
- View browser console for errors

## File Structure

```
smart-campus-pathways-main/
├── backend/
│   ├── config/
│   │   └── database-mongodb.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Company.js
│   │   ├── PlacementDrive.js
│   │   ├── Application.js
│   │   └── HR.js
│   ├── routes/
│   │   ├── auth-mongodb.js
│   │   ├── companies-mongodb.js
│   │   ├── drives-mongodb.js
│   │   ├── applications-mongodb.js
│   │   └── students-mongodb.js
│   ├── middleware/
│   │   └── auth.js
│   ├── seed-admin.js
│   ├── create-hr.js
│   └── server.js
├── src/
│   ├── pages/
│   │   ├── admin/
│   │   ├── hr/
│   │   └── student/
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── services/
│   │   └── api.ts
│   └── components/
└── Documentation files
```

## Environment Variables

### Backend (.env)
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/placement_portal
JWT_SECRET=your_jwt_secret_key_here
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

## Production Deployment

### Backend
1. Set production MongoDB URI
2. Set strong JWT secret
3. Enable CORS for frontend domain
4. Use environment variables
5. Enable HTTPS

### Frontend
1. Build production bundle: `npm run build`
2. Set production API URL
3. Deploy to hosting service
4. Configure domain and SSL

## Support & Maintenance

### Regular Tasks
- Monitor MongoDB disk space
- Backup database regularly
- Review application logs
- Update dependencies
- Monitor API performance

### Database Backup
```bash
mongodump --db placement_portal --out /backup/$(date +%Y%m%d)
```

### Database Restore
```bash
mongorestore --db placement_portal /backup/20240207/placement_portal
```

## Future Enhancements

1. Email notifications
2. Interview scheduling
3. Resume parsing
4. Advanced analytics
5. Bulk operations
6. Export to Excel/PDF
7. Calendar integration
8. Video interview integration
9. Automated skill assessment
10. Mobile app

## Credits

Built with:
- React + TypeScript
- Node.js + Express
- MongoDB + Mongoose
- Tailwind CSS
- shadcn/ui components
- JWT authentication
- bcrypt password hashing

## License

[Your License Here]

## Contact

For support or questions, contact: [Your Contact Info]
