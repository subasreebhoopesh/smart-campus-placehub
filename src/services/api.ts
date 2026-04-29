// API Service for Backend Integration
// Base URL from environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to get auth token
const getToken = (): string | null => {
  const token = localStorage.getItem('token');
  console.log('Getting token from localStorage:', token ? 'Token exists' : 'No token');
  return token;
};

// Helper to create headers with auth
const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Added Authorization header');
    } else {
      console.warn('No token available for Authorization header');
    }
  }
  
  return headers;
};

// Helper for handling responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // Auto-clear token and redirect on 401 only when:
    // 1. We have a token (it's expired/invalid, not just unauthenticated)
    // 2. It's not an auth endpoint (login/signup return 401 for wrong credentials)
    if (response.status === 401) {
      const token = localStorage.getItem('token');
      const isAuthEndpoint = response.url.includes('/api/auth/login') || 
                             response.url.includes('/api/auth/signup');
      if (token && !isAuthEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register') &&
            window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      }
    }
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
};

// Check if backend is available
let backendAvailable = true;
const checkBackend = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });
    backendAvailable = response.ok;
  } catch {
    backendAvailable = false;
  }
  return backendAvailable;
};

// Initialize backend check
checkBackend();

// Mock data storage for when backend is not available
const mockStorage = {
  companies: JSON.parse(localStorage.getItem('mock_companies') || '[]'),
  drives: JSON.parse(localStorage.getItem('mock_drives') || '[]'),
  applications: JSON.parse(localStorage.getItem('mock_applications') || '[]'),
  
  saveCompanies: (data: any[]) => {
    localStorage.setItem('mock_companies', JSON.stringify(data));
    mockStorage.companies = data;
  },
  saveDrives: (data: any[]) => {
    localStorage.setItem('mock_drives', JSON.stringify(data));
    mockStorage.drives = data;
  },
  saveApplications: (data: any[]) => {
    localStorage.setItem('mock_applications', JSON.stringify(data));
    mockStorage.applications = data;
  }
};

// ==================== AUTH APIs ====================

