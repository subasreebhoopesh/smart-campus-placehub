import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MoreHorizontal,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { applicationAPI } from '@/services/api';

interface Application {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  rollNumber: string;
  branch: string;
  cgpa: number;
  skills: string[];
  resumeUrl: string;
  appliedDate: string;
  status: 'applied' | 'shortlisted' | 'selected' | 'rejected' | 'on hold';
  remarks?: string;
  companyId: string;
  driveId: string;
  jobRole: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  tenthPercentage?: number;
  twelfthPercentage?: number;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string;
    link: string;
  }>;
}

export default function HRApplications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);

  useEffect(() => {
    loadApplications();
    loadRequiredSkills();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      console.log('Fetching HR applications from backend...');
      console.log('Current user:', user);
      console.log('Token:', localStorage.getItem('token'));
      
      const data = await applicationAPI.getHRApplications();
      console.log('HR applications received:', data);
      
      if (Array.isArray(data)) {
        setApplications(data);
        console.log(`Loaded ${data.length} applications for HR`);
      } else {
        console.error('Invalid data format:', data);
        setApplications([]);
      }
    } catch (error: any) {
      console.error('Failed to load applications:', error);
      
      // Don't show error toast, just log it and show empty state
      console.log('Will show empty state instead of error');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRequiredSkills = () => {
    const skills = JSON.parse(localStorage.getItem(`requiredSkills_${user?.companyId}`) || '[]');
    setRequiredSkills(skills);
  };

  const handleResumeDownload = async (resumeUrl: string, studentName: string) => {
    try {
      // Open resume in new tab for download
      const fullUrl = `http://localhost:3001${resumeUrl}`;
      window.open(fullUrl, '_blank');
      
      toast({
        title: "Resume Opening",
        description: `Opening ${studentName}'s resume in a new tab`,
      });
    } catch (error: any) {
      console.error('Failed to download resume:', error);
      toast({
        title: "Error",
        description: "Failed to open resume",
        variant: "destructive",
      });
    }
  };

  const calculateSkillMatch = (studentSkills: string[]) => {
    if (requiredSkills.length === 0) return 0;
    const matchedSkills = studentSkills.filter(skill =>
      requiredSkills.some(req => req.toLowerCase() === skill.toLowerCase())
    );
    return Math.round((matchedSkills.length / requiredSkills.length) * 100);
  };

  const handleStatusUpdate = async () => {
    if (!selectedApplication) return;

    try {
      await applicationAPI.updateStatus(selectedApplication.id, newStatus, remarks);

      // Update local state
      const updatedApplications = applications.map(app =>
        app.id === selectedApplication.id
          ? { ...app, status: newStatus as any, remarks }
          : app
      );
      setApplications(updatedApplications);

      toast({
        title: "Status Updated!",
        description: `${selectedApplication.studentName}'s status updated to ${newStatus}`,
      });

      setIsStatusDialogOpen(false);
      setSelectedApplication(null);
      setRemarks('');
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openStatusDialog = (app: Application, status: string) => {
    setSelectedApplication(app);
    setNewStatus(status);
    setRemarks(app.remarks || '');
    setIsStatusDialogOpen(true);
  };

  const openViewDialog = (app: Application) => {
    setSelectedApplication(app);
    setIsViewDialogOpen(true);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.branch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      applied: <Badge variant="outline" className="bg-blue-50">Applied</Badge>,
      shortlisted: <Badge className="bg-purple-500">Shortlisted</Badge>,
      selected: <Badge className="bg-green-500">Selected</Badge>,
      rejected: <Badge className="bg-red-500">Rejected</Badge>,
      'on hold': <Badge className="bg-orange-500">On Hold</Badge>,
    };
    return badges[status as keyof typeof badges] || <Badge>{status}</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout userRole="hr">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="hr">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Applications</h1>
            <p className="text-muted-foreground">
              Review and manage student applications ({applications.length} total)
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, roll number, or branch..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="selected">Selected</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="on hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const skillMatch = calculateSkillMatch(app.skills);
            return (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{app.studentName}</h3>
                        {getStatusBadge(app.status)}
                        {skillMatch >= 70 && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {skillMatch}% Match
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Roll:</span> {app.rollNumber}
                        </div>
                        <div>
                          <span className="font-medium">Branch:</span> {app.branch}
                        </div>
                        <div>
                          <span className="font-medium">CGPA:</span> {app.cgpa}
                        </div>
                        <div>
                          <span className="font-medium">Applied:</span> {app.appliedDate}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {app.skills.slice(0, 5).map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className={
                              requiredSkills.some(req => req.toLowerCase() === skill.toLowerCase())
                                ? 'bg-green-100 text-green-800'
                                : ''
                            }
                          >
                            {skill}
                          </Badge>
                        ))}
                        {app.skills.length > 5 && (
                          <Badge variant="outline">+{app.skills.length - 5} more</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewDialog(app)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openStatusDialog(app, 'shortlisted')}>
                            <CheckCircle className="h-4 w-4 mr-2 text-purple-600" />
                            Shortlist
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openStatusDialog(app, 'selected')}>
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Select
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openStatusDialog(app, 'on hold')}>
                            <Clock className="h-4 w-4 mr-2 text-orange-600" />
                            On Hold
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openStatusDialog(app, 'rejected')}>
                            <XCircle className="h-4 w-4 mr-2 text-red-600" />
                            Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredApplications.length === 0 && !loading && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                {applications.length === 0 
                  ? "No applications received yet. Students will appear here once they apply to your drives."
                  : "No applications match your search criteria."}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* View Application Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>Complete student information</DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="font-medium">{selectedApplication.studentName}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedApplication.studentEmail}</p>
                </div>
                <div>
                  <Label>Roll Number</Label>
                  <p className="font-medium">{selectedApplication.rollNumber}</p>
                </div>
                <div>
                  <Label>Branch</Label>
                  <p className="font-medium">{selectedApplication.branch}</p>
                </div>
                <div>
                  <Label>CGPA</Label>
                  <p className="font-medium">{selectedApplication.cgpa}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedApplication.status)}</div>
                </div>
              </div>

              {selectedApplication.phone && (
                <div>
                  <Label>Phone</Label>
                  <p className="font-medium">{selectedApplication.phone}</p>
                </div>
              )}

              {(selectedApplication.linkedin || selectedApplication.github) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedApplication.linkedin && (
                    <div>
                      <Label>LinkedIn</Label>
                      <a href={selectedApplication.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        View Profile
                      </a>
                    </div>
                  )}
                  {selectedApplication.github && (
                    <div>
                      <Label>GitHub</Label>
                      <a href={selectedApplication.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        View Profile
                      </a>
                    </div>
                  )}
                </div>
              )}

              {(selectedApplication.tenthPercentage || selectedApplication.twelfthPercentage) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedApplication.tenthPercentage && (
                    <div>
                      <Label>10th Percentage</Label>
                      <p className="font-medium">{selectedApplication.tenthPercentage}%</p>
                    </div>
                  )}
                  {selectedApplication.twelfthPercentage && (
                    <div>
                      <Label>12th Percentage</Label>
                      <p className="font-medium">{selectedApplication.twelfthPercentage}%</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedApplication.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className={
                        requiredSkills.some(req => req.toLowerCase() === skill.toLowerCase())
                          ? 'bg-green-100 text-green-800'
                          : ''
                      }
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Skill Match: {calculateSkillMatch(selectedApplication.skills)}%
                </p>
              </div>

              {selectedApplication.projects && selectedApplication.projects.length > 0 && (
                <div>
                  <Label>Projects</Label>
                  <div className="space-y-2 mt-2">
                    {selectedApplication.projects.map((project, idx) => (
                      <div key={idx} className="border rounded p-3">
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                        <p className="text-sm mt-1"><span className="font-medium">Tech:</span> {project.technologies}</p>
                        {project.link && (
                          <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                            View Project
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedApplication.remarks && (
                <div>
                  <Label>Remarks</Label>
                  <p className="text-sm mt-1">{selectedApplication.remarks}</p>
                </div>
              )}

              {selectedApplication.resumeUrl && (
                <div>
                  <Label>Resume</Label>
                  <Button 
                    variant="outline" 
                    className="mt-2 w-full" 
                    size="sm"
                    onClick={() => handleResumeDownload(selectedApplication.resumeUrl, selectedApplication.studentName)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
            <DialogDescription>
              Change status for {selectedApplication?.studentName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Status</Label>
              <p className="font-medium mt-1 capitalize">{newStatus.replace('-', ' ')}</p>
            </div>
            <div>
              <Label htmlFor="remarks">Remarks / Feedback</Label>
              <Textarea
                id="remarks"
                placeholder="Add your feedback or remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
