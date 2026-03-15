import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from '@/services/api';

export type UserRole = 'admin' | 'hr' | 'student';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string; // For HR users
  companyName?: string; // For HR users
  avatar?: string; // Profile photo URL
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, expectedRole?: UserRole) => Promise<{ success: boolean; companies?: any[]; message?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
  selectCompany: (companyId: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email: string, password: string, expectedRole?: UserRole): Promise<{ success: boolean; companies?: any[]; message?: string }> => {
    try {
      console.log('Attempting login for:', email, 'as role:', expectedRole);
      
      // Call backend API with expected role
      const response = await api.auth.login(email, password, expectedRole);
      console.log('Login response:', response);
      
      if (response.success && response.token) {
        // Store token
        localStorage.setItem('token', response.token);
        console.log('Token stored successfully');
        
        // Set user data
        const userData: User = {
          id: response.user.id.toString(),
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
        };

        // If HR user, include company info
        if (response.user.role === 'hr' && response.companies) {
          console.log('HR user with companies:', response.companies);
          if (response.companies.length === 1) {
            userData.companyId = response.companies[0].id.toString();
            userData.companyName = response.companies[0].name;
            console.log('HR company set:', userData.companyId, userData.companyName);
          } else if (response.companies.length > 1) {
            // Multiple companies - need to select one
            console.log('HR has multiple companies');
          }
          setUser(userData);
          return { success: true, companies: response.companies };
        }

        setUser(userData);
        console.log('User set:', userData);
        return { success: true };
      }

      return { success: false, message: response.message || 'Login failed' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || 'Unable to connect to server. Please ensure MongoDB is running and backend server is started.' 
      };
    }
  };

  const selectCompany = async (companyId: number): Promise<boolean> => {
    try {
      const response = await api.auth.selectCompany(companyId);
      
      if (response.success && user) {
        setUser({
          ...user,
          companyId: response.company.id.toString(),
          companyName: response.company.name,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Select company error:', error);
      return false;
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Call backend logout (optional)
    api.auth.logout().catch(console.error);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user, selectCompany }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
