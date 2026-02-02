import { useState } from 'react';
import { CheckCircle, Clock, XCircle, TrendingUp, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const applications = [
  {
    id: '1',
    company: 'Google',
    role: 'Software Engineer',
    package: 2500000,
    appliedDate: '2024-02-10',
    status: 'applied',
    nextStep: 'Waiting for shortlisting',
  },
  {
    id: '2',
    company: 'Microsoft',
    role: 'Software Developer',
    package: 2200000,
    appliedDate: '2024-02-05',
    status: 'interview',
    nextStep: 'Technical Interview on Feb 20',
  },
  {
    id: '3',
    company: 'Amazon',
    role: 'SDE-1',
    package: 2800000,
    appliedDate: '2024-01-20',
    status: 'rejected',
    nextStep: 'Application closed',
  },
  {
    id: '4',
    company: 'Flipkart',
    role: 'Software Engineer',
    package: 2000000,
    appliedDate: '2024-02-08',
    status: 'interview',
    nextStep: 'HR Round scheduled',
  },
  {
    id: '5',
    company: 'TCS',
    role: 'System Engineer',
    package: 450000,
    appliedDate: '2024-01-15',
    status: 'selected',
    nextStep: 'Offer letter sent',
  },
];

export default function Applications() {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredApplications = applications.filter(
    (app) => statusFilter === 'all' || app.status === statusFilter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <Clock className="h-4 w-4" />;
      case 'interview':
        return <TrendingUp className="h-4 w-4" />;
      case 'selected':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return (
          <Badge className="bg-blue-500 gap-1">
            {getStatusIcon(status)} Applied
          </Badge>
        );
      case 'interview':
        return (
          <Badge className="bg-orange-500 gap-1">
            {getStatusIcon(status)} Interview
          </Badge>
        );
      case 'selected':
        return (
          <Badge className="bg-green-500 gap-1">
            {getStatusIcon(status)} Selected
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            {getStatusIcon(status)} Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPackage = (pkg: number) => {
    if (pkg >= 100000) {
      return `₹${(pkg / 100000).toFixed(1)} LPA`;
    }
    return `₹${pkg.toLocaleString()}`;
  };

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === 'applied').length,
    interview: applications.filter((a) => a.status === 'interview').length,
    selected: applications.filter((a) => a.status === 'selected').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">Track all your job applications</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Applied</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-blue-500">{stats.applied}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-orange-500">{stats.interview}</p>
              <p className="text-sm text-muted-foreground">In Interview</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-green-500">{stats.selected}</p>
              <p className="text-sm text-muted-foreground">Selected</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="pt-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="interview">In Interview</SelectItem>
                <SelectItem value="selected">Selected</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications ({filteredApplications.length})</CardTitle>
            <CardDescription>Your job application history</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Step</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.company}</TableCell>
                    <TableCell>{app.role}</TableCell>
                    <TableCell className="text-primary font-medium">
                      {formatPackage(app.package)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(app.appliedDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {app.nextStep}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
