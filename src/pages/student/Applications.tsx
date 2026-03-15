import { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, TrendingUp, Filter, Loader2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import api, { offerLetterAPI } from '@/services/api';

export default function Applications() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState('all');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDownloadOfferLetter = async (appId: string) => {
    try {
      await offerLetterAPI.download(appId);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Download failed', variant: 'destructive' });
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      console.log('Fetching student applications from backend...');
      console.log('Token:', localStorage.getItem('token'));
      
      const data = await api.applications.getStudentApplications();
      console.log('Applications received:', data);
      
      if (Array.isArray(data)) {
        setApplications(data);
        console.log(`Loaded ${data.length} applications`);
      } else {
        console.error('Invalid data format:', data);
        setApplications([]);
      }
    } catch (error: any) {
      console.error('Failed to load applications:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load applications",
        variant: "destructive",
      });
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

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
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'applied':
        return (
          <Badge className="bg-blue-500 gap-1">
            {getStatusIcon('applied')} Applied
          </Badge>
        );
      case 'shortlisted':
        return (
          <Badge className="bg-orange-500 gap-1">
            {getStatusIcon('interview')} Shortlisted
          </Badge>
        );
      case 'selected':
        return (
          <Badge className="bg-green-500 gap-1">
            {getStatusIcon('selected')} Selected
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            {getStatusIcon('rejected')} Rejected
          </Badge>
        );
      case 'on hold':
        return (
          <Badge className="bg-yellow-500 gap-1">
            <Clock className="h-4 w-4" /> On Hold
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
    applied: applications.filter((a) => a.status.toLowerCase() === 'applied').length,
    interview: applications.filter((a) => a.status.toLowerCase() === 'shortlisted').length,
    selected: applications.filter((a) => a.status.toLowerCase() === 'selected').length,
    rejected: applications.filter((a) => a.status.toLowerCase() === 'rejected').length,
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
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="selected">Selected</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="on hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading applications...</p>
            </CardContent>
          </Card>
        )}

        {/* Applications Table */}
        {!loading && (
          <Card>
            <CardHeader>
              <CardTitle>Applications ({filteredApplications.length})</CardTitle>
              <CardDescription>Your job application history</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredApplications.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Skill Match</TableHead>
                      <TableHead>HR Response</TableHead>
                      <TableHead>Admin Response</TableHead>
                      <TableHead>Offer Letter</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.company_name}</TableCell>
                        <TableCell>{app.job_role}</TableCell>
                        <TableCell className="text-primary font-medium">
                          {formatPackage(app.package_offered)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(app.applied_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell>
                          {app.skillMatchPercentage > 0 ? (
                            <div className="space-y-1 min-w-[120px]">
                              <div className="flex items-center justify-between">
                                <span className={`text-sm font-bold ${app.skillMatchPercentage >= 75 ? 'text-green-600' : app.skillMatchPercentage >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                                  {app.skillMatchPercentage}%
                                </span>
                                {app.autoShortlisted && (
                                  <Badge className="bg-purple-500 text-xs px-1 py-0">Auto</Badge>
                                )}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${app.skillMatchPercentage >= 75 ? 'bg-green-500' : app.skillMatchPercentage >= 50 ? 'bg-orange-400' : 'bg-red-400'}`}
                                  style={{ width: `${app.skillMatchPercentage}%` }}
                                />
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {(app.matchedSkills || []).slice(0, 2).map((s: string) => (
                                  <span key={s} className="text-xs bg-green-100 text-green-700 px-1 rounded">{s}</span>
                                ))}
                                {(app.missingSkills || []).slice(0, 1).map((s: string) => (
                                  <span key={s} className="text-xs bg-red-100 text-red-600 px-1 rounded">-{s}</span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {(app as any).hr_remarks ? (
                            <div className="max-w-xs">
                              <p className="text-sm">{(app as any).hr_remarks}</p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {(app as any).admin_remarks ? (
                            <div className="max-w-xs">
                              <p className="text-sm">{(app as any).admin_remarks}</p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {app.status.toLowerCase() === 'selected' && (app as any).hasOfferLetter ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-green-600 border-green-400 hover:bg-green-50"
                              onClick={() => handleDownloadOfferLetter(app.id)}
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          ) : app.status.toLowerCase() === 'selected' ? (
                            <span className="text-xs text-muted-foreground">Pending</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No applications found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
