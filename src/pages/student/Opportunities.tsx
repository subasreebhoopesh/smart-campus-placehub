import { useState } from 'react';
import { Search, Filter, Calendar, Building2 } from 'lucide-react';
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
import { placementDrives } from '@/lib/data';

const studentCgpa = 8.5;
const studentBranch = 'CSE';

export default function Opportunities() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const eligibleDrives = placementDrives.filter((drive) => {
    const isEligible =
      drive.eligibleBranches.includes(studentBranch) && studentCgpa >= drive.minCgpa;
    const matchesSearch =
      drive.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.jobRole.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || drive.status === statusFilter;
    return isEligible && matchesSearch && matchesStatus;
  });

  const formatPackage = (pkg: number) => {
    if (pkg >= 100000) {
      return `₹${(pkg / 100000).toFixed(1)} LPA`;
    }
    return `₹${pkg.toLocaleString()}`;
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

        {/* Opportunities Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {eligibleDrives.map((drive) => (
            <Card key={drive.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{drive.companyName}</CardTitle>
                      <CardDescription>{drive.jobRole}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {drive.eligibleBranches.slice(0, 3).map((branch) => (
                      <Badge key={branch} variant="outline" className="text-xs">
                        {branch}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Package</p>
                      <p className="font-bold text-primary">
                        {formatPackage(drive.packageOffered)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Min CGPA</p>
                      <p className="font-medium">{drive.minCgpa}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(drive.date), 'MMMM d, yyyy')}</span>
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

                  <Button className="w-full" disabled={drive.status === 'completed'}>
                    {drive.status === 'completed' ? 'Closed' : 'Apply Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {eligibleDrives.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No opportunities found matching your criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
