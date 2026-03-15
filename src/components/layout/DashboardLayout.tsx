import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: 'admin' | 'student' | 'hr';
}

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const [user, setUser] = useState({
    name: userRole === 'admin' ? 'Admin User' : userRole === 'hr' ? 'HR User' : 'Student User',
    email: userRole === 'admin' ? 'admin@college.edu' : userRole === 'hr' ? 'hr@company.com' : 'student@college.edu',
    role: userRole,
    avatar: undefined as string | undefined,
  });

  // Load user data from localStorage including avatar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser({
          name: userData.name || user.name,
          email: userData.email || user.email,
          role: userRole,
          avatar: userData.avatar,
        });
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }

    // Listen for storage changes (when profile photo is updated)
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        try {
          const userData = JSON.parse(updatedUser);
          setUser(prev => ({
            ...prev,
            name: userData.name || prev.name,
            email: userData.email || prev.email,
            avatar: userData.avatar,
          }));
        } catch (error) {
          console.error('Failed to parse updated user data:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event when profile is updated in same tab
    window.addEventListener('profileUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleStorageChange);
    };
  }, [userRole]);

  const handleLogout = () => {
    // Handle logout logic here
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav user={user} onLogout={handleLogout} />
      <Sidebar userRole={userRole} />
      <main className="pt-16 pl-64 min-h-screen transition-all duration-300">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
