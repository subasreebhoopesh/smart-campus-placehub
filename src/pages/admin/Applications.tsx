import { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, Eye, MessageSquare, Loader2, Filter } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

export default function AdminApplications() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState('all');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [responseDialog, setResponseDialog] = useState(false);
  const [responseStatus, setResponseStatus] = useState('');
  const [responseRemarks, setResponseRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      console.log('Fetching all applications for admin...');
      
      const data = await api.admin.getAllApplications();
      console.log('Applications received:', data);
      
      if (Array.isArray(data)) {
        // Remove duplicates based on application ID
        const uniqueApplications = data.filter((app, index, self) =>
          index === self.findIndex((a) => a.id.toString() === app.id.toString())
        );
        
        console.log(`Received ${data.length} applications, ${uniqueApplications.length} unique`);
        setApplications(uniqueApplications);
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

  const handleOpenResponse = (app: any) => {
    setSelectedApp(app);
    setResponseStatus(app.status || 'applied');
    setResponseRemarks(app.admin_remarks || '');
    setResponseDialog(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedApp) return;

    if (!responseRemarks.trim()) {
      toast({
        title: "Remarks Required",
        description: "Please provide remarks for the student",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await api.admin.respondToApplication(selectedApp.id, {
        status: responseStatus,
        adminRemarks: responseRemarks
      });

      toast({
        title: "Response Sent!",
        description: "Your response has been sent to the student",
      });

      setResponseDialog(false);
      fetchApplications(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to send response:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send response",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredApplications = applications.filter(
    (app) => statusFilter === 'all' || app.status === statusFilter
  );

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'applied':
        return (
          <Badge className="bg-blue-500 gap-1">
            <Clock className="h-3 w-3" /> Applied
          </Badge>
        );
      case 'shortlisted':
        return (
          <Badge className="bg-orange-500 gap-1">
            <CheckCircle className="h-3 w-3" /> Shortlisted
          </Badge>
        );
      case 'selected':
        return (
          <Badge className="bg-green-500 gap-1">
            <CheckCircle className="h-3 w-3" /> Selected
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      case 'on hold':
        return (
          <Badge className="bg-yellow-500 gap-1">
            <Clock className="h-3 w-3" /> On Hold
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
    pending: applications.filter((a) => a.status.toLowerCase() === 'applied').length,
    shortlisted: applications.filter((a) => a.status.toLowerCase() === 'shortlisted').length,
    selected: applications.filter((a) => a.status.toLowerCase() === 'selected').length,
    rejected: applications.filter((a) => a.status.toLowerCase() === 'rejected').length,
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Student Applications</h1>
          <p className="text-muted-foreground">Review and respond to student applications</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Applications</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-blue-500">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-orange-500">{stats.shortlisted}</p>
              <p className="text-sm text-muted-foreground">Shortlisted</p>
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
                <SelectItem value="applied">Pending Review</SelectItem>
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
              <CardDescription>All student applications across all drives</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredApplications.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>CGPA</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Skill Match</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => (
                      <TableRow key={String(app.id)}>
                        <TableCell className="font-medium">{app.student_name}</TableCell>
                        <TableCell>{app.roll_number}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{app.branch}</Badge>
                        </TableCell>
                        <TableCell>{app.company_name}</TableCell>
                        <TableCell>{app.job_role}</TableCell>
                        <TableCell className="font-medium">{app.cgpa}</TableCell>
                        <TableCell>
                          {format(new Date(app.applied_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell>
                          {(app as any).skillMatchPercentage > 0 ? (
                            <div className="space-y-1 min-w-[100px]">
                              <div className="flex items-center gap-1">
                                <span className={`text-sm font-bold ${(app as any).skillMatchPercentage >= 75 ? 'text-green-600' : (app as any).skillMatchPercentage >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                                  {(app as any).skillMatchPercentage}%
                                </span>
                                {(app as any).autoShortlisted && (
                                  <Badge className="bg-purple-500 text-xs px-1 py-0">Auto</Badge>
                                )}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${(app as any).skillMatchPercentage >= 75 ? 'bg-green-500' : (app as any).skillMatchPercentage >= 50 ? 'bg-orange-400' : 'bg-red-400'}`}
                                  style={{ width: `${(app as any).skillMatchPercentage}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenResponse(app)}
                            className="gap-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Respond
                          </Button>
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

      {/* Response Dialog */}
      <Dialog open={responseDialog} onOpenChange={setResponseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Respond to Application
            </DialogTitle>
            <DialogDescription>
              Send feedback to {selectedApp?.student_name} for their application to {selectedApp?.company_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApp && (
            <div className="space-y-4 py-4">
              {/* Student Details */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Student Name</p>
                    <p className="font-medium">{selectedApp.student_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Roll Number</p>
                    <p className="font-medium">{selectedApp.roll_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Branch</p>
                    <p className="font-medium">{selectedApp.branch}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CGPA</p>
                    <p className="font-medium">{selectedApp.cgpa}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{selectedApp.company_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium">{selectedApp.job_role}</p>
                  </div>
                </div>
              </div>

              {/* Skill Match Info */}
              {(selectedApp as any).skillMatchPercentage > 0 && (
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <p className="text-sm font-medium text-purple-900 mb-2">
                    Skill Match: <span className="font-bold">{(selectedApp as any).skillMatchPercentage}%</span>
                    {(selectedApp as any).autoShortlisted && <Badge className="ml-2 bg-purple-500 text-xs">Auto-Shortlisted</Badge>}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div className={`h-2 rounded-full ${(selectedApp as any).skillMatchPercentage >= 75 ? 'bg-green-500' : (selectedApp as any).skillMatchPercentage >= 50 ? 'bg-orange-400' : 'bg-red-400'}`}
                      style={{ width: `${(selectedApp as any).skillMatchPercentage}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {((selectedApp as any).matchedSkills || []).map((s: string) => (
                      <span key={s} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">✓ {s}</span>
                    ))}
                    {((selectedApp as any).missingSkills || []).map((s: string) => (
                      <span key={s} className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">✗ {s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* HR Response (if exists) */}
              {(selectedApp as any).hr_remarks && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">HR Response:</p>
                  <p className="text-sm text-blue-800">{(selectedApp as any).hr_remarks}</p>
                </div>
              )}

              {/* Status Selection */}
              <div className="space-y-2">
                <Label htmlFor="status">Application Status *</Label>
                <Select value={responseStatus} onValueChange={setResponseStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applied">Applied (Pending)</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="selected">Selected</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="on hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Admin Remarks */}
              <div className="space-y-2">
                <Label htmlFor="remarks">Admin Remarks *</Label>
                <Textarea
                  id="remarks"
                  placeholder="Provide feedback to the student (e.g., 'Congratulations! You have been shortlisted for the next round.' or 'Unfortunately, you do not meet the eligibility criteria.')"
                  value={responseRemarks}
                  onChange={(e) => setResponseRemarks(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  This message will be visible to the student in their applications page
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setResponseDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitResponse}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Response
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
