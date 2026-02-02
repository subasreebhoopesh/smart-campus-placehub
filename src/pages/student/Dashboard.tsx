import {
  Briefcase,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Calendar,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { placementDrives } from '@/lib/data';
import { format } from 'date-fns';

const studentProfile = {
  name: 'Rahul Sharma',
  rollNumber: 'CSE2021001',
  branch: 'CSE',
  cgpa: 8.5,
  placementStatus: 'unplaced',
  skills: ['React', 'Node.js', 'Python', 'Machine Learning'],
  appliedJobs: [
    { company: 'Google', role: 'Software Engineer', status: 'applied', date: '2024-02-10' },
    { company: 'Microsoft', role: 'Software Developer', status: 'interview', date: '2024-02-05' },
    { company: 'Amazon', role: 'SDE-1', status: 'rejected', date: '2024-01-20' },
  ],
  profileCompletion: 85,
};

export default function StudentDashboard() {
  const eligibleDrives = placementDrives.filter(
    (d) =>
      d.status === 'upcoming' &&
      d.eligibleBranches.includes(studentProfile.branch) &&
      studentProfile.cgpa >= d.minCgpa
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'interview':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'selected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <Badge className="bg-blue-500">Applied</Badge>;
      case 'interview':
        return <Badge className="bg-orange-500">Interview</Badge>;
      case 'selected':
        return <Badge className="bg-green-500">Selected</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {studentProfile.name.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Track your placement journey</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Your CGPA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{studentProfile.cgpa}</p>
              <p className="text-xs text-muted-foreground">Branch: {studentProfile.branch}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Jobs Applied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{studentProfile.appliedJobs.length}</p>
              <p className="text-xs text-muted-foreground">
                {studentProfile.appliedJobs.filter((j) => j.status === 'interview').length} in interview
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Eligible Drives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{eligibleDrives.length}</p>
              <p className="text-xs text-muted-foreground">Upcoming opportunities</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Placement Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className={
                  studentProfile.placementStatus === 'placed'
                    ? 'bg-green-500'
                    : 'bg-orange-500'
                }
              >
                {studentProfile.placementStatus === 'placed' ? 'Placed' : 'Seeking'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Profile Completion */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
            <CardDescription>Complete your profile to increase visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{studentProfile.profileCompletion}%</span>
              </div>
              <Progress value={studentProfile.profileCompletion} />
              <p className="text-sm text-muted-foreground mt-2">
                Add your resume and certifications to reach 100%
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Applied Jobs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                My Applications
              </CardTitle>
              <CardDescription>Track your job applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentProfile.appliedJobs.map((job, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <p className="font-medium">{job.company}</p>
                        <p className="text-sm text-muted-foreground">{job.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(job.status)}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(job.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Applications
              </Button>
            </CardContent>
          </Card>

          {/* Eligible Drives */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Drives for You
              </CardTitle>
              <CardDescription>Drives matching your eligibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eligibleDrives.slice(0, 3).map((drive) => (
                  <div
                    key={drive.id}
                    className="p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{drive.companyName}</p>
                      <Badge variant="secondary">
                        ₹{(drive.packageOffered / 100000).toFixed(0)} LPA
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{drive.jobRole}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {format(new Date(drive.date), 'MMM d, yyyy')}
                      </span>
                      <Button size="sm">Apply Now</Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Opportunities
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Skills Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Your Skills
            </CardTitle>
            <CardDescription>Skills listed on your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {studentProfile.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-sm">
                  {skill}
                </Badge>
              ))}
              <Button variant="outline" size="sm">
                + Add Skill
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
