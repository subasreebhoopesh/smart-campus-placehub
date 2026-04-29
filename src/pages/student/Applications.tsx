import { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, TrendingUp, Filter, Loader2, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import jsPDF from 'jspdf';

const API_BASE = 'http://localhost:3001/api';

// Same color map as HR page
const companyColors: Record<string, { r: number; g: number; b: number }> = {
  google:  { r: 66,  g: 133, b: 244 },
  ibm:     { r: 0,   g: 102, b: 153 },
  wipro:   { r: 52,  g: 28,  b: 110 },
  tcs:     { r: 0,   g: 51,  b: 160 },
  infosys: { r: 0,   g: 124, b: 195 },
  default: { r: 26,  g: 26,  b: 46  },
};

function getCompanyColor(companyName: string) {
  const key = companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');
  for (const [brand, color] of Object.entries(companyColors)) {
    if (key.includes(brand)) return color;
  }
  return companyColors.default;
}

function regenerateOfferLetterPDF(offerData: any) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const color = getCompanyColor(offerData.companyName);
  const sentDate = new Date(offerData.sentAt);
  const dateStr = sentDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const joiningDate = new Date(sentDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const refNo = `${offerData.companyName.replace(/\s+/g, '').toUpperCase().slice(0, 3)}-OL-${sentDate.getFullYear()}-${String(sentDate.getMonth() + 1).padStart(2, '0')}${String(sentDate.getDate()).padStart(2, '0')}-${offerData.rollNumber}`;
  const pkg = offerData.packageOffered 
    ? offerData.packageOffered >= 100000 
      ? `${(offerData.packageOffered / 100000).toFixed(1)} LPA`
      : `₹${offerData.packageOffered.toLocaleString()}`
    : '5.0 LPA';

  doc.setFillColor(color.r, color.g, color.b);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(offerData.companyName.toUpperCase(), 15, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Human Resources Department', 15, 23);
  doc.text(`Ref: ${refNo}`, 15, 28);
  doc.text(dateStr, 195, 23, { align: 'right' });

  doc.setTextColor(color.r, color.g, color.b);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFER OF EMPLOYMENT', 105, 46, { align: 'center' });
  doc.setDrawColor(color.r, color.g, color.b);
  doc.setLineWidth(0.8);
  doc.line(55, 48, 155, 48);

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Dear ${offerData.studentName},`, 15, 60);

  const opening = `We are delighted to extend this offer of employment to you at ${offerData.companyName}. After a thorough evaluation of your academic background, technical skills, and overall profile, we are pleased to confirm your selection for the position mentioned below.`;
  const openingLines = doc.splitTextToSize(opening, 180);
  doc.text(openingLines, 15, 70);

  const boxY = 70 + openingLines.length * 6 + 4;
  doc.setFillColor(245, 247, 255);
  doc.setDrawColor(color.r, color.g, color.b);
  doc.setLineWidth(0.4);
  doc.roundedRect(15, boxY, 180, 58, 3, 3, 'FD');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(color.r, color.g, color.b);
  doc.text('APPOINTMENT DETAILS', 105, boxY + 8, { align: 'center' });

  const details = [
    ['Candidate Name', offerData.studentName],
    ['Roll Number', offerData.rollNumber],
    ['Branch', offerData.branch],
    ['Designation', offerData.jobRole],
    ['CTC Offered', pkg],
    ['Joining Date', joiningDate],
  ];

  doc.setTextColor(30, 30, 30);
  let dy = boxY + 16;
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`${label}:`, 22, dy);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, dy);
    dy += 7;
  });

  let y = boxY + 66;
  const para1 = `This offer is contingent upon successful completion of your degree and submission of all required original documents including mark sheets, degree certificate, and other credentials as requested by our HR team.`;
  const p1Lines = doc.splitTextToSize(para1, 180);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(p1Lines, 15, y);
  y += p1Lines.length * 5.5 + 5;

  const para2 = `As a member of the ${offerData.companyName} family, you will be entitled to a comprehensive benefits package including health insurance, performance bonuses, learning & development programs, and other perquisites as per company policy.`;
  const p2Lines = doc.splitTextToSize(para2, 180);
  doc.text(p2Lines, 15, y);
  y += p2Lines.length * 5.5 + 5;

  const para3 = `Please confirm your acceptance of this offer by signing and returning a copy of this letter within 7 days of receipt. We look forward to welcoming you to our team.`;
  const p3Lines = doc.splitTextToSize(para3, 180);
  doc.text(p3Lines, 15, y);
  y += p3Lines.length * 5.5 + 10;

  doc.text('Yours sincerely,', 15, y);
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(color.r, color.g, color.b);
  doc.text('HR Manager', 15, y);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(offerData.companyName, 15, y + 5);
  doc.text('Human Resources Department', 15, y + 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(color.r, color.g, color.b);
  doc.text('Candidate Acceptance', 130, y);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Signature: ___________________', 130, y + 8);
  doc.text(`Name: ${offerData.studentName}`, 130, y + 14);
  doc.text('Date: ___________________', 130, y + 20);

  doc.setFillColor(color.r, color.g, color.b);
  doc.rect(0, 282, 210, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${offerData.companyName} | Confidential Offer Letter | ${dateStr}`, 105, 291, { align: 'center' });

  doc.save(`Offer_Letter_${offerData.studentName.replace(/\s+/g, '_')}_${offerData.companyName.replace(/\s+/g, '_')}.pdf`);
}

export default function Applications() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState('all');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDownloadOfferLetter = async (appId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/offer-letters/student/offer/${appId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.offerData) {
        regenerateOfferLetterPDF(data.offerData);
        toast({ title: '✅ Offer Letter Downloaded!', description: 'Your offer letter PDF is ready.' });
      } else {
        toast({ title: 'Error', description: data.message || 'Offer letter not available', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: 'Download failed', variant: 'destructive' });
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      console.log('Fetching student applications from backend...');
      console.log('Token:', localStorage.getItem('token'));
      
      const data = await api.applications.getStudentApplications();
      console.log('Applications received:', data);
      
      if (Array.isArray(data)) {
        setApplications(data);
        console.log(`Loaded ${data.length} applications`);
      } else {
        console.error('Invalid data format:', data);
        setApplications([]);
      }
    } catch (error: any) {
      console.error('Failed to load applications:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load applications",
        variant: "destructive",
      });
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(
    (app) => statusFilter === 'all' || app.status === statusFilter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <Clock className="h-4 w-4" />;
      case 'interview':
        return <TrendingUp className="h-4 w-4" />;
      case 'selected':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'applied':
        return (
          <Badge className="bg-blue-500 gap-1">
            {getStatusIcon('applied')} Applied
          </Badge>
        );
      case 'shortlisted':
        return (
          <Badge className="bg-orange-500 gap-1">
            {getStatusIcon('interview')} Shortlisted
          </Badge>
        );
      case 'selected':
        return (
          <Badge className="bg-green-500 gap-1">
            {getStatusIcon('selected')} Selected
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            {getStatusIcon('rejected')} Rejected
          </Badge>
        );
      case 'on hold':
        return (
          <Badge className="bg-yellow-500 gap-1">
            <Clock className="h-4 w-4" /> On Hold
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

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status.toLowerCase() === 'applied').length,
    interview: applications.filter((a) => a.status.toLowerCase() === 'shortlisted').length,
    selected: applications.filter((a) => a.status.toLowerCase() === 'selected').length,
    rejected: applications.filter((a) => a.status.toLowerCase() === 'rejected').length,
  };

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">Track all your job applications</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Applied</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-blue-500">{stats.applied}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-orange-500">{stats.interview}</p>
              <p className="text-sm text-muted-foreground">In Interview</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-green-500">{stats.selected}</p>
              <p className="text-sm text-muted-foreground">Selected</p>
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
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="selected">Selected</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="on hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading applications...</p>
            </CardContent>
          </Card>
        )}

        {/* Applications Table */}
        {!loading && (
          <Card>
            <CardHeader>
              <CardTitle>Applications ({filteredApplications.length})</CardTitle>
              <CardDescription>Your job application history</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredApplications.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Skill Match</TableHead>
                      <TableHead>HR Response</TableHead>
                      <TableHead>Admin Response</TableHead>
                      <TableHead>Offer Letter</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.company_name}</TableCell>
                        <TableCell>{app.job_role}</TableCell>
                        <TableCell className="text-primary font-medium">
                          {formatPackage(app.package_offered)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(app.applied_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell>
                          {app.skillMatchPercentage > 0 ? (
                            <div className="space-y-1 min-w-[120px]">
                              <div className="flex items-center justify-between">
                                <span className={`text-sm font-bold ${app.skillMatchPercentage >= 75 ? 'text-green-600' : app.skillMatchPercentage >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                                  {app.skillMatchPercentage}%
                                </span>
                                {app.autoShortlisted && (
                                  <Badge className="bg-purple-500 text-xs px-1 py-0">Auto</Badge>
                                )}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${app.skillMatchPercentage >= 75 ? 'bg-green-500' : app.skillMatchPercentage >= 50 ? 'bg-orange-400' : 'bg-red-400'}`}
                                  style={{ width: `${app.skillMatchPercentage}%` }}
                                />
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {(app.matchedSkills || []).slice(0, 2).map((s: string) => (
                                  <span key={s} className="text-xs bg-green-100 text-green-700 px-1 rounded">{s}</span>
                                ))}
                                {(app.missingSkills || []).slice(0, 1).map((s: string) => (
                                  <span key={s} className="text-xs bg-red-100 text-red-600 px-1 rounded">-{s}</span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {(app as any).hr_remarks ? (
                            <div className="max-w-xs">
                              <p className="text-sm">{(app as any).hr_remarks}</p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {(app as any).admin_remarks ? (
                            <div className="max-w-xs">
                              <p className="text-sm">{(app as any).admin_remarks}</p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {app.status.toLowerCase() === 'selected' && (app as any).hasOfferLetter ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-green-600 border-green-400 hover:bg-green-50"
                              onClick={() => handleDownloadOfferLetter(app.id)}
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          ) : app.status.toLowerCase() === 'selected' ? (
                            <span className="text-xs text-orange-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Pending
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No applications found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
