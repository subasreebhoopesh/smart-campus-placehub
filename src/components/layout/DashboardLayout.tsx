import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

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

  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    window.addEventListener('profileUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleStorageChange);
    };
  }, [userRole]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav user={user} onLogout={handleLogout} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        userRole={userRole}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content — shifts right on desktop, full width on mobile */}
      <main className="pt-16 lg:pl-64 min-h-screen transition-all duration-300">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