export const authAPI = {
  // Sign up
  signup: async (data: {
    email: string;
    password: string;
    name: string;
    role: 'student' | 'hr';
    rollNumber?: string;
    branch?: string;
    companyId?: number;
  }) => {
    console.log('API: Attempting signup for:', data.email);
    
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(data),
    });
    
    console.log('API: Signup response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      console.error('API: Signup error:', errorData);
      throw new Error(errorData.message || 'Signup failed');
    }
    
    const result = await response.json();
    console.log('API: Signup successful');
    return result;
  },

  // Login
  login: async (email: string, password: string, expectedRole?: string) => {
    console.log('API: Attempting login for:', email, 'as role:', expectedRole);
    console.log('API: Backend URL:', API_BASE_URL);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, password, expectedRole }),
    });
    
    console.log('API: Login response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      console.error('API: Login error:', errorData);
      throw new Error(errorData.message || 'Login failed');
    }
    
    const data = await response.json();
    console.log('API: Login successful:', data);
    return data;
  },

  // Select company (for HR with multiple companies)
  selectCompany: async (companyId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/select-company`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ companyId }),
      });
      return handleResponse(response);
    } catch (error) {
      return { success: true };
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      localStorage.removeItem('token');
      return { success: true };
    }
  },
};

// ==================== COMPANY APIs ====================

export const companyAPI = {
  // Get all companies
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      // Fallback: Return mock companies
      return mockStorage.companies;
    }
  },

  // Get single company
  getById: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      return mockStorage.companies.find((c: any) => c.id === id);
    }
  },

  // Create company (Admin only)
  create: async (data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      // Fallback: Add to mock storage
      const newCompany = {
        id: Date.now(),
        ...data,
        created_at: new Date().toISOString()
      };
      mockStorage.companies.push(newCompany);
      mockStorage.saveCompanies(mockStorage.companies);
      return newCompany;
    }
  },

  // Update company
  update: async (id: number, data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      // Fallback: Update mock storage
      const index = mockStorage.companies.findIndex((c: any) => c.id === id);
      if (index !== -1) {
        mockStorage.companies[index] = { ...mockStorage.companies[index], ...data };
        mockStorage.saveCompanies(mockStorage.companies);
      }
      return { success: true };
    }
  },

  // Delete company
  delete: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      // Fallback: Remove from mock storage
      mockStorage.companies = mockStorage.companies.filter((c: any) => c.id !== id);
      mockStorage.saveCompanies(mockStorage.companies);
      return { success: true };
    }
  },
};

// ==================== PLACEMENT DRIVE APIs ====================

export const driveAPI = {
  // Get all drives
  getAll: async (filters?: { status?: string; branch?: string }) => {
    try {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`${API_BASE_URL}/drives?${params}`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      // Fallback: Return mock drives
      return mockStorage.drives;
    }
  },

  // Get single drive
  getById: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/drives/${id}`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      return mockStorage.drives.find((d: any) => d.id === id);
    }
  },

  // Create drive (Admin only)
  create: async (data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/drives`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      // Fallback: Add to mock storage
      const company = mockStorage.companies.find((c: any) => c.id === data.companyId);
      const newDrive = {
        id: Date.now(),
        company_id: data.companyId,
        company_name: company?.name || 'Unknown Company',
        job_role: data.jobRole,
        drive_date: data.driveDate,
        eligible_branches: data.eligibleBranches,
        min_cgpa: data.minCgpa,
        package_offered: data.packageOffered,
        description: data.description,
        status: 'upcoming',
        registered_students: 0,
        selected_students: 0,
        created_at: new Date().toISOString()
      };
      mockStorage.drives.push(newDrive);
      mockStorage.saveDrives(mockStorage.drives);
      return newDrive;
    }
  },

  // Update drive
  update: async (id: number, data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/drives/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      // Fallback: Update mock storage
      const index = mockStorage.drives.findIndex((d: any) => d.id === id);
      if (index !== -1) {
        const company = mockStorage.companies.find((c: any) => c.id === data.companyId);
        mockStorage.drives[index] = {
          ...mockStorage.drives[index],
          company_id: data.companyId,
          company_name: company?.name || mockStorage.drives[index].company_name,
          job_role: data.jobRole,
          drive_date: data.driveDate,
          eligible_branches: data.eligibleBranches,
          min_cgpa: data.minCgpa,
          package_offered: data.packageOffered,
          description: data.description,
          status: data.status
        };
        mockStorage.saveDrives(mockStorage.drives);
      }
      return { success: true };
    }
  },

  // Delete drive
  delete: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/drives/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      // Fallback: Remove from mock storage
      mockStorage.drives = mockStorage.drives.filter((d: any) => d.id !== id);
      mockStorage.saveDrives(mockStorage.drives);
      return { success: true };
    }
  },
};

// ==================== APPLICATION APIs ====================

export const applicationAPI = {
  // Apply for drive (Student only)
  apply: async (driveId: number) => {
    try {
      console.log('API: Applying to drive:', driveId);
      console.log('API: Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ driveId }),
      });
      
      console.log('API: Apply response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        console.error('API: Apply error:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API: Application created:', data);
      return data;
    } catch (error) {
      console.error('API: Apply failed:', error);
      // Fallback: Add to mock storage
      const drive = mockStorage.drives.find((d: any) => d.id === driveId);
      const newApplication = {
        id: Date.now(),
        student_id: 1,
        drive_id: driveId,
        company_id: drive?.company_id,
        company_name: drive?.company_name,
        job_role: drive?.job_role,
        package_offered: drive?.package_offered,
        drive_date: drive?.drive_date,
        status: 'applied',
        remarks: null,
        applied_date: new Date().toISOString()
      };
      mockStorage.applications.push(newApplication);
      mockStorage.saveApplications(mockStorage.applications);
      return newApplication;
    }
  },

  // Get student's applications
  getStudentApplications: async () => {
    try {
      console.log('API: Fetching student applications...');
      console.log('API: Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      const response = await fetch(`${API_BASE_URL}/applications/student`, {
        headers: getHeaders(),
      });
      
      console.log('API: Student applications response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        console.error('API: Error fetching applications:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API: Student applications received:', data);
      return data;
    } catch (error) {
      console.error('API: Failed to fetch student applications:', error);
      // Fallback: Return mock applications
      return mockStorage.applications;
    }
  },

  // Get HR applications (HR only)
  getHRApplications: async () => {
    try {
      console.log('API: Fetching HR applications...');
      console.log('API: Base URL:', API_BASE_URL);
      console.log('API: Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      const url = `${API_BASE_URL}/applications/hr`;
      console.log('API: Full URL:', url);
      
      const headers = getHeaders();
      console.log('API: Headers:', headers);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('API: Response status:', response.status);
      console.log('API: Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API: Error response text:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP ${response.status}` };
        }
        
        console.error('API: Error data:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API: Success, received', Array.isArray(data) ? data.length : 0, 'applications');
      return data;
    } catch (error: any) {
      console.error('API: Exception caught:', error);
      console.error('API: Error name:', error.name);
      console.error('API: Error message:', error.message);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - backend server may be slow or not responding');
      }
      
      throw error;
    }
  },

  // Update application status (HR only)
  updateStatus: async (id: string | number, status: string, remarks?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status, remarks }),
      });
      return handleResponse(response);
    } catch (error) {
      // Fallback: Update mock storage
      const index = mockStorage.applications.findIndex((a: any) => a.id === id || a.id.toString() === id.toString());
      if (index !== -1) {
        mockStorage.applications[index].status = status;
        mockStorage.applications[index].remarks = remarks;
        mockStorage.saveApplications(mockStorage.applications);
      }
      return { success: true };
    }
  },

  // Get application by ID
  getById: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      return mockStorage.applications.find((a: any) => a.id === id);
    }
  },
};

