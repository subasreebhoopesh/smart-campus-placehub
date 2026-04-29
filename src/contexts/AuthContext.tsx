import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from '@/services/api';

export type UserRole = 'admin' | 'hr' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  companyName?: string;
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, expectedRole?: UserRole) => Promise<{ success: boolean; companies?: any[]; message?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
  selectCompany: (companyId: number) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));
    return payload.exp ? payload.exp * 1000 < Date.now() : false;
  } catch {
    return false; // Don't reject on parse errors
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token) {
      localStorage.removeItem('user');
      return null;
    }

    if (isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }

    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (
    email: string,
    password: string,
    expectedRole?: UserRole
  ): Promise<{ success: boolean; companies?: any[]; message?: string }> => {
    try {
      const response = await api.auth.login(email, password, expectedRole);

      if (response.success && response.token) {
        localStorage.setItem('token', response.token);

        const userData: User = {
          id: response.user.id.toString(),
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
        };

        if (response.user.role === 'hr' && response.companies) {
          if (response.companies.length === 1) {
            userData.companyId = response.companies[0].id.toString();
            userData.companyName = response.companies[0].name;
          }
          setUser(userData);
          return { success: true, companies: response.companies };
        }

        setUser(userData);
        return { success: true };
      }

      return { success: false, message: response.message || 'Login failed' };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Unable to connect to server.',
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
    } catch {
      return false;
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    api.auth.logout().catch(console.error);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, updateUser, isAuthenticated: !!user, selectCompany }}
    >
      {children}
    </AuthContext.Provider>
  );
}
