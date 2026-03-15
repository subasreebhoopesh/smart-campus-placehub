# Smart Campus Pathways - Placement Management System

A comprehensive web-based placement management system for educational institutions to streamline campus recruitment processes.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
http://localhost:8080
```

## 📋 Features

### For Students
- Interactive dashboard with profile management
- Career resources (Interview Questions, Resume Templates, Mock Interviews)
- Explore opportunities by department and job role (90+ questions)
- Job opportunities with 3D company logos
- Application tracking and management
- Profile photo upload and academic details update

### For Admins
- Comprehensive dashboard with statistics
- Student and company management
- Placement drive management
- Send bulk notifications
- Export data in multiple formats
- Analytics and reports generation
- System settings and configuration

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Charts:** Recharts

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
│   ├── admin/    # Admin pages
│   └── student/  # Student pages
├── lib/          # Utilities and data
├── hooks/        # Custom React hooks
└── App.tsx       # Main app component
```

## 📚 Documentation

- **[COMPLETE_PROJECT_SUMMARY.md](./COMPLETE_PROJECT_SUMMARY.md)** - Full project overview
- **[BACKEND_API_SPECIFICATION.md](./BACKEND_API_SPECIFICATION.md)** - API documentation (42 endpoints)
- **[FRONTEND_BACKEND_INTEGRATION_GUIDE.md](./FRONTEND_BACKEND_INTEGRATION_GUIDE.md)** - Integration guide
- **[FEATURE_UPDATES.md](./FEATURE_UPDATES.md)** - All features implemented
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing documentation

## 🔗 Backend Integration

The frontend is ready for backend integration. See:
- `BACKEND_API_SPECIFICATION.md` for API endpoints
- `FRONTEND_BACKEND_INTEGRATION_GUIDE.md` for step-by-step integration

### Required APIs: 42 endpoints
- Authentication (5)
- Student APIs (15)
- Admin APIs (22)

## 🎯 Key Features

### Student Features
✅ Dashboard with stats and profile photo  
✅ 90+ interview questions across 18 job roles  
✅ 5 resume templates  
✅ 5 mock interview types  
✅ 3D company logos with animations  
✅ Application tracking  
✅ Profile management with photo upload  

### Admin Features
✅ Dashboard with statistics  
✅ Student and company management  
✅ Placement drive management  
✅ Send notifications dialog  
✅ Export data dialog  
✅ Analytics and reports  
✅ Settings and configuration  

## 📱 Pages

### Student Routes
- `/student/dashboard` - Dashboard
- `/student/opportunities` - Job opportunities
- `/student/applications` - My applications
- `/student/profile` - Profile management

### Admin Routes
- `/admin/dashboard` - Dashboard
- `/admin/students` - Student management
- `/admin/companies` - Company management
- `/admin/drives` - Placement drives
- `/admin/analytics` - Analytics
- `/admin/reports` - Reports
- `/admin/settings` - Settings

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## 🏗️ Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Project Stats

- **Pages:** 10+
- **Components:** 50+
- **Features:** 30+
- **API Endpoints:** 42
- **Interview Questions:** 90+
- **Job Roles:** 18
- **Departments:** 6

## 🎨 UI Features

- 3D card effects and animations
- Hover effects and transitions
- Toast notifications
- Loading states
- Error handling
- Responsive design
- File upload with validation
- Interactive dialogs

## 🔐 Authentication

The app supports role-based authentication:
- **Student** role for student features
- **Admin** role for admin features

## 📝 Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Smart Campus Pathways
```

## 🚀 Deployment

### Frontend
- Vercel (Recommended)
- Netlify
- AWS S3 + CloudFront

### Backend
- Node.js + Express
- Python + FastAPI
- Java + Spring Boot

## 📖 Getting Help

1. Check documentation files
2. Review API specification
3. Follow integration guide
4. Test with provided examples

## ✅ Status

**Frontend:** ✅ Complete and Production Ready  
**Backend:** 📋 Specification Ready  
**Documentation:** ✅ Complete  

## 🎉 Ready for Backend Integration!

All frontend features are implemented, tested, and documented. The project is production-ready and waiting for backend integration.

---

**Built with ❤️ for educational institutions**