// ==================== STUDENT APIs ====================

export const studentAPI = {
  // Get student profile
  getProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/profile`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      // Fallback: Return mock profile
      const mockProfile = JSON.parse(localStorage.getItem('mock_student_profile') || 'null');
      if (mockProfile) return mockProfile;
      
      // Default profile
      return {
        id: 1,
        user_id: 1,
        roll_number: 'CSE2021001',
        branch: 'CSE',
        cgpa: 8.0,
        skills: ['JavaScript', 'React', 'Node.js'],
        tenth_percentage: 85,
        twelfth_percentage: 88
      };
    }
  },

  // Update student profile
  updateProfile: async (data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      // Fallback: Save to localStorage
      localStorage.setItem('mock_student_profile', JSON.stringify(data));
      return { success: true };
    }
  },

  // Upload resume
  uploadResume: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/students/resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      return handleResponse(response);
    } catch (error) {
      return { success: true, url: '/uploads/resume.pdf' };
    }
  },

  // Upload profile photo
  uploadPhoto: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/students/profile-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      return handleResponse(response);
    } catch (error) {
      return { success: true, url: '/uploads/photo.jpg' };
    }
  },

  // Get all students (Admin only)
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/students`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      return [];
    }
  },
};

// ==================== HR APIs ====================

