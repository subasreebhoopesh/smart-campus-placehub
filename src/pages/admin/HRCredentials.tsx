import { useState, useEffect } from 'react';
import { Search, UserPlus, Mail, Lock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
  const [hrCredentials, setHrCredentials] = useState<HRCredential[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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
      toast({
        title: 'Error',
        description: error.message || 'Failed to load HR credentials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCredentials = hrCredentials.filter(
    (hr) =>
      hr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hr.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hr.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading HR accounts...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">HR Accounts</h1>
          <p className="text-muted-foreground">
            HR accounts registered via company self-registration
          </p>
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

        {/* HR List */}
        <div className="space-y-4">
          {filteredCredentials.map((hr) => (
            <Card key={hr.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{hr.name}</h3>
                      <Badge variant="outline">{hr.companyName}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{hr.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span className="text-xs">Password stored securely</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredCredentials.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground py-12">
                <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No HR accounts yet. HR accounts are created when you approve a company request.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
