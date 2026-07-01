import { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import jsPDF from 'jspdf';


interface SelectedStudent {
  id: string;
  studentName: string;
  studentEmail: string;
  rollNumber: string;
  branch: string;
  companyName: string;
  jobRole: string;
  packageOffered?: number;
  hasOfferLetter: boolean;
  offerLetterUploadedAt?: string;
}

// Company brand colors
const companyColors: Record<string, { primary: string; r: number; g: number; b: number }> = {
  google:  { primary: '#4285F4', r: 66,  g: 133, b: 244 },
  ibm:     { primary: '#006699', r: 0,   g: 102, b: 153 },
  wipro:   { primary: '#341C6E', r: 52,  g: 28,  b: 110 },
  tcs:     { primary: '#0033A0', r: 0,   g: 51,  b: 160 },
  infosys: { primary: '#007CC3', r: 0,   g: 124, b: 195 },
  default: { primary: '#1a1a2e', r: 26,  g: 26,  b: 46  },
};

function getCompanyColor(companyName: string) {
  const key = companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');
  for (const [brand, color] of Object.entries(companyColors)) {
    if (key.includes(brand)) return color;
  }
  return companyColors.default;
}

function generateOfferLetterPDF(student: SelectedStudent) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const color = getCompanyColor(student.companyName);
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const joiningDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const refNo = `${student.companyName.replace(/\s+/g, '').toUpperCase().slice(0, 3)}-OL-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${student.rollNumber}`;
  const pkg = student.packageOffered 
    ? student.packageOffered >= 100000 
      ? `${(student.packageOffered / 100000).toFixed(1)} LPA`
      : `₹${student.packageOffered.toLocaleString()}`
    : '5.0 LPA';

  // ── Header bar ──────────────────────────────────────────────────────────────
  doc.setFillColor(color.r, color.g, color.b);
  doc.rect(0, 0, 210, 32, 'F');

  // Company name in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(student.companyName.toUpperCase(), 15, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Human Resources Department', 15, 23);
  doc.text(`Ref: ${refNo}`, 15, 28);

  // Date top-right
  doc.setFontSize(9);
  doc.text(dateStr, 195, 23, { align: 'right' });

  // ── Title ───────────────────────────────────────────────────────────────────
  doc.setTextColor(color.r, color.g, color.b);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFER OF EMPLOYMENT', 105, 46, { align: 'center' });

  // Underline
  doc.setDrawColor(color.r, color.g, color.b);
  doc.setLineWidth(0.8);
  doc.line(55, 48, 155, 48);

  // ── Salutation ──────────────────────────────────────────────────────────────
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Dear ${student.studentName},`, 15, 60);

  // ── Opening paragraph ───────────────────────────────────────────────────────
  const opening = `We are delighted to extend this offer of employment to you at ${student.companyName}. After a thorough evaluation of your academic background, technical skills, and overall profile, we are pleased to confirm your selection for the position mentioned below.`;
  const openingLines = doc.splitTextToSize(opening, 180);
  doc.text(openingLines, 15, 70);

  // ── Details box ─────────────────────────────────────────────────────────────
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
    ['Candidate Name',  student.studentName],
    ['Roll Number',     student.rollNumber],
    ['Branch',         student.branch],
    ['Designation',    student.jobRole],
    ['CTC Offered',    pkg],
    ['Joining Date',   joiningDate],
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

  // ── Body paragraphs ─────────────────────────────────────────────────────────
  let y = boxY + 66;

  const para1 = `This offer is contingent upon successful completion of your degree and submission of all required original documents including mark sheets, degree certificate, and other credentials as requested by our HR team.`;
  const p1Lines = doc.splitTextToSize(para1, 180);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(p1Lines, 15, y);
  y += p1Lines.length * 5.5 + 5;

  const para2 = `As a member of the ${student.companyName} family, you will be entitled to a comprehensive benefits package including health insurance, performance bonuses, learning & development programs, and other perquisites as per company policy.`;
  const p2Lines = doc.splitTextToSize(para2, 180);
  doc.text(p2Lines, 15, y);
  y += p2Lines.length * 5.5 + 5;

  const para3 = `Please confirm your acceptance of this offer by signing and returning a copy of this letter within 7 days of receipt. We look forward to welcoming you to our team and are confident that your contributions will be invaluable to our continued success.`;
  const p3Lines = doc.splitTextToSize(para3, 180);
  doc.text(p3Lines, 15, y);
  y += p3Lines.length * 5.5 + 10;

  doc.text('Yours sincerely,', 15, y);
  y += 12;

  // ── Signature area ──────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(color.r, color.g, color.b);
  doc.text('HR Manager', 15, y);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(student.companyName, 15, y + 5);
  doc.text('Human Resources Department', 15, y + 10);

  // Candidate acceptance block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(color.r, color.g, color.b);
  doc.text('Candidate Acceptance', 130, y);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Signature: ___________________', 130, y + 8);
  doc.text(`Name: ${student.studentName}`, 130, y + 14);
  doc.text('Date: ___________________', 130, y + 20);

  // ── Footer bar ──────────────────────────────────────────────────────────────
  doc.setFillColor(color.r, color.g, color.b);
  doc.rect(0, 282, 210, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${student.companyName} | Confidential Offer Letter | ${dateStr}`, 105, 291, { align: 'center' });

  doc.save(`Offer_Letter_${student.studentName.replace(/\s+/g, '_')}_${student.companyName.replace(/\s+/g, '_')}.pdf`);
}

