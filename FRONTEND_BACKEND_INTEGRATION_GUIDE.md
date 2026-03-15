# Frontend-Backend Integration Guide

## 🔗 How to Connect Frontend to Backend

This guide explains how to integrate the existing frontend with a backend API.

---

## 📁 Project Structure for Integration

```
smart-campus-pathways-main/
├── src/
│   ├── api/                    # NEW: API service layer
│   │   ├── client.ts          # Axios/Fetch client configuration
│   │   ├── auth.ts            # Authentication APIs
│   │   ├── student.ts         # Student APIs
│   │   ├── admin.ts           # Admin APIs
│   │   └── resources.ts       # Career resources APIs
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts         # NEW: Authentication hook
│   │   ├── useStudent.ts      # NEW: Student data hook
│   │   └── useAdmin.ts        # NEW: Admin data hook
│   ├── context/                # NEW: React Context
│   │   └── AuthContext.tsx    # Authentication context
│   ├── utils/                  # Utility functions
│   │   ├── storage.ts         # NEW: LocalStorage helper
│   │   └── constants.ts       # NEW: API constants
│   └── types/                  # TypeScript types
│       └── api.ts             # NEW: API response types
```

---

## 🛠️ Step 1: Setup API Client

### Install Dependencies
```bash
npm install axios
# or
npm install @tanstack/react-query  # For better data fetching
```

### Create API Client (`src/api/client.ts`)
```typescript
import axios from 'axios';

// Base URL from environment variable
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);
```

---

## 🔐 Step 2: Create Authentication Service

### Auth API (`src/api/auth.ts`)
```typescript
import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
  role: 'student' | 'admin';
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
  };
}

export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post('/auth/login', data);
  },

  logout: async (): Promise<void> => {
    return apiClient.post('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    return apiClient.post('/auth/refresh', { refreshToken });
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    return apiClient.post('/auth/reset-password', { token, newPassword });
  },
};
```

### Auth Context (`src/context/AuthContext.tsx`)
```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, LoginRequest, LoginResponse } from '@/api/auth';

interface AuthContextType {
  user: LoginResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await authAPI.login(data);
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const logout = () => {
    authAPI.logout().catch(() => {});
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## 👨‍🎓 Step 3: Create Student APIs

### Student API (`src/api/student.ts`)
```typescript
import { apiClient } from './client';

