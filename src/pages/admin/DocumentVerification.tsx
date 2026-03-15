import { useState, useEffect } from 'react';
import { FileCheck, FileText, CheckCircle, XCircle, Clock, Download, Loader2, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

const DOCUMENT_TYPES: { [key: string]: string } = {
  '10th_certificate': '10th Certificate',
  '12th_certificate': '12th Certificate',
  'degree_certificate': 'Degree Certificate',
  'marksheet': 'Marksheet',
  'id_proof': 'ID Proof',
  'other': 'Other',
};

export default function DocumentVerification() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifyDialog, setVerifyDialog] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [action, setAction] = useState<'verify' | 'reject'>('verify');
  const [remarks, setRemarks] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, rejected: 0 });

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, [statusFilter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await api.documents.getAllDocuments(statusFilter);
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load documents",
        variant: "destructive",
      });
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api.documents.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleVerify = (doc: any, actionType: 'verify' | 'reject') => {
    setVerifyDialog(doc);
    setAction(actionType);
    setRemarks('');
  };

  const confirmVerification = async () => {
    if (action === 'reject' && !remarks.trim()) {
      toast({
        title: "Remarks required",
        description: "Please provide remarks for rejection",
        variant: "destructive",
      });
      return;
    }

    try {
      setVerifying(true);
      const status = action === 'verify' ? 'verified' : 'rejected';
      await api.documents.verifyDocument(verifyDialog._id, status, remarks);
      
      toast({
        title: "Success!",
        description: `Document ${status} successfully. Student will be notified via email.`,
      });

      setVerifyDialog(null);
      setRemarks('');
      fetchDocuments();
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update document status",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleDownload = async (id: string, name: string) => {
    try {
      await api.documents.download(id, name);
      toast({
        title: "Success",
        description: "Document downloaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Document Verification</h1>
          <p className="text-muted-foreground">Review and verify student documents</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Documents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-green-500">{stats.verified}</p>
              <p className="text-sm text-muted-foreground">Verified</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="pt-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Documents Table */}
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading documents...</p>
            </CardContent>
          </Card>
        ) : documents.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Documents ({documents.length})</CardTitle>
              <CardDescription>Review and verify student documents</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc._id}>
                      <TableCell className="font-medium">
                        {doc.user_id?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>{doc.student_id?.roll_number || 'N/A'}</TableCell>
                      <TableCell>{DOCUMENT_TYPES[doc.document_type] || doc.document_type}</TableCell>
                      <TableCell className="max-w-xs truncate">{doc.document_name}</TableCell>
                      <TableCell>{format(new Date(doc.uploaded_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(doc._id, doc.document_name)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {doc.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => handleVerify(doc, 'verify')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleVerify(doc, 'reject')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No documents found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Verification Dialog */}
      <Dialog open={!!verifyDialog} onOpenChange={(open) => !open && setVerifyDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'verify' ? 'Verify Document' : 'Reject Document'}
            </DialogTitle>
            <DialogDescription>
              {action === 'verify' 
                ? 'Confirm that this document is valid and verified'
                : 'Provide reason for rejection'}
            </DialogDescription>
          </DialogHeader>
          {verifyDialog && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p><strong>Student:</strong> {verifyDialog.user_id?.name}</p>
                <p><strong>Document:</strong> {DOCUMENT_TYPES[verifyDialog.document_type]}</p>
                <p><strong>File:</strong> {verifyDialog.document_name}</p>
                <p><strong>Size:</strong> {(verifyDialog.file_size / 1024).toFixed(2)} KB</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">
                  Remarks {action === 'reject' && <span className="text-red-500">*</span>}
                </Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={
                    action === 'verify'
                      ? 'Optional remarks (e.g., Document verified successfully)'
                      : 'Required: Explain why this document is rejected'
                  }
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialog(null)} disabled={verifying}>
              Cancel
            </Button>
            <Button
              onClick={confirmVerification}
              disabled={verifying}
              className={action === 'verify' ? 'bg-green-500 hover:bg-green-600' : ''}
              variant={action === 'reject' ? 'destructive' : 'default'}
            >
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : action === 'verify' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Document
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Document
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
