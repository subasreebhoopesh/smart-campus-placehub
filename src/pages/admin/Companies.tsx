import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Building2,
  Globe,
  Mail,
  Phone,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Loader2,
} from 'lucide-react';
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

interface Company {
  _id?: string;
  id?: string;
  name: string;
  industry: string;
  website: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  jobRoles: string[];
  packageOffered: { min: number; max: number };
  visitHistory: Array<{ date: string; studentsHired: number }>;
  createdAt: string;
}

export default function Companies() {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Fetch companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await api.companies.getAll();
      console.log('Companies data received:', data);
      
      // Handle both array and object responses
      if (Array.isArray(data)) {
        setCompanies(data);
      } else if (data && Array.isArray(data.companies)) {
        setCompanies(data.companies);
      } else {
        console.error('Unexpected data format:', data);
        setCompanies([]);
      }
    } catch (error: any) {
      console.error('Failed to load companies:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load companies",
        variant: "destructive",
      });
      setCompanies([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    jobRoles: '',
    minPackage: '',
    maxPackage: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      industry: '',
      website: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      jobRoles: '',
      minPackage: '',
      maxPackage: '',
    });
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.industry || !formData.contactEmail) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const newCompany = {
        name: formData.name,
        industry: formData.industry,
        website: formData.website || 'https://example.com',
        contactPerson: formData.contactPerson,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        jobRoles: formData.jobRoles.split(',').map(r => r.trim()).filter(r => r),
        packageOffered: {
          min: parseInt(formData.minPackage) || 0,
          max: parseInt(formData.maxPackage) || 0,
        },
        visitHistory: [],
      };

      await api.companies.create(newCompany);

      toast({
        title: "Company Added!",
        description: `${newCompany.name} has been added successfully.`,
      });

      setIsAddDialogOpen(false);
      resetForm();
      fetchCompanies(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add company",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedCompany) return;

    try {
      setSubmitting(true);
      const companyId = selectedCompany._id || selectedCompany.id;
      const updatedCompany = {
        name: formData.name,
        industry: formData.industry,
        website: formData.website,
        contactPerson: formData.contactPerson,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        jobRoles: formData.jobRoles.split(',').map(r => r.trim()).filter(r => r),
        packageOffered: {
          min: parseInt(formData.minPackage) || 0,
          max: parseInt(formData.maxPackage) || 0,
        },
      };

      await api.companies.update(companyId as any, updatedCompany);

      toast({
        title: "Company Updated!",
        description: `${formData.name} has been updated successfully.`,
      });

      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      resetForm();
      fetchCompanies(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update company",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCompany) return;

    try {
      const companyId = selectedCompany._id || selectedCompany.id;
      await api.companies.delete(companyId as any);

      toast({
        title: "Company Deleted!",
        description: `${selectedCompany.name} has been removed.`,
      });

      setIsDeleteDialogOpen(false);
      setSelectedCompany(null);
      fetchCompanies(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete company",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      industry: company.industry,
      website: company.website,
      contactPerson: company.contactPerson,
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      jobRoles: company.jobRoles.join(', '),
      minPackage: company.packageOffered.min.toString(),
      maxPackage: company.packageOffered.max.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (company: Company) => {
    setSelectedCompany(company);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };

  const filteredCompanies = (companies || []).filter((company) =>
    company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company?.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPackage = (pkg: { min: number; max: number }) => {
    const formatValue = (v: number) => {
      if (v >= 100000) {
        return `${(v / 100000).toFixed(1)} LPA`;
      }
      return `₹${v.toLocaleString()}`;
    };
    return `${formatValue(pkg.min)} - ${formatValue(pkg.max)}`;
  };

  const getTotalHires = (company: Company) => {
    return company.visitHistory?.reduce((sum, visit) => sum + visit.studentsHired, 0) || 0;
  };

  const getCompanyId = (company: Company) => {
    return (company._id || company.id) as string;
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Companies</h1>
            <p className="text-muted-foreground">Manage recruiting partner companies</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Company</DialogTitle>
                <DialogDescription>
                  Enter the company details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input 
                    id="companyName" 
                    placeholder="Google" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Input 
                    id="industry" 
                    placeholder="Technology" 
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    type="url" 
                    placeholder="https://example.com" 
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input 
                    id="contactPerson" 
                    placeholder="John Smith" 
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input 
                    id="contactEmail" 
                    type="email" 
                    placeholder="hr@company.com" 
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input 
                    id="contactPhone" 
                    placeholder="+91 9876543210" 
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="jobRoles">Job Roles (comma separated)</Label>
                  <Textarea 
                    id="jobRoles" 
                    placeholder="Software Engineer, Data Scientist, Product Manager" 
                    value={formData.jobRoles}
                    onChange={(e) => setFormData({...formData, jobRoles: e.target.value})}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="minPackage">Min Package (₹)</Label>
                    <Input 
                      id="minPackage" 
                      type="number" 
                      placeholder="500000" 
                      value={formData.minPackage}
                      onChange={(e) => setFormData({...formData, minPackage: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="maxPackage">Max Package (₹)</Label>
                    <Input 
                      id="maxPackage" 
                      type="number" 
                      placeholder="1500000" 
                      value={formData.maxPackage}
                      onChange={(e) => setFormData({...formData, maxPackage: e.target.value})}
                    />
                  </div>
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
                      Adding...
                    </>
                  ) : (
                    'Add Company'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading companies...</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && filteredCompanies.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No companies found. Add your first company!</p>
            </CardContent>
          </Card>
        )}

        {/* Companies Grid */}
        {!loading && filteredCompanies.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCompanies.map((company) => (
              <Card key={getCompanyId(company)} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <CardDescription>{company.industry}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openViewDialog(company)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(company)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => openDeleteDialog(company)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(company.jobRoles || []).slice(0, 3).map((role) => (
                      <Badge key={role} variant="secondary" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Package</p>
                      <p className="font-medium">{formatPackage(company.packageOffered || { min: 0, max: 0 })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Hires</p>
                      <p className="font-medium">{getTotalHires(company)} students</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{company.contactEmail || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <a
                        href={company.website || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate hover:text-primary"
                      >
                        {(company.website || '').replace('https://', '') || 'N/A'}
                      </a>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Last visited: {company.visitHistory?.[0]?.date || 'Never'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </div>

      {/* Edit Company Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update the company details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-companyName">Company Name *</Label>
              <Input 
                id="edit-companyName" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-industry">Industry *</Label>
              <Input 
                id="edit-industry" 
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input 
                id="edit-website" 
                type="url" 
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-contactPerson">Contact Person</Label>
              <Input 
                id="edit-contactPerson" 
                value={formData.contactPerson}
                onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-contactEmail">Contact Email *</Label>
              <Input 
                id="edit-contactEmail" 
                type="email" 
                value={formData.contactEmail}
                onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-contactPhone">Contact Phone</Label>
              <Input 
                id="edit-contactPhone" 
                value={formData.contactPhone}
                onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-jobRoles">Job Roles (comma separated)</Label>
              <Textarea 
                id="edit-jobRoles" 
                value={formData.jobRoles}
                onChange={(e) => setFormData({...formData, jobRoles: e.target.value})}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-minPackage">Min Package (₹)</Label>
                <Input 
                  id="edit-minPackage" 
                  type="number" 
                  value={formData.minPackage}
                  onChange={(e) => setFormData({...formData, minPackage: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-maxPackage">Max Package (₹)</Label>
                <Input 
                  id="edit-maxPackage" 
                  type="number" 
                  value={formData.maxPackage}
                  onChange={(e) => setFormData({...formData, maxPackage: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setSelectedCompany(null);
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

      {/* View Company Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedCompany?.name}
            </DialogTitle>
            <DialogDescription>
              Complete company information
            </DialogDescription>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Industry</p>
                  <p className="font-medium">{selectedCompany.industry}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Hires</p>
                  <p className="font-medium">{getTotalHires(selectedCompany)} students</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Package Range</p>
                <p className="font-medium">{formatPackage(selectedCompany.packageOffered || { min: 0, max: 0 })}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Job Roles</p>
                <div className="flex flex-wrap gap-2">
                  {(selectedCompany.jobRoles || []).map((role) => (
                    <Badge key={role} variant="secondary">{role}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Contact Information</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCompany.contactEmail || 'N/A'}</span>
                  </div>
                  {selectedCompany.contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCompany.contactPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={selectedCompany.website || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {selectedCompany.website || 'N/A'}
                    </a>
                  </div>
                </div>
              </div>

              {(selectedCompany.visitHistory || []).length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Visit History</p>
                  <div className="space-y-2">
                    {(selectedCompany.visitHistory || []).map((visit, index) => (
                      <div key={index} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                        <span>{visit.date}</span>
                        <span className="font-medium">{visit.studentsHired} students hired</span>
                      </div>
                    ))}
                  </div>
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
              This will permanently delete <span className="font-semibold">{selectedCompany?.name}</span> from the system.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedCompany(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