export const studentAPI = {
  // Get profile
  getProfile: async () => {
    return apiClient.get('/student/profile');
  },

  // Update profile
  updateProfile: async (data: any) => {
    return apiClient.put('/student/profile', data);
  },

  // Upload profile photo
  uploadPhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return apiClient.post('/student/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Get dashboard data
  getDashboard: async () => {
    return apiClient.get('/student/dashboard');
  },

  // Get opportunities
  getOpportunities: async (params?: any) => {
    return apiClient.get('/student/opportunities', { params });
  },

  // Apply for job
  applyForJob: async (driveId: string, coverLetter?: string) => {
    return apiClient.post('/student/applications', { driveId, coverLetter });
  },

  // Get applications
  getApplications: async (status?: string) => {
    return apiClient.get('/student/applications', { params: { status } });
  },

  // Get interview questions
  getInterviewQuestions: async (department: string, jobRole: string) => {
    return apiClient.get('/resources/interview-questions', {
      params: { department, jobRole },
    });
  },

  // Save questions
  saveQuestions: async (questionIds: string[], department: string, jobRole: string) => {
    return apiClient.post('/student/saved-questions', { questionIds, department, jobRole });
  },
};
```

---

## 👨‍💼 Step 4: Create Admin APIs

### Admin API (`src/api/admin.ts`)
```typescript
import { apiClient } from './client';

export const adminAPI = {
  // Dashboard
  getDashboard: async () => {
    return apiClient.get('/admin/dashboard');
  },

  // Students
  getStudents: async (params?: any) => {
    return apiClient.get('/admin/students', { params });
  },

  getStudent: async (studentId: string) => {
    return apiClient.get(`/admin/students/${studentId}`);
  },

  updateStudentStatus: async (studentId: string, data: any) => {
    return apiClient.put(`/admin/students/${studentId}/status`, data);
  },

  // Companies
  getCompanies: async (params?: any) => {
    return apiClient.get('/admin/companies', { params });
  },

  addCompany: async (data: any) => {
    return apiClient.post('/admin/companies', data);
  },

  updateCompany: async (companyId: string, data: any) => {
    return apiClient.put(`/admin/companies/${companyId}`, data);
  },

  deleteCompany: async (companyId: string) => {
    return apiClient.delete(`/admin/companies/${companyId}`);
  },

  // Drives
  getDrives: async (params?: any) => {
    return apiClient.get('/admin/drives', { params });
  },

  createDrive: async (data: any) => {
    return apiClient.post('/admin/drives', data);
  },

  updateDrive: async (driveId: string, data: any) => {
    return apiClient.put(`/admin/drives/${driveId}`, data);
  },

  updateDriveStatus: async (driveId: string, status: string) => {
    return apiClient.put(`/admin/drives/${driveId}/status`, { status });
  },

  // Notifications
  sendNotification: async (target: string, message: string) => {
    return apiClient.post('/admin/notifications/send', { target, message });
  },

  // Export
  exportData: async (format: string, dataTypes: string[]) => {
    return apiClient.post('/admin/export', { format, dataTypes });
  },

  // Analytics
  getAnalytics: async (type: string, year?: number) => {
    return apiClient.get('/admin/analytics', { params: { type, year } });
  },

  // Settings
  getSettings: async () => {
    return apiClient.get('/admin/settings');
  },

  updateSettings: async (data: any) => {
    return apiClient.put('/admin/settings', data);
  },

  // Profile
  updateProfile: async (data: any) => {
    return apiClient.put('/admin/profile', data);
  },

  uploadPhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return apiClient.post('/admin/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiClient.put('/admin/profile/password', { currentPassword, newPassword });
  },
};
```

---

## 🔄 Step 5: Update Components to Use APIs

### Example: Update Student Dashboard

**Before (using mock data):**
```typescript
const studentProfile = {
  name: 'Rahul Sharma',
  rollNumber: 'CSE2021001',
  // ... mock data
};
```

**After (using API):**
```typescript
import { useEffect, useState } from 'react';
import { studentAPI } from '@/api/student';
import { useAuth } from '@/context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await studentAPI.getDashboard();
        setDashboardData(data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!dashboardData) return <div>Error loading data</div>;

  return (
    // Use dashboardData instead of mock data
    <div>
      <h1>Welcome, {dashboardData.profile.name}!</h1>
      {/* ... rest of component */}
    </div>
  );
}
```

### Example: Update Profile Photo Upload

**Update the handlePhotoChange function:**
```typescript
const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Validation
  if (file.size > 2 * 1024 * 1024) {
    toast({ title: "File too large", variant: "destructive" });
    return;
  }

  try {
    // Upload to backend
    const response = await studentAPI.uploadPhoto(file);
    
    // Update UI with returned URL
    setProfileImage(response.photoUrl);
    
    toast({
      title: "Photo updated",
      description: "Your profile photo has been updated successfully.",
    });
  } catch (error) {
    toast({
      title: "Upload failed",
      description: "Failed to upload photo. Please try again.",
      variant: "destructive",
    });
  }
};
```

---

## 🎣 Step 6: Create Custom Hooks (Optional but Recommended)

### Student Data Hook (`src/hooks/useStudent.ts`)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentAPI } from '@/api/student';

export function useStudentProfile() {
  return useQuery({
    queryKey: ['studentProfile'],
    queryFn: studentAPI.getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: studentAPI.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
    },
  });
}

export function useStudentDashboard() {
  return useQuery({
    queryKey: ['studentDashboard'],
    queryFn: studentAPI.getDashboard,
  });
}

export function useOpportunities(params?: any) {
  return useQuery({
    queryKey: ['opportunities', params],
    queryFn: () => studentAPI.getOpportunities(params),
  });
}

export function useApplyForJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ driveId, coverLetter }: { driveId: string; coverLetter?: string }) =>
      studentAPI.applyForJob(driveId, coverLetter),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}
```