export const hrAPI = {
  // Get required skills
  getSkills: async () => {
    const response = await fetch(`${API_BASE_URL}/hr/skills`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Set required skills
  setSkills: async (skills: string[]) => {
    const response = await fetch(`${API_BASE_URL}/hr/skills`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ skills }),
    });
    return handleResponse(response);
  },

  // Get HR dashboard stats
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/hr/stats`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get HR profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/hr/profile`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get HR recent activity
  getRecentActivity: async () => {
    const response = await fetch(`${API_BASE_URL}/hr/recent-activity`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// ==================== ADMIN APIs ====================

export const adminAPI = {
  // Get dashboard stats
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get placement summary report
  getPlacementSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/placement-summary`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get admin profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/profile`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Update admin profile
  updateProfile: async (data: {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/admin/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Get analytics data
  getAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get all HR users
  getHRUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/hr-users`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Create HR user
  createHRUser: async (data: {
    name: string;
    email: string;
    password: string;
    companyId: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/admin/hr-users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Update HR user
  updateHRUser: async (id: string, data: {
    name: string;
    email: string;
    password?: string;
    companyId: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/admin/hr-users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Delete HR user
  deleteHRUser: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/hr-users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Upload admin profile photo
  uploadProfilePhoto: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/admin/profile-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      return handleResponse(response);
    } catch (error) {
      return { success: false, message: 'Failed to upload photo' };
    }
  },

  // Get all users
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get all applications (Admin only)
  getAllApplications: async () => {
    try {
      console.log('API: Fetching all applications for admin...');
      const response = await fetch(`${API_BASE_URL}/applications/admin/all`, {
        headers: getHeaders(),
      });
      
      console.log('API: Admin applications response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        console.error('API: Error fetching admin applications:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API: Admin applications received:', data.length);
      return data;
    } catch (error: any) {
      console.error('API: Failed to fetch admin applications:', error);
      throw error;
    }
  },

  // Respond to application (Admin only)
  respondToApplication: async (applicationId: number, data: { status: string; adminRemarks: string }) => {
    try {
      console.log('API: Admin responding to application:', applicationId);
      const response = await fetch(`${API_BASE_URL}/applications/admin/${applicationId}/respond`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('API: Failed to respond to application:', error);
      throw error;
    }
  },

  // Create HR credential
  createHR: async (data: {
    email: string;
    password: string;
    name: string;
    companyId: number;
  }) => {
    const response = await fetch(`${API_BASE_URL}/admin/hr`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Get all HR credentials
  getHRCredentials: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/hr`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Update HR credential
  updateHR: async (id: number, data: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/hr/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Delete HR credential
  deleteHR: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/admin/hr/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get recent activities
  getRecentActivities: async (limit: number = 10) => {
    const response = await fetch(`${API_BASE_URL}/admin/recent-activities?limit=${limit}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// ==================== ANALYTICS APIs ====================

export const analyticsAPI = {
  // Get placement statistics
  getPlacementStats: async () => {
    const response = await fetch(`${API_BASE_URL}/analytics/placement-stats`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get branch-wise placement
  getBranchWisePlacement: async () => {
    const response = await fetch(`${API_BASE_URL}/analytics/branch-wise`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get company-wise hiring
  getCompanyWiseHiring: async () => {
    const response = await fetch(`${API_BASE_URL}/analytics/company-wise`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// ==================== NOTIFICATION APIs ====================

export const notificationAPI = {
  // Get all notifications for logged-in user
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return { notifications: [], unreadCount: 0 };
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      return { unreadCount: 0 };
    }
  },

  // Mark notification as read
  markAsRead: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      return { success: false };
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      return { success: false };
    }
  },

  // Delete notification
  delete: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      return { success: false };
    }
  },

  // Send notification (admin/hr only)
  send: async (data: {
    recipientIds: string[];
    title: string;
    message: string;
    type?: string;
    priority?: string;
    relatedId?: string;
    relatedType?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/notifications/send`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Broadcast notification (admin only)
  broadcast: async (data: {
    targetRole: string;
    title: string;
    message: string;
    type?: string;
    priority?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/notifications/broadcast`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// ==================== MESSAGE APIs ====================

export const messageAPI = {
  // Send message
  send: async (data: {
    recipientId: string;
    subject: string;
    message: string;
    priority?: string;
    relatedTo?: string;
    relatedId?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Get conversation with a user
  getConversation: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/messages/conversation/${userId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get inbox messages
  getInbox: async () => {
    const response = await fetch(`${API_BASE_URL}/messages/inbox`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get sent messages
  getSent: async () => {
    const response = await fetch(`${API_BASE_URL}/messages/sent`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Mark message as read
  markAsRead: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/messages/${id}/read`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get unread count
  getUnreadCount: async (userId?: string) => {
    const endpoint = userId 
      ? `${API_BASE_URL}/messages/unread-count/${userId}`
      : `${API_BASE_URL}/messages/unread-count`;
    const response = await fetch(endpoint, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Delete message
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Broadcast message (admin only)
  broadcast: async (data: {
    subject: string;
    message: string;
    recipientRole?: string;
    priority?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/messages/broadcast`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Get admin ID (for students)
  getAdminId: async () => {
    const response = await fetch(`${API_BASE_URL}/messages/admin-id`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// ==================== DOCUMENT APIs ====================

export const documentAPI = {
  // Upload document (Student only)
  upload: async (file: File, documentType: string, documentName: string) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    formData.append('documentName', documentName);

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse(response);
  },

  // Get student's documents
  getStudentDocuments: async () => {
    const response = await fetch(`${API_BASE_URL}/documents/student`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get all documents (Admin only)
  getAllDocuments: async (status?: string) => {
    const params = status ? `?status=${status}` : '';
    const response = await fetch(`${API_BASE_URL}/documents/admin/all${params}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Verify/Reject document (Admin only)
  verifyDocument: async (id: string, status: string, remarks?: string) => {
    const response = await fetch(`${API_BASE_URL}/documents/admin/${id}/verify`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, remarks }),
    });
    return handleResponse(response);
  },

  // Delete document (Student only)
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Download document
  download: async (id: string, filename: string) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/documents/download/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Get document statistics (Admin only)
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/documents/admin/stats`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// ==================== ASSESSMENT APIs ====================
export const assessmentAPI = {
  // Admin: generate assessment for a drive
  generate: async (driveId: string) => {
    const response = await fetch(`${API_BASE_URL}/assessments/generate/${driveId}`, {
      method: 'POST', headers: getHeaders(),
    });
    return handleResponse(response);
  },
  // Admin: get all assessments
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/assessments/admin/all`, { headers: getHeaders() });
    return handleResponse(response);
  },
  // Admin: get results for an assessment
  getResults: async (assessmentId: string) => {
    const response = await fetch(`${API_BASE_URL}/assessments/admin/results/${assessmentId}`, { headers: getHeaders() });
    return handleResponse(response);
  },
  // Student: get assessment for a drive
  getForDrive: async (driveId: string) => {
    const response = await fetch(`${API_BASE_URL}/assessments/drive/${driveId}`, { headers: getHeaders() });
    return handleResponse(response);
  },
  // Student: submit assessment
  submit: async (assessmentId: string, answers: any[], timeTaken: number) => {
    const response = await fetch(`${API_BASE_URL}/assessments/submit/${assessmentId}`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ answers, timeTaken }),
    });
    return handleResponse(response);
  },
  // Student: get my result for a drive
  getMyResult: async (driveId: string) => {
    const response = await fetch(`${API_BASE_URL}/assessments/my-result/${driveId}`, { headers: getHeaders() });
    return handleResponse(response);
  },
  // Student: get all available assessments
  getAvailable: async () => {
    const response = await fetch(`${API_BASE_URL}/assessments/student/available`, { headers: getHeaders() });
    return handleResponse(response);
  },
};

// ==================== OFFER LETTER APIs ====================

export const offerLetterAPI = {
  // Admin: Upload offer letter for a selected application
  upload: async (applicationId: string, file: File) => {
    const formData = new FormData();
    formData.append('offerLetter', file);
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/offer-letters/upload/${applicationId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    return handleResponse(response);
  },

  // Admin: Delete offer letter
  delete: async (applicationId: string) => {
    const response = await fetch(`${API_BASE_URL}/offer-letters/${applicationId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Admin: Get all selected applications with offer letter status
  getAdminList: async () => {
    const response = await fetch(`${API_BASE_URL}/offer-letters/admin/list`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Student: Download offer letter
  download: async (applicationId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/offer-letters/download/${applicationId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Download failed');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'offer-letter.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

// Export all APIs
export const api = {
  auth: authAPI,
  companies: companyAPI,
  drives: driveAPI,
  applications: applicationAPI,
  students: studentAPI,
  hr: hrAPI,
  admin: adminAPI,
  analytics: analyticsAPI,
  notifications: notificationAPI,
  messages: messageAPI,
  documents: documentAPI,
  offerLetters: offerLetterAPI,
  assessments: assessmentAPI,
};

export default api;
