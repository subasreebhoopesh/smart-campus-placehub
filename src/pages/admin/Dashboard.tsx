import {
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { recentActivities, placementDrives } from '@/lib/data';
import { format } from 'date-fns';

const statCards = [
  {
    title: 'Total Students',
    value: '2,547',
    change: '+12%',
    trend: 'up',
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    title: 'Partner Companies',
    value: '156',
    change: '+8%',
    trend: 'up',
    icon: Building2,
    color: 'bg-green-500',
  },
  {
    title: 'Active Drives',
    value: '12',
    change: '+3',
    trend: 'up',
    icon: Briefcase,
    color: 'bg-purple-500',
  },
  {
    title: 'Placement Rate',
    value: '78.5%',
    change: '-2.1%',
    trend: 'down',
    icon: TrendingUp,
    color: 'bg-orange-500',
  },
];

export default function AdminDashboard() {
  const upcomingDrives = placementDrives.filter((d) => d.status === 'upcoming').slice(0, 4);

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

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest updates from the placement cell</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <div
                      className={`p-2 rounded-full ${
                        activity.type === 'placement'
                          ? 'bg-green-100 text-green-600'
                          : activity.type === 'drive'
                          ? 'bg-blue-100 text-blue-600'
                          : activity.type === 'registration'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}
                    >
                      {activity.type === 'placement' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : activity.type === 'drive' ? (
                        <Briefcase className="h-4 w-4" />
                      ) : activity.type === 'registration' ? (
                        <Users className="h-4 w-4" />
                      ) : (
                        <Building2 className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
              <Button variant="outline" className="w-full mt-4">
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
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <Users className="h-5 w-5" />
                <span>Add Student</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <Building2 className="h-5 w-5" />
                <span>Add Company</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <Briefcase className="h-5 w-5" />
                <span>Create Drive</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <TrendingUp className="h-5 w-5" />
                <span>View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