### Usage in Component:
```typescript
import { useStudentDashboard } from '@/hooks/useStudent';

export default function StudentDashboard() {
  const { data, isLoading, error } = useStudentDashboard();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Welcome, {data.profile.name}!</h1>
      {/* ... */}
    </div>
  );
}
```

---

## 🌍 Step 7: Environment Variables

### Create `.env` file:
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Smart Campus Pathways
VITE_FILE_UPLOAD_MAX_SIZE=2097152
```

### Create `.env.production` file:
```env
VITE_API_URL=https://api.smartcampus.com/api
VITE_APP_NAME=Smart Campus Pathways
VITE_FILE_UPLOAD_MAX_SIZE=2097152
```

### Access in code:
```typescript
const API_URL = import.meta.env.VITE_API_URL;
const MAX_FILE_SIZE = import.meta.env.VITE_FILE_UPLOAD_MAX_SIZE;
```

---

## 🔒 Step 8: Protected Routes

### Create Protected Route Component (`src/components/ProtectedRoute.tsx`)
```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

### Update App.tsx:
```typescript
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/student/*" element={
            <ProtectedRoute requiredRole="student">
              <StudentRoutes />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/*" element={
            <ProtectedRoute requiredRole="admin">
              <AdminRoutes />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

---

## 📝 Step 9: Update All Components

### Components to Update:

1. **Login Page** - Use authAPI.login()
2. **Student Dashboard** - Use studentAPI.getDashboard()
3. **Student Profile** - Use studentAPI.getProfile() and updateProfile()
4. **Opportunities** - Use studentAPI.getOpportunities()
5. **Applications** - Use studentAPI.getApplications()
6. **Admin Dashboard** - Use adminAPI.getDashboard()
7. **Admin Students** - Use adminAPI.getStudents()
8. **Admin Companies** - Use adminAPI.getCompanies()
9. **Admin Drives** - Use adminAPI.getDrives()
10. **Admin Settings** - Use adminAPI.getSettings()

---

## 🧪 Step 10: Testing

### Test API Integration:
```typescript
// Test in browser console
import { studentAPI } from './api/student';

// Test login
const response = await studentAPI.getDashboard();
console.log(response);
```

### Use Browser DevTools:
1. Open Network tab
2. Perform actions in the app
3. Check API requests and responses
4. Verify status codes and data

---

## 🚀 Step 11: Deployment

### Build for Production:
```bash
npm run build
```

### Update Environment Variables:
- Set production API URL
- Configure CORS on backend
- Enable HTTPS

### Deploy Frontend:
- **Vercel** (Recommended)
- **Netlify**
- **AWS S3 + CloudFront**
- **GitHub Pages**

---

## 📚 Additional Resources

### Recommended Libraries:
- **@tanstack/react-query** - Data fetching and caching
- **axios** - HTTP client
- **zod** - Schema validation
- **react-hook-form** - Form handling

### Documentation:
- [Axios Documentation](https://axios-http.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## ✅ Integration Checklist

- [ ] Install axios or fetch library
- [ ] Create API client with interceptors
- [ ] Setup authentication context
- [ ] Create API service files
- [ ] Update components to use APIs
- [ ] Add loading and error states
- [ ] Implement protected routes
- [ ] Setup environment variables
- [ ] Test all API endpoints
- [ ] Handle error cases
- [ ] Add loading indicators
- [ ] Implement token refresh
- [ ] Test file uploads
- [ ] Verify authentication flow
- [ ] Test role-based access
- [ ] Deploy to production

---

**Ready to connect to backend! 🎉**

Follow these steps to integrate your frontend with any backend API.
