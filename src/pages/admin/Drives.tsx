import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Calendar,
  Users,
  Building2,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { BRANCHES } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import api from '@/services/api';

export default function Drives() {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState<any | null>(null);

  // Fetch companies and drives on mount
  useEffect(() => {
    fetchCompanies();
    fetchDrives();
  }, []);

  const fetchCompanies = async () => {
    try {
      console.log('Admin: Fetching companies from backend...');
      const data = await api.companies.getAll();
      console.log('Admin: Companies received:', data);
      
      if (Array.isArray(data)) {
        setCompanies(data);
        console.log(`Admin: Loaded ${data.length} companies`);
      } else if (data && Array.isArray(data.companies)) {
        setCompanies(data.companies);
        console.log(`Admin: Loaded ${data.companies.length} companies`);
      } else {
        console.error('Admin: Unexpected companies format:', data);
        setCompanies([]);
      }
    } catch (error: any) {
      console.error('Admin: Failed to load companies:', error);
      setCompanies([]);
    }
  };

  // Fetch drives on mount
  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      console.log('Admin: Fetching drives from backend...');
      const data = await api.drives.getAll();
      console.log('Admin: Drives received:', data);
      
      // Handle both array and object responses
      if (Array.isArray(data)) {
        setDrives(data);
        console.log(`Admin: Loaded ${data.length} drives`);
      } else if (data && Array.isArray(data.drives)) {
        setDrives(data.drives);
        console.log(`Admin: Loaded ${data.drives.length} drives`);
      } else {
        console.error('Admin: Unexpected data format:', data);
        setDrives([]);
      }
    } catch (error: any) {
      console.error('Admin: Failed to load drives:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch drives",
        variant: "destructive",
      });
      setDrives([]);
    } finally {
      setLoading(false);
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    companyId: '',
    jobRole: '',
    date: '',
    minCgpa: '',
    packageOffered: '',
    eligibleBranches: [] as string[],
    description: '',
    status: 'upcoming',
    requiredStudents: '1',
  });

  const resetForm = () => {
    setFormData({
      companyId: '',
      jobRole: '',
      date: '',
      minCgpa: '',
      packageOffered: '',
      eligibleBranches: [],
      description: '',
      status: 'upcoming',
      requiredStudents: '1',
    });
  };

  const handleAdd = async () => {
    if (!formData.companyId || !formData.jobRole || !formData.date) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await api.drives.create({
        companyId: formData.companyId,
        jobRole: formData.jobRole,
        driveDate: formData.date,
        eligibleBranches: formData.eligibleBranches.join(','),
        minCgpa: parseFloat(formData.minCgpa) || 0,
        packageOffered: parseInt(formData.packageOffered) || 0,
        description: formData.description,
        requiredStudents: parseInt(formData.requiredStudents) || 1,
      });

      toast({
        title: "Drive Created!",
        description: "Placement drive has been created successfully.",
      });

      setIsAddDialogOpen(false);
      resetForm();
      fetchDrives(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create drive",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedDrive) return;

    try {
      setSubmitting(true);
      await api.drives.update(selectedDrive.id, {
        companyId: formData.companyId,
        jobRole: formData.jobRole,
        driveDate: formData.date,
        eligibleBranches: formData.eligibleBranches.join(','),
        minCgpa: parseFloat(formData.minCgpa) || 0,
        packageOffered: parseInt(formData.packageOffered) || 0,
        description: formData.description,
        status: formData.status,
        requiredStudents: parseInt(formData.requiredStudents) || 1,
      });

      toast({
        title: "Drive Updated!",
        description: "Drive has been updated successfully.",
      });

      setIsEditDialogOpen(false);
      setSelectedDrive(null);
      resetForm();
      fetchDrives(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update drive",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDrive) return;

    try {
      await api.drives.delete(selectedDrive.id);

      toast({
        title: "Drive Deleted!",
        description: "Drive has been removed successfully.",
      });

      setIsDeleteDialogOpen(false);
      setSelectedDrive(null);
      fetchDrives(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete drive",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (drive: any) => {
    setSelectedDrive(drive);
    const eligibleBranches = drive.eligible_branches ? drive.eligible_branches.split(',') : [];
    setFormData({
      companyId: drive.company_id?.toString() || '',
      jobRole: drive.job_role || '',
      date: drive.drive_date ? drive.drive_date.split('T')[0] : '',
      minCgpa: drive.min_cgpa?.toString() || '',
      packageOffered: drive.package_offered?.toString() || '',
      eligibleBranches: eligibleBranches,
      description: drive.description || '',
      status: drive.status || 'upcoming',
      requiredStudents: (drive.required_students || 1).toString(),
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (drive: any) => {
    setSelectedDrive(drive);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (drive: any) => {
    setSelectedDrive(drive);
    setIsDeleteDialogOpen(true);
  };

  const filteredDrives = drives.filter((drive) => {
    const matchesSearch =
      drive.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.job_role?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || drive.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-4 w-4" />;
      case 'ongoing':
        return <AlertCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return (
          <Badge className="bg-blue-500 gap-1">
            {getStatusIcon(status)} Upcoming
          </Badge>
        );
      case 'ongoing':
        return (
          <Badge className="bg-orange-500 gap-1">
            {getStatusIcon(status)} Ongoing
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-green-500 gap-1">
            {getStatusIcon(status)} Completed
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

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Placement Drives</h1>
            <p className="text-muted-foreground">Manage and track placement drives</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Drive
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Placement Drive</DialogTitle>
                <DialogDescription>
                  Enter the drive details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="company">Company *</Label>
                  <Select value={formData.companyId} onValueChange={(value) => setFormData({...formData, companyId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company._id || company.id} value={company._id || company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="jobRole">Job Role *</Label>
                  <Input 
                    id="jobRole" 
                    placeholder="Software Engineer" 
                    value={formData.jobRole}
                    onChange={(e) => setFormData({...formData, jobRole: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input 
                      id="date" 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="package">Package (₹)</Label>
                    <Input 
                      id="package" 
                      type="number" 
                      placeholder="1500000" 
                      value={formData.packageOffered}
                      onChange={(e) => setFormData({...formData, packageOffered: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="minCgpa">Min CGPA</Label>
                    <Input 
                      id="minCgpa" 
                      type="number" 
                      step="0.1" 
                      placeholder="7.0" 
                      value={formData.minCgpa}
                      onChange={(e) => setFormData({...formData, minCgpa: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="requiredStudents">Required Students 🎯</Label>
                    <Input
                      id="requiredStudents"
                      type="number"
                      min="1"
                      placeholder="e.g. 3"
                      value={formData.requiredStudents}
                      onChange={(e) => setFormData({...formData, requiredStudents: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">Drive auto-completes when this many are selected</p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Eligible Branches</Label>
                  <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                      {BRANCHES.map((branch) => (
                        <div key={branch} className="flex items-center space-x-2 py-1">
                          <input
                            type="checkbox"
                            id={`branch-${branch}`}
                            checked={formData.eligibleBranches.includes(branch)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  eligibleBranches: [...formData.eligibleBranches, branch]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  eligibleBranches: formData.eligibleBranches.filter(b => b !== branch)
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <label htmlFor={`branch-${branch}`} className="text-sm cursor-pointer">
                            {branch}
                          </label>
                        </div>
                      ))}
                    </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter drive details and requirements..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }} disabled={submitting}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Drive'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Drives List */}
        {loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading drives...</p>
            </CardContent>
          </Card>
        )}

        {!loading && filteredDrives.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No drives found. Create your first drive!</p>
            </CardContent>
          </Card>
        )}

        {!loading && filteredDrives.length > 0 && (
          <div className="space-y-4">
            {filteredDrives.map((drive) => {
              const eligibleBranches = drive.eligible_branches ? drive.eligible_branches.split(',') : [];
              
              return (
                <Card key={drive.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-7 w-7 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{drive.company_name}</h3>
                            {getStatusBadge(drive.status)}
                          </div>
                          <p className="text-muted-foreground">{drive.job_role}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {eligibleBranches.map((branch: string) => (
                              <Badge key={branch} variant="outline" className="text-xs">
                                {branch}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-8 text-sm">
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Calendar className="h-4 w-4" />
                            <span>Date</span>
                          </div>
                          <p className="font-medium">
                            {format(new Date(drive.drive_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Package</p>
                          <p className="font-medium text-primary">
                            {formatPackage(drive.package_offered)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Min CGPA</p>
                          <p className="font-medium">{drive.min_cgpa}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Users className="h-4 w-4" />
                            <span>Students</span>
                          </div>
                          <p className="font-medium">
                            {drive.selected_students || 0}/{drive.required_students || drive.registered_students || 0}
                          </p>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(drive)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="h-4 w-4 mr-2" />
                            View Applicants
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(drive)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(drive)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Drive Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Placement Drive</DialogTitle>
            <DialogDescription>
              Update the drive details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-company">Company *</Label>
              <Select value={formData.companyId} onValueChange={(value) => setFormData({...formData, companyId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company._id || company.id} value={company._id || company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-jobRole">Job Role *</Label>
              <Input 
                id="edit-jobRole" 
                value={formData.jobRole}
                onChange={(e) => setFormData({...formData, jobRole: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Date *</Label>
                <Input 
                  id="edit-date" 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-package">Package (₹)</Label>
                <Input 
                  id="edit-package" 
                  type="number" 
                  value={formData.packageOffered}
                  onChange={(e) => setFormData({...formData, packageOffered: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-minCgpa">Min CGPA</Label>
                <Input 
                  id="edit-minCgpa" 
                  type="number" 
                  step="0.1" 
                  value={formData.minCgpa}
                  onChange={(e) => setFormData({...formData, minCgpa: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Eligible Branches</Label>
                <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                  {BRANCHES.map((branch) => (
                    <div key={branch} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        id={`edit-branch-${branch}`}
                        checked={formData.eligibleBranches.includes(branch)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              eligibleBranches: [...formData.eligibleBranches, branch]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              eligibleBranches: formData.eligibleBranches.filter(b => b !== branch)
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={`edit-branch-${branch}`} className="text-sm cursor-pointer">
                        {branch}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setSelectedDrive(null);
              resetForm();
            }} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Drive Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedDrive?.company_name} - {selectedDrive?.job_role}
            </DialogTitle>
            <DialogDescription>
              Complete drive information
            </DialogDescription>
          </DialogHeader>
          {selectedDrive && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedDrive.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(selectedDrive.drive_date), 'MMM d, yyyy')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Package</p>
                  <p className="font-medium text-primary">{formatPackage(selectedDrive.package_offered)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Min CGPA</p>
                  <p className="font-medium">{selectedDrive.min_cgpa}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Registered Students</p>
                  <p className="font-medium">{selectedDrive.registered_students || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Selected Students</p>
                  <p className="font-medium">{selectedDrive.selected_students || 0}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Eligible Branches</p>
                <div className="flex flex-wrap gap-2">
                  {(selectedDrive.eligible_branches ? selectedDrive.eligible_branches.split(',') : []).map((branch: string) => (
                    <Badge key={branch} variant="outline">{branch}</Badge>
                  ))}
                </div>
              </div>

              {selectedDrive.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-sm">{selectedDrive.description}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the <span className="font-semibold">{selectedDrive?.company_name}</span> placement drive.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedDrive(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