export default function HROfferLetters() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [students, setStudents] = useState<SelectedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewStudent, setPreviewStudent] = useState<SelectedStudent | null>(null);

  useEffect(() => {
    fetchSelectedStudents();
  }, []);

  const fetchSelectedStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api');
      const res = await fetch(`${apiBase}/offer-letters/hr/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('HR list error:', err);
        setStudents([]);
        return;
      }
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (student: SelectedStudent) => {
    // 1. Generate and download PDF locally
    generateOfferLetterPDF(student);

    // 2. Save to DB so student can see and download
    try {
      const token = localStorage.getItem('token');
      const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api');
      await fetch(`${apiBase}/offer-letters/hr/send/${student.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh list to show "Sent" status
      fetchSelectedStudents();
    } catch (err) {
      console.error('Failed to mark offer letter as sent:', err);
    }

    toast({
      title: '✅ Offer Letter Sent!',
      description: `PDF downloaded & sent to ${student.studentName}'s portal`,
    });
  };

  const color = user?.companyName ? getCompanyColor(user.companyName) : companyColors.default;
  const brandHex = color.primary;

  return (
    <DashboardLayout userRole="hr">
      <div className="space-y-6">
        {/* Header */}
        <div
          className="rounded-xl p-6 text-white"
          style={{ background: `linear-gradient(135deg, ${brandHex}, ${brandHex}99)` }}
        >
          <h1 className="text-3xl font-bold">Offer Letter Generation</h1>
          <p className="mt-1 opacity-90">
            Auto-generate professional offer letters for selected candidates — {user?.companyName}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: `${brandHex}20` }}>
                <FileText className="h-5 w-5" style={{ color: brandHex }} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Selected</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ready to Generate</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Company</p>
                <p className="text-lg font-bold truncate">{user?.companyName || '—'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <Card className="border-dashed" style={{ borderColor: brandHex }}>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold" style={{ color: brandHex }}>How it works: </span>
              Click <b>"Generate & Download"</b> — a professional PDF offer letter with {user?.companyName || 'your company'} branding, student details, job role, package, and joining date is instantly created and downloaded.
            </p>
          </CardContent>
        </Card>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Selected Candidates</CardTitle>
            <CardDescription>Generate offer letters for your selected students</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">Loading candidates...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No selected students yet.</p>
                <p className="text-sm mt-1">Go to Applications → select students first.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-xl hover:shadow-md transition-shadow"
                    style={{ borderLeft: `4px solid ${brandHex}` }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{student.studentName}</h3>
                        <Badge className="text-white text-xs" style={{ background: brandHex }}>
                          Selected
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground grid grid-cols-2 sm:grid-cols-4 gap-1">
                        <span><b>Roll:</b> {student.rollNumber}</span>
                        <span><b>Branch:</b> {student.branch}</span>
                        <span><b>Role:</b> {student.jobRole}</span>
                        <span><b>Email:</b> {student.studentEmail}</span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: brandHex }}>
                        📄 Offer letter will include: {student.companyName} branding · {student.jobRole} · {student.packageOffered >= 100000 ? `${(student.packageOffered / 100000).toFixed(1)} LPA` : student.packageOffered ? `₹${student.packageOffered.toLocaleString()}` : '5.0 LPA'} package
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewStudent(student)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="text-white"
                        style={{ background: brandHex }}
                        onClick={() => handleGenerate(student)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Generate & Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewStudent} onOpenChange={() => setPreviewStudent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Offer Letter Preview</DialogTitle>
          </DialogHeader>
          {previewStudent && (
            <div className="space-y-3 text-sm">
              {/* Mini letter preview */}
              <div
                className="rounded-lg p-4 text-white text-center font-bold text-lg"
                style={{ background: getCompanyColor(previewStudent.companyName).primary }}
              >
                {previewStudent.companyName.toUpperCase()}
                <div className="text-xs font-normal mt-1 opacity-80">Human Resources Department</div>
              </div>
              <div className="border rounded-lg p-4 space-y-2 text-sm">
                <p className="font-semibold text-center" style={{ color: getCompanyColor(previewStudent.companyName).primary }}>
                  OFFER OF EMPLOYMENT
                </p>
                <p>Dear <b>{previewStudent.studentName}</b>,</p>
                <p className="text-muted-foreground text-xs">
                  We are delighted to extend this offer of employment to you at {previewStudent.companyName}...
                </p>
                <div className="bg-gray-50 rounded p-3 grid grid-cols-2 gap-1 text-xs">
                  <span><b>Name:</b> {previewStudent.studentName}</span>
                  <span><b>Roll No:</b> {previewStudent.rollNumber}</span>
                  <span><b>Branch:</b> {previewStudent.branch}</span>
                  <span><b>Role:</b> {previewStudent.jobRole}</span>
                  <span><b>CTC:</b> {previewStudent.packageOffered >= 100000 ? `${(previewStudent.packageOffered / 100000).toFixed(1)} LPA` : previewStudent.packageOffered ? `₹${previewStudent.packageOffered.toLocaleString()}` : '5.0 LPA'}</span>
                  <span><b>Joining:</b> 30 days from today</span>
                </div>
                <p className="text-xs text-muted-foreground">...full professional letter with company branding will be in the PDF.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewStudent(null)}>Close</Button>
            <Button
              className="text-white"
              style={{ background: previewStudent ? getCompanyColor(previewStudent.companyName).primary : '#000' }}
              onClick={() => { if (previewStudent) { handleGenerate(previewStudent); setPreviewStudent(null); } }}
            >
              <Download className="h-4 w-4 mr-1" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
