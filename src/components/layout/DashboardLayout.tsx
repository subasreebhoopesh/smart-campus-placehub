import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: 'admin' | 'student';
}

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const [user] = useState({
    name: userRole === 'admin' ? 'Admin User' : 'Student User',
    email: userRole === 'admin' ? 'admin@college.edu' : 'student@college.edu',
    role: userRole,
  });

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logging out...');
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
