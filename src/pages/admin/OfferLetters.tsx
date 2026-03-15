import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, FileText, CheckCircle, Loader2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { offerLetterAPI } from '@/services/api';

export default function OfferLetters() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);

  useEffect(() => { fetchList(); }, []);

  const fetchList = async () => {
    try {
      setLoading(true);
      const data = await offerLetterAPI.getAdminList();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = (appId: string) => {
    setActiveAppId(appId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeAppId) return;
    e.target.value = '';

    try {
      setUploading(activeAppId);
      await offerLetterAPI.upload(activeAppId, file);
      toast({ title: 'Success', description: 'Offer letter uploaded successfully' });
      fetchList();
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(null);
      setActiveAppId(null);
    }
  };

  const handleDelete = async (appId: string) => {
    try {
      await offerLetterAPI.delete(appId);
      toast({ title: 'Deleted', description: 'Offer letter removed' });
      fetchList();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const filtered = applications.filter(app =>
    app.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    app.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    app.rollNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const withLetter = applications.filter(a => a.hasOfferLetter).length;
  const withoutLetter = applications.filter(a => !a.hasOfferLetter).length;

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Offer Letter Management</h1>
          <p className="text-muted-foreground">Upload and manage offer letters for selected students</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{applications.length}</p>
              <p className="text-sm text-muted-foreground">Total Selected Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-green-600">{withLetter}</p>
              <p className="text-sm text-muted-foreground">Offer Letters Uploaded</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-orange-500">{withoutLetter}</p>
              <p className="text-sm text-muted-foreground">Pending Upload</p>
            </CardContent>
          </Card>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Selected Students</CardTitle>
                <CardDescription>Only students with "Selected" status appear here</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search student, company..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No selected students found</p>
                <p className="text-sm text-muted-foreground mt-1">Students with "Selected" status will appear here</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Offer Letter</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(app => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{app.studentName}</p>
                          <p className="text-xs text-muted-foreground">{app.studentEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{app.rollNumber}</TableCell>
                      <TableCell>{app.branch}</TableCell>
                      <TableCell className="font-medium">{app.companyName}</TableCell>
                      <TableCell>{app.jobRole}</TableCell>
                      <TableCell>
                        {app.hasOfferLetter ? (
                          <div>
                            <Badge className="bg-green-100 text-green-700 gap-1">
                              <CheckCircle className="h-3 w-3" /> Uploaded
                            </Badge>
                            {app.offerLetterUploadedAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(app.offerLetterUploadedAt), 'MMM d, yyyy')}
                              </p>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-orange-500 border-orange-300">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUploadClick(app.id)}
                            disabled={uploading === app.id}
                          >
                            {uploading === app.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                            <span className="ml-1">{app.hasOfferLetter ? 'Replace' : 'Upload'}</span>
                          </Button>
                          {app.hasOfferLetter && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(app.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
