import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Target,
  BookOpen,
  ClipboardList,
  UserCircle,
  MessageCircle,
  FileCheck,
  ClipboardCheck,
  Mail,
  Bot,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  userRole: 'admin' | 'student' | 'hr';
  mobileOpen?: boolean;
  onClose?: () => void;
}

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Students', path: '/admin/students' },
  { icon: ClipboardList, label: 'Company Requests', path: '/admin/company-requests' },
  { icon: ClipboardList, label: 'Applications', path: '/admin/applications' },
  { icon: FileCheck, label: 'Document Verification', path: '/admin/documents' },
  { icon: ClipboardList, label: 'Assessments', path: '/admin/assessments' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: FileText, label: 'Reports', path: '/admin/reports' },
  { icon: MessageCircle, label: 'Chat', path: '/admin/chat' },
  { icon: UserCircle, label: 'Profile', path: '/admin/profile' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const studentMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
  { icon: Briefcase, label: 'Job Opportunities', path: '/student/opportunities' },
  { icon: FileText, label: 'My Applications', path: '/student/applications' },
  { icon: ClipboardCheck, label: 'My Assessments', path: '/student/assessments' },
  { icon: FileCheck, label: 'My Documents', path: '/student/documents' },
  { icon: MessageCircle, label: 'Chat with Admin', path: '/student/chat' },
  { icon: Bot, label: 'AI Career Bot', path: '/student/ai-career-bot' },
  { icon: BookOpen, label: 'Explore Resources', path: '/student/resources' },
  { icon: Settings, label: 'Profile', path: '/student/profile' },
];

const hrMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/hr/dashboard' },
  { icon: Briefcase, label: 'My Drives', path: '/hr/drives' },
  { icon: FileText, label: 'Applications', path: '/hr/applications' },
  { icon: Mail, label: 'Offer Letters', path: '/hr/offer-letters' },
  { icon: Target, label: 'Required Skills', path: '/hr/skills' },
  { icon: UserCircle, label: 'Profile', path: '/hr/profile' },
];

export function Sidebar({ userRole, mobileOpen = false, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems =
    userRole === 'admin' ? adminMenuItems :
    userRole === 'hr' ? hrMenuItems :
    studentMenuItems;

  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r border-border transition-all duration-300 z-40',
          'hidden lg:flex flex-col',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 py-4 overflow-y-auto">
            <nav className="space-y-1 px-2">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="p-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile drawer — slides in from left */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-72 bg-card border-r border-border z-50 flex flex-col transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 border-b border-border pt-5">
          <span className="font-bold text-lg text-primary">PlaceHub</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile nav */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
