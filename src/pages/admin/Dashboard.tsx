import {
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  BarChart3,
  Mail,
  Download,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { placementDrives } from '@/lib/data';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { useNotifications } from '@/contexts/NotificationContext';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { broadcastNotification } = useNotifications();
  const [notificationDialog, setNotificationDialog] = useState(false);
  const [exportDialog, setExportDialog] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationTarget, setNotificationTarget] = useState('all');
  const [notificationPriority, setNotificationPriority] = useState('medium');
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportData, setExportData] = useState({
    students: true,
    companies: false,
    drives: false,
    applications: false,
  });
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCompanies: 0,
    activeDrives: 0,
    placementRate: 0,
    changes: {
      students: 0,
      companies: 0,
      drives: 0
    }
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.admin.getStats();
        if (response && response.success) {
          setStats(response.stats);
        } else {
          // Use default stats if API fails
          console.warn('Stats API returned no data, using defaults');
        }
      } catch (error: any) {
        console.error('Failed to fetch stats:', error);
        // Don't show error toast, just use default stats
        // This prevents blank page if API is slow or fails
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Students',
      value: loading ? '...' : stats.totalStudents.toLocaleString(),
      change: loading ? '...' : `${stats.changes.students >= 0 ? '+' : ''}${stats.changes.students}%`,
      trend: stats.changes.students >= 0 ? 'up' : 'down',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Partner Companies',
      value: loading ? '...' : stats.totalCompanies.toLocaleString(),
      change: loading ? '...' : `${stats.changes.companies >= 0 ? '+' : ''}${stats.changes.companies}%`,
      trend: stats.changes.companies >= 0 ? 'up' : 'down',
      icon: Building2,
      color: 'bg-green-500',
    },
    {
      title: 'Active Drives',
      value: loading ? '...' : stats.activeDrives.toString(),
      change: loading ? '...' : `${stats.changes.drives >= 0 ? '+' : ''}${stats.changes.drives}`,
      trend: stats.changes.drives >= 0 ? 'up' : 'down',
      icon: Briefcase,
      color: 'bg-purple-500',
    },
    {
      title: 'Placement Rate',
      value: loading ? '...' : `${stats.placementRate}%`,
      change: loading ? '...' : `${stats.placementRate >= 75 ? 'Good' : 'Improving'}`,
      trend: stats.placementRate >= 75 ? 'up' : 'down',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];
  
  const upcomingDrives = placementDrives.filter((d) => d.status === 'upcoming').slice(0, 4);

  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast({
        title: "Required Fields",
        description: "Please enter both title and message.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);
      await broadcastNotification({
        targetRole: notificationTarget,
        title: notificationTitle,
        message: notificationMessage,
        type: 'system',
        priority: notificationPriority,
      });

      toast({
        title: "Notification Sent!",
        description: `Notification sent to ${notificationTarget === 'all' ? 'all users' : notificationTarget + ' users'}.`,
      });
      
      setNotificationDialog(false);
      setNotificationTitle('');
      setNotificationMessage('');
      setNotificationTarget('all');
      setNotificationPriority('medium');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleExportData = () => {
    const selectedData = Object.entries(exportData)
      .filter(([_, value]) => value)
      .map(([key]) => key);
    
    if (selectedData.length === 0) {
      toast({
        title: "No Data Selected",
        description: "Please select at least one data type to export.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Export Started!",
      description: `Exporting ${selectedData.join(', ')} as ${exportFormat.toUpperCase()}. Download will start shortly.`,
    });
    setExportDialog(false);
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-sm">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={
                      stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }
                  >
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-1">
          {/* Upcoming Drives */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Placement Drives
              </CardTitle>
              <CardDescription>Scheduled drives for this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingDrives.map((drive) => (
                  <div
                    key={drive.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{drive.companyName}</p>
                      <p className="text-sm text-muted-foreground">{drive.jobRole}</p>
                      <div className="flex gap-2 mt-2">
                        {drive.eligibleBranches.slice(0, 3).map((branch) => (
                          <Badge key={branch} variant="secondary" className="text-xs">
                            {branch}
                          </Badge>
                        ))}
                        {drive.eligibleBranches.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{drive.eligibleBranches.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(new Date(drive.date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {drive.registeredStudents} registered
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/admin/drives')}>
                View All Drives
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-colors"
                onClick={() => navigate('/admin/companies')}
              >
                <Building2 className="h-5 w-5" />
                <span>Manage Companies</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-colors"
                onClick={() => navigate('/admin/drives')}
              >
                <Briefcase className="h-5 w-5" />
                <span>Create Drive</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-colors"
                onClick={() => navigate('/admin/reports')}
              >
                <FileText className="h-5 w-5" />
                <span>Generate Reports</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-colors"
                onClick={() => navigate('/admin/analytics')}
              >
                <BarChart3 className="h-5 w-5" />
                <span>View Analytics</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-colors"
                onClick={() => setNotificationDialog(true)}
              >
                <Mail className="h-5 w-5" />
                <span>Send Notifications</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-colors"
                onClick={() => setExportDialog(true)}
              >
                <Download className="h-5 w-5" />
                <span>Export Data</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-colors"
                onClick={() => navigate('/admin/students')}
              >
                <Users className="h-5 w-5" />
                <span>View Students</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-colors"
                onClick={() => navigate('/admin/settings')}
              >
                <TrendingUp className="h-5 w-5" />
                <span>System Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Send Notifications Dialog */}
      <Dialog open={notificationDialog} onOpenChange={setNotificationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Notifications
            </DialogTitle>
            <DialogDescription>
              Broadcast notifications to users. They will receive it in real-time and it will persist until they read it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="target">Send To</Label>
              <Select value={notificationTarget} onValueChange={setNotificationTarget}>
                <SelectTrigger id="target">
                  <SelectValue placeholder="Select recipients..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="student">All Students</SelectItem>
                  <SelectItem value="hr">All HR Personnel</SelectItem>
                  <SelectItem value="admin">All Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={notificationPriority} onValueChange={setNotificationPriority}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Notification Title</Label>
              <Input
                id="title"
                placeholder="Enter notification title..."
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {notificationTitle.length}/100 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Notification Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your notification message here..."
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                rows={6}
                className="resize-y min-h-[120px] max-h-[300px] overflow-y-auto"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {notificationMessage.length}/500 characters
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                💡 <strong>Tip:</strong> Notifications will persist until recipients mark them as read. They can see them anytime by clicking the bell icon.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotificationDialog(false)} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleSendNotification} disabled={sending}>
              <Mail className="h-4 w-4 mr-2" />
              {sending ? 'Sending...' : 'Send Notification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog open={exportDialog} onOpenChange={setExportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </DialogTitle>
            <DialogDescription>
              Select the data you want to export and choose the format
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="json">JSON Format</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Select Data to Export</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="students"
                    checked={exportData.students}
                    onCheckedChange={(checked) =>
                      setExportData({ ...exportData, students: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="students"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Students Data ({stats.totalStudents.toLocaleString()} records)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="companies"
                    checked={exportData.companies}
                    onCheckedChange={(checked) =>
                      setExportData({ ...exportData, companies: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="companies"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Companies Data ({stats.totalCompanies.toLocaleString()} records)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="drives"
                    checked={exportData.drives}
                    onCheckedChange={(checked) =>
                      setExportData({ ...exportData, drives: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="drives"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Placement Drives ({stats.activeDrives} active drives)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="applications"
                    checked={exportData.applications}
                    onCheckedChange={(checked) =>
                      setExportData({ ...exportData, applications: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="applications"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Applications Data (1,234 applications)
                  </label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
