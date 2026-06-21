import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  UserPlus,
  Mail,
  Lock,
  Building2,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCompanies } from '@/contexts/CompaniesContext';
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

interface HRCredential {
  id: string;
  userId: string;
  name: string;
  email: string;
  companyId: string;
  companyName: string;
  createdAt: string;
}

export default function HRCredentials() {
  const { toast } = useToast();
  const { companies } = useCompanies();
  const [hrCredentials, setHrCredentials] = useState<HRCredential[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedHR, setSelectedHR] = useState<HRCredential | null>(null);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyId: '',
  });

  useEffect(() => {
    loadHRCredentials();
  }, []);

  const loadHRCredentials = async () => {
    try {
      setLoading(true);
      const response = await api.admin.getHRUsers();
      if (response.success) {
        setHrCredentials(response.hrUsers);
      }
    } catch (error: any) {
      console.error('Failed to load HR users:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load HR credentials',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      companyId: '',
    });
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.companyId) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.admin.createHRUser(formData);
      
      if (response.success) {
        toast({
          title: "HR Credential Created!",
          description: `Login credentials created successfully`,
        });
        
        setIsAddDialogOpen(false);
        resetForm();
        loadHRCredentials();
      }
    } catch (error: any) {
      // Show specific error message from backend
      const errorMsg = error.response?.data?.message || error.message || "Failed to create HR user";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error('Create HR error details:', error.response?.data || error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedHR) return;

    try {
      setSubmitting(true);
      const response = await api.admin.updateHRUser(selectedHR.id, formData);
      
      if (response.success) {
        toast({
          title: "Credential Updated!",
          description: "HR login credentials have been updated",
        });
        
        setIsEditDialogOpen(false);
        setSelectedHR(null);
        resetForm();
        loadHRCredentials();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update HR credential",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedHR) return;

    try {
      setSubmitting(true);
      const response = await api.admin.deleteHRUser(selectedHR.id);
      
      if (response.success) {
        toast({
          title: "Credential Deleted!",
          description: `HR access for ${selectedHR.companyName} has been removed`,
        });
        
        setIsDeleteDialogOpen(false);
        setSelectedHR(null);
        loadHRCredentials();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete HR credential",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (hr: HRCredential) => {
    setSelectedHR(hr);
    setFormData({
      name: hr.name,
      email: hr.email,
      password: '',
      companyId: hr.companyId,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (hr: HRCredential) => {
    setSelectedHR(hr);
    setIsDeleteDialogOpen(true);
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCredentials = hrCredentials.filter(hr =>
    hr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hr.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hr.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading HR credentials...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">HR Credentials</h1>
            <p className="text-muted-foreground">
              Manage HR login credentials for companies
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create HR Login
            </Button>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create HR Login</DialogTitle>
                <DialogDescription>
                  Create login credentials for company HR
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="company">Company *</Label>
                  <Select
                    value={formData.companyId}
                    onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.name}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">HR Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="hr@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      type="text"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generatePassword}
                    >
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Login'}
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
                placeholder="Search by name, email, or company..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* HR Credentials List */}
        <div className="space-y-4">
          {filteredCredentials.map((hr) => (
            <Card key={hr.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <UserPlus className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{hr.name}</h3>
                        <Badge variant="outline">{hr.companyName}</Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{hr.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          <span className="text-xs text-muted-foreground">
                            Password stored securely
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(hr)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => openDeleteDialog(hr)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredCredentials.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No HR credentials found. Create login credentials for companies.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit HR Login</DialogTitle>
            <DialogDescription>Update HR login credentials</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-company">Company *</Label>
              <Select
                value={formData.companyId}
                onValueChange={(value) => setFormData({ ...formData, companyId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.name}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-name">HR Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">New Password (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-password"
                  type="text"
                  placeholder="Leave empty to keep current"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <Button type="button" variant="outline" onClick={generatePassword}>
                  Generate
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedHR(null);
                resetForm();
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete HR access for{' '}
              <span className="font-semibold">{selectedHR?.companyName}</span>. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedHR(null)} disabled={submitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
