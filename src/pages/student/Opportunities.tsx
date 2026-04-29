import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Building2, Users, Loader2, CheckCircle, XCircle, Zap, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import api from '@/services/api';
import { assessmentAPI } from '@/services/api';

// Company logo mapping
const companyLogos: { [key: string]: string } = {
  'Google': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  'Microsoft': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
  'Amazon': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  'TCS': 'https://upload.wikimedia.org/wikipedia/commons/9/95/Tata_Consultancy_Services_Logo.svg',
  'Intel': 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg',
  'Flipkart': 'https://upload.wikimedia.org/wikipedia/en/7/7a/Flipkart_logo.svg',
  'L&T': 'https://upload.wikimedia.org/wikipedia/en/0/03/Larsen_%26_Toubro_logo.svg',
  'Infosys': 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
};

export default function Opportunities() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [applyDialog, setApplyDialog] = useState<any>(null);
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [studentApplications, setStudentApplications] = useState<any[]>([]);
  const [assessmentStatus, setAssessmentStatus] = useState<Record<string, any>>({});
  const navigate = useNavigate();

  // Fetch student profile and drives on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching student opportunities...');
      
      // Fetch student profile to get CGPA and branch
      const profileData = await api.students.getProfile();
      console.log('Student profile:', profileData);
      setStudentProfile(profileData);

      // Fetch student's applications to filter out already applied drives
      const applicationsData = await api.applications.getStudentApplications();
      console.log('Student applications:', applicationsData);
      setStudentApplications(Array.isArray(applicationsData) ? applicationsData : []);

      // Fetch all drives
      const drivesData = await api.drives.getAll();
      console.log('Drives data received:', drivesData);
      
      // Handle both array and object responses
      if (Array.isArray(drivesData)) {
        setDrives(drivesData);
        // Fetch assessment status for each drive
        const statusMap: Record<string, any> = {};
        await Promise.all(drivesData.map(async (d: any) => {
          try {
            const a = await assessmentAPI.getForDrive(d.id);
            if (a) statusMap[d.id] = { exists: true, attempted: a.alreadyAttempted, result: a.result };
          } catch (_e) {
            // ignore assessment fetch errors
          }
        }));
        setAssessmentStatus(statusMap);
      } else if (drivesData && Array.isArray(drivesData.drives)) {
        setDrives(drivesData.drives);
      } else {
        console.error('Unexpected drives data format:', drivesData);
        setDrives([]);
      }
    } catch (error: any) {
      console.error('Failed to load opportunities:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load opportunities",
        variant: "destructive",
      });
      // Set empty arrays to prevent crashes
      setDrives([]);
      setStudentApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const eligibleDrives = (drives || []).filter((drive) => {
    if (!studentProfile) {
      console.log('No student profile found');
      return false;
    }
    
    // Check if student has already applied for this drive
    const hasApplied = studentApplications.some(app => {
      // Match by drive ID or company name + job role
      return app.id === drive.id || 
             app.drive_id === drive.id ||
             (app.company_name === drive.company_name && app.job_role === drive.job_role);
    });
    
    if (hasApplied) {
      console.log('❌ Already applied - Drive hidden:', drive.company_name, '-', drive.job_role);
      return false;
    }
    
    // Parse eligible branches (stored as comma-separated string in DB)
    const eligibleBranches = drive.eligible_branches ? 
      drive.eligible_branches.split(',').map((b: string) => b.trim().toUpperCase()) : [];
    
    const studentBranch = (studentProfile.branch || '').trim().toUpperCase();
    
    console.log('Drive:', drive.company_name, '-', drive.job_role);
    console.log('Eligible branches:', eligibleBranches);
    console.log('Student branch:', studentBranch);
    
    // STRICT BRANCH CHECK: Student's branch MUST be in the eligible branches list
    // If no branches specified, don't show the drive (admin must specify branches)
    const branchMatch = eligibleBranches.length > 0 && eligibleBranches.includes(studentBranch);
    
    if (!branchMatch) {
      console.log('❌ Branch not eligible - Drive hidden');
      return false;
    }
    
    // Check CGPA requirement
    const minCgpa = drive.min_cgpa || 0;
    const studentCgpa = studentProfile.cgpa || 0;
    const cgpaMatch = studentCgpa >= minCgpa;
    
    if (!cgpaMatch) {
      console.log('❌ CGPA not sufficient - Drive hidden');
      return false;
    }
    
    console.log('✅ Student is eligible for this drive');
    
    // Search filter
    const matchesSearch =
      drive.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.job_role?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || drive.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatPackage = (pkg: number) => {
    if (pkg >= 100000) {
      return `₹${(pkg / 100000).toFixed(1)} LPA`;
    }
    return `₹${pkg.toLocaleString()}`;
  };

  // Calculate skill match between student and drive
  const getSkillMatch = (drive: any) => {
    const studentSkills: string[] = (studentProfile?.skills || []).map((s: string) => s.toLowerCase().trim());
    const requiredSkills: string[] = (drive.required_skills || []).map((s: string) => s.toLowerCase().trim());
    if (requiredSkills.length === 0) return { matchPercentage: 100, matched: [], missing: [], total: 0 };
    const matched: string[] = [];
    const missing: string[] = [];
    (drive.required_skills || []).forEach((req: string, i: number) => {
      const norm = req.toLowerCase().trim();
      const isMatch = studentSkills.some(s => s.includes(norm) || norm.includes(s));
      if (isMatch) matched.push(req);
      else missing.push(req);
    });
    return {
      matchPercentage: Math.round((matched.length / requiredSkills.length) * 100),
      matched,
      missing,
      total: requiredSkills.length
    };
  };

  const handleApply = (drive: any) => {
    setApplyDialog(drive);
  };

  const confirmApplication = async () => {
    try {
      setApplying(true);
      const result = await api.applications.apply(applyDialog.id);
      console.log('Application submitted successfully:', result);
      
      toast({
        title: "Application Submitted!",
        description: `Your application for ${applyDialog.company_name} - ${applyDialog.job_role} has been submitted successfully. Check "My Applications" to track your application status.`,
      });
      
      setApplyDialog(null);
      // Refresh data to update the list and hide applied drives
      await fetchData();
    } catch (error: any) {
      console.error('Application submission error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Job Opportunities</h1>
          <p className="text-muted-foreground">
            Explore placement drives matching your eligibility
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by company or role..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading opportunities...</p>
            </CardContent>
          </Card>
        )}

        {/* Opportunities Grid */}
        {!loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {eligibleDrives.map((drive) => {
              const eligibleBranches = drive.eligible_branches ? drive.eligible_branches.split(',') : [];
              const skillMatch = getSkillMatch(drive);
              const matchColor = skillMatch.matchPercentage >= 75 ? 'text-green-600' : skillMatch.matchPercentage >= 50 ? 'text-orange-500' : 'text-red-500';
              const matchBg = skillMatch.matchPercentage >= 75 ? 'bg-green-50 border-green-200' : skillMatch.matchPercentage >= 50 ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200';
              
              return (
                <Card 
                  key={drive.id} 
                  className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden group"
                  style={{
                    perspective: '1000px',
                  }}
                >
                  {/* 3D Company Logo Background */}
                  <div 
                    className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
                    style={{
                      backgroundImage: `url(${companyLogos[drive.company_name] || ''})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transform: 'translateZ(-50px)',
                    }}
                  />
                  
                  <CardHeader className="relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 w-full">
                        {/* 3D Company Logo */}
                        <div 
                          className="h-16 w-16 rounded-xl bg-white shadow-lg flex items-center justify-center p-2 transform transition-transform duration-300 group-hover:rotate-y-12 group-hover:scale-110"
                          style={{
                            transformStyle: 'preserve-3d',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                          }}
                        >
                          {companyLogos[drive.company_name] ? (
                            <img 
                              src={companyLogos[drive.company_name]} 
                              alt={drive.company_name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <Building2 className="h-8 w-8 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {drive.company_name}
                          </CardTitle>
                          <CardDescription className="font-medium">{drive.job_role}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {eligibleBranches.slice(0, 3).map((branch: string) => (
                          <Badge key={branch} variant="outline" className="text-xs">
                            {branch}
                          </Badge>
                        ))}
                        {eligibleBranches.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{eligibleBranches.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-2 rounded-lg bg-primary/5">
                          <p className="text-muted-foreground text-xs">Package</p>
                          <p className="font-bold text-primary text-lg">
                            {formatPackage(drive.package_offered)}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-primary/5">
                          <p className="text-muted-foreground text-xs">Min CGPA</p>
                          <p className="font-bold text-lg">{drive.min_cgpa}</p>
                        </div>
                      </div>

                      {/* Skill Match Section */}
                      {drive.required_skills && drive.required_skills.length > 0 && (
                        <div className={`p-3 rounded-lg border ${matchBg}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                              <Zap className="h-4 w-4 text-primary" />
                              <span className="text-xs font-semibold">Skill Match</span>
                            </div>
                            <span className={`text-sm font-bold ${matchColor}`}>
                              {skillMatch.matchPercentage}%
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                            <div
                              className={`h-1.5 rounded-full ${skillMatch.matchPercentage >= 75 ? 'bg-green-500' : skillMatch.matchPercentage >= 50 ? 'bg-orange-400' : 'bg-red-400'}`}
                              style={{ width: `${skillMatch.matchPercentage}%` }}
                            />
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {skillMatch.matched.slice(0, 3).map((s: string) => (
                              <span key={s} className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <CheckCircle className="h-2.5 w-2.5" />{s}
                              </span>
                            ))}
                            {skillMatch.missing.slice(0, 2).map((s: string) => (
                              <span key={s} className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <XCircle className="h-2.5 w-2.5" />{s}
                              </span>
                            ))}
                            {(skillMatch.matched.length + skillMatch.missing.length) > 5 && (
                              <span className="text-xs text-muted-foreground">+{skillMatch.total - 5} more</span>
                            )}
                          </div>
                          {skillMatch.matched.length < 4 && (
                            <p className="text-xs text-orange-600 mt-1">⚠ Need 4+ skill matches for auto-shortlist</p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(drive.drive_date), 'MMMM d, yyyy')}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{drive.registered_students || 0} students registered</span>
                      </div>

                      <Badge
                        className={
                          drive.status === 'upcoming'
                            ? 'bg-blue-500'
                            : drive.status === 'ongoing'
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                        }
                      >
                        {drive.status.charAt(0).toUpperCase() + drive.status.slice(1)}
                      </Badge>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {drive.description}
                      </p>

                      {/* Assessment + Apply buttons */}
                      {assessmentStatus[drive.id]?.exists && (
                        <div className="space-y-2">
                          {assessmentStatus[drive.id]?.attempted ? (
                            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-green-700 font-medium">
                                Assessment: {assessmentStatus[drive.id]?.result?.percentage}% 
                                {assessmentStatus[drive.id]?.result?.passed ? ' ✓ Passed' : ' ✗ Failed'}
                              </span>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              className="w-full border-purple-400 text-purple-600 hover:bg-purple-50"
                              onClick={() => navigate(`/student/assessment/${drive.id}`)}
                            >
                              <ClipboardList className="h-4 w-4 mr-2" />
                              Take Assessment First
                            </Button>
                          )}
                        </div>
                      )}
                      <Button 
                        className="w-full shadow-lg hover:shadow-xl transition-shadow" 
                        disabled={drive.status === 'completed'}
                        onClick={() => handleApply(drive)}
                      >
                        {drive.status === 'completed' ? 'Closed' : 'Apply Now'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && eligibleDrives.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                {drives.length === 0 
                  ? "No opportunities available yet. Check back later!"
                  : studentProfile 
                    ? `Found ${drives.length} drive(s) but none are for your branch (${studentProfile.branch}) or you don't meet the CGPA requirements. Only drives specifically for your department will be shown.`
                    : "Complete your profile to see eligible opportunities."
                }
              </p>
              {drives.length > 0 && studentProfile && (
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Your Profile:</p>
                  <p>Branch: <strong>{studentProfile.branch}</strong></p>
                  <p>CGPA: <strong>{studentProfile.cgpa || 0}</strong></p>
                  <p className="mt-4">Update your profile to match more opportunities.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Apply Confirmation Dialog */}
      <Dialog open={!!applyDialog} onOpenChange={(open) => !open && setApplyDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to apply for this position?
            </DialogDescription>
          </DialogHeader>
          {applyDialog && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{applyDialog.company_name}</p>
                  <p className="text-muted-foreground">{applyDialog.job_role}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Package</p>
                  <p className="font-semibold">{formatPackage(applyDialog.package_offered)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Drive Date</p>
                  <p className="font-semibold">{format(new Date(applyDialog.drive_date), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Min CGPA</p>
                  <p className="font-semibold">{applyDialog.min_cgpa}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="bg-blue-500">{applyDialog.status}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                By applying, you confirm that you meet the eligibility criteria and your profile information is up to date.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyDialog(null)} disabled={applying}>
              Cancel
            </Button>
            <Button onClick={confirmApplication} disabled={applying}>
              {applying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Confirm Application'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
