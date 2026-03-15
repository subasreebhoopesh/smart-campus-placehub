import { useState, useEffect } from 'react';
import { Building2, Mail, User, Briefcase, Users, CheckCircle, Calendar, MapPin, Globe } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { format } from 'date-fns';

export default function HRProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await api.hr.getProfile();
      
      if (response.success) {
        setProfileData(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch HR profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load profile data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="hr">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!profileData) {
    return (
      <DashboardLayout userRole="hr">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No profile data available</p>
        </div>
      </DashboardLayout>
    );
  }

  const { hrInfo, companyInfo, jobOpenings, statistics } = profileData;

  return (
    <DashboardLayout userRole="hr">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">HR Profile</h1>
          <p className="text-muted-foreground">Your profile and recruitment information</p>
        </div>

        {/* HR Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              HR Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{hrInfo.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {hrInfo.email}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Role</p>
                <Badge variant="secondary">HR Personnel</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {hrInfo.createdAt ? format(new Date(hrInfo.createdAt), 'MMM d, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="font-medium text-lg">{companyInfo.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Industry</p>
                <p className="font-medium">{companyInfo.industry || 'Not specified'}</p>
              </div>
              {companyInfo.website && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Website</p>
                  <a 
                    href={companyInfo.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    {companyInfo.website}
                  </a>
                </div>
              )}
              {companyInfo.contactEmail && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Contact Email</p>
                  <p className="font-medium">{companyInfo.contactEmail}</p>
                </div>
              )}
              {companyInfo.contactPhone && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Contact Phone</p>
                  <p className="font-medium">{companyInfo.contactPhone}</p>
                </div>
              )}
              {companyInfo.description && (
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm text-muted-foreground">About Company</p>
                  <p className="font-medium">{companyInfo.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recruitment Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Recruitment Statistics
            </CardTitle>
            <CardDescription>Your overall recruitment performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 text-center">
                <p className="text-3xl font-bold text-blue-600">{statistics.totalDrives}</p>
                <p className="text-sm text-muted-foreground">Total Drives</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950 text-center">
                <p className="text-3xl font-bold text-purple-600">{statistics.totalApplications}</p>
                <p className="text-sm text-muted-foreground">Applications</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 text-center">
                <p className="text-3xl font-bold text-green-600">{statistics.totalSelections}</p>
                <p className="text-sm text-muted-foreground">Selections</p>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950 text-center">
                <p className="text-3xl font-bold text-orange-600">{statistics.activeDrives}</p>
                <p className="text-sm text-muted-foreground">Active Drives</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Job Openings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Active Job Openings
            </CardTitle>
            <CardDescription>Current placement drives from your company</CardDescription>
          </CardHeader>
          <CardContent>
            {jobOpenings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active job openings at the moment
              </div>
            ) : (
              <div className="space-y-4">
                {jobOpenings.map((job: any) => (
                  <div
                    key={job._id}
                    className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{job.jobRole}</h3>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(job.driveDate), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {job.registeredStudents} registered
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            {job.selectedStudents} selected
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {job.eligibleBranches.map((branch: string) => (
                            <Badge key={branch} variant="secondary">
                              {branch}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-2">
                          <span className="text-sm font-medium">
                            Package: Rs.{job.packageOffered} LPA
                          </span>
                          <span className="text-sm text-muted-foreground ml-3">
                            Min CGPA: {job.minCgpa}
                          </span>
                        </div>
                        {job.description && (
                          <p className="text-sm text-muted-foreground mt-2">{job.description}</p>
                        )}
                      </div>
                      <Badge 
                        variant={
                          job.status === 'upcoming' ? 'default' : 
                          job.status === 'ongoing' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
