import { useState, useEffect } from 'react';
import { Building2, CheckCircle, XCircle, Clock, Mail, Phone, Globe } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface CompanyRequest {
  _id: string;
  companyName: string;
  industry: string;
  website: string;
  hrName: string;
  hrEmail: string;
  hrPhone: string;
  status: 'pending' | 'approved' | 'rejected';
  adminRemarks: string;
  createdAt: string;
  reviewedAt?: string;
}

export default function CompanyRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState('');

  useEffect(() => { fetchRequests(); }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = filter === 'all'
        ? `${API_BASE}/company-requests`
        : `${API_BASE}/company-requests?status=${filter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, name: string) => {
    try {
      setProcessing(id);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/company-requests/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: '✅ Approved!', description: `${name} approved. HR login is now active for ${data.hrEmail}` });
        fetchRequests();
      } else {
        toast({ title: 'Error', description: data.message, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to approve', variant: 'destructive' });
    } finally {
      setProcessing('');
    }
  };

  const handleReject = async () => {
    try {
      setProcessing(rejectDialog.id);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/company-requests/${rejectDialog.id}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: 'Rejected', description: `${rejectDialog.name} request rejected` });
        setRejectDialog({ open: false, id: '', name: '' });
        setRemarks('');
        fetchRequests();
      } else {
        toast({ title: 'Error', description: data.message, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to reject', variant: 'destructive' });
    } finally {
      setProcessing('');
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const statusBadge = (status: string) => {
    if (status === 'pending') return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    if (status === 'approved') return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
    return <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Company Registration Requests</h1>
            <p className="text-muted-foreground">
              Review and approve company self-registration requests
              {pendingCount > 0 && <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-semibold">{pendingCount} pending</span>}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {(['pending', 'approved', 'rejected'] as const).map(s => {
            const count = s === 'all' ? requests.length : requests.filter(r => r.status === s).length;
            const colors = { pending: 'text-yellow-600', approved: 'text-green-600', rejected: 'text-red-600' };
            return (
              <Card key={s} className={`cursor-pointer border-2 transition-colors ${filter === s ? 'border-primary' : 'border-transparent'}`} onClick={() => setFilter(s)}>
                <CardContent className="pt-6">
                  <p className={`text-2xl font-bold ${colors[s]}`}>{count}</p>
                  <p className="text-sm text-muted-foreground capitalize">{s}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)} className="capitalize">{f}</Button>
          ))}
        </div>

        {/* Requests list */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading requests...</div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-muted-foreground">No {filter === 'all' ? '' : filter} requests found</p>
              <p className="text-sm text-muted-foreground mt-1">Companies can register at <code className="bg-gray-100 px-1 rounded">/company/register</code></p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <Card key={req._id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{req.companyName}</h3>
                            {statusBadge(req.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{req.industry}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{req.hrEmail}</span>
                        </div>
                        {req.hrPhone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{req.hrPhone}</span>
                          </div>
                        )}
                        {req.website && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5" />
                            <a href={req.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">{req.website}</a>
                          </div>
                        )}
                      </div>

                      <div className="mt-2 text-xs text-muted-foreground">
                        <span><b>HR Contact:</b> {req.hrName}</span>
                        <span className="ml-4"><b>Submitted:</b> {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        {req.reviewedAt && <span className="ml-4"><b>Reviewed:</b> {new Date(req.reviewedAt).toLocaleDateString()}</span>}
                      </div>

                      {req.adminRemarks && (
                        <div className="mt-2 text-sm text-red-600 bg-red-50 rounded px-2 py-1">
                          <b>Rejection reason:</b> {req.adminRemarks}
                        </div>
                      )}
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprove(req._id, req.companyName)}
                          disabled={processing === req._id}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {processing === req._id ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => setRejectDialog({ open: true, id: req._id, name: req.companyName })}
                          disabled={processing === req._id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {req.status === 'approved' && (
                      <Badge className="bg-green-50 text-green-700 border-green-200 shrink-0">
                        <CheckCircle className="h-3 w-3 mr-1" /> HR Login Active
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(o) => !o && setRejectDialog({ open: false, id: '', name: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request — {rejectDialog.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Optionally provide a reason for rejection:</p>
            <Textarea
              placeholder="e.g. Incomplete information provided..."
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, id: '', name: '' })}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!!processing}>
              {processing ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
