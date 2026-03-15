import { useState, useEffect } from 'react';
import { Zap, Users, CheckCircle, BarChart2, Loader2, Eye, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { assessmentAPI } from '@/services/api';
import api from '@/services/api';

export default function Assessments() {
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [resultsDialog, setResultsDialog] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assessData, drivesData] = await Promise.all([
        assessmentAPI.getAll(),
        api.drives.getAll()
      ]);
      setAssessments(Array.isArray(assessData) ? assessData : []);
      setDrives(Array.isArray(drivesData) ? drivesData : []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (driveId: string, driveName: string) => {
    try {
      setGenerating(driveId);
      const result = await assessmentAPI.generate(driveId);
      toast({
        title: 'Assessment Generated!',
        description: `${result.mcqCount} MCQ + ${result.codingCount} Coding questions. Total: ${result.totalMarks} marks`,
      });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setGenerating(null);
    }
  };

  const handleViewResults = async (assessment: any) => {
    setResultsDialog(assessment);
    setLoadingResults(true);
    try {
      const data = await assessmentAPI.getResults(assessment.id);
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  // Drives that don't have an assessment yet
  const drivesWithoutAssessment = drives.filter(d =>
    !assessments.find(a => a.driveId?.toString() === d.id?.toString())
  );

  const stats = {
    total: assessments.length,
    totalAttempts: assessments.reduce((s, a) => s + (a.attempts || 0), 0),
    totalPassed: assessments.reduce((s, a) => s + (a.passed || 0), 0),
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Assessment Management</h1>
          <p className="text-muted-foreground">Generate and manage MCQ + Coding tests for placement drives</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="pt-6">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Assessments</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <p className="text-2xl font-bold text-blue-600">{stats.totalAttempts}</p>
            <p className="text-sm text-muted-foreground">Total Attempts</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <p className="text-2xl font-bold text-green-600">{stats.totalPassed}</p>
            <p className="text-sm text-muted-foreground">Students Passed</p>
          </CardContent></Card>
        </div>

        {/* Generate for drives */}
        {drivesWithoutAssessment.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Generate Assessments</CardTitle>
              <CardDescription>These drives don't have an assessment yet. Questions are auto-generated based on company required skills.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {drivesWithoutAssessment.map(drive => (
                  <div key={drive.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{drive.company_name} — {drive.job_role}</p>
                      <p className="text-xs text-muted-foreground">{drive.status} · {format(new Date(drive.drive_date), 'MMM d, yyyy')}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleGenerate(drive.id, `${drive.company_name} - ${drive.job_role}`)}
                      disabled={generating === drive.id}
                    >
                      {generating === drive.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Zap className="h-4 w-4 mr-1" />}
                      Generate
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing assessments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Assessments</CardTitle>
                <CardDescription>Click "View Results" to see student scores</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
            ) : assessments.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No assessments yet. Generate one above.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Pass Rate</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.map(a => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <p className="font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.duration} min · {a.driveStatus}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">{a.mcqCount} MCQ</Badge>
                          <Badge variant="outline" className="text-xs">{a.codingCount} Coding</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{a.totalMarks} total</p>
                        <p className="text-xs text-muted-foreground">Pass: {a.passingMarks}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{a.attempts}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {a.attempts > 0 ? (
                          <Badge className={a.passed / a.attempts >= 0.5 ? 'bg-green-500' : 'bg-orange-500'}>
                            {Math.round((a.passed / a.attempts) * 100)}%
                          </Badge>
                        ) : <span className="text-muted-foreground text-sm">-</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewResults(a)}>
                            <Eye className="h-4 w-4 mr-1" /> Results
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleGenerate(a.driveId, a.title)}
                            disabled={generating === a.driveId}>
                            {generating === a.driveId ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                          </Button>
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

      {/* Results Dialog */}
      <Dialog open={!!resultsDialog} onOpenChange={() => setResultsDialog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{resultsDialog?.title} — Results</DialogTitle>
            <DialogDescription>Student scores sorted by highest first</DialogDescription>
          </DialogHeader>
          {loadingResults ? (
            <div className="py-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
          ) : results.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No attempts yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>%</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r, i) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-bold text-primary">#{i + 1}</TableCell>
                    <TableCell>
                      <p className="font-medium">{r.studentName}</p>
                      <p className="text-xs text-muted-foreground">{r.studentEmail}</p>
                    </TableCell>
                    <TableCell>{r.rollNumber}</TableCell>
                    <TableCell className="font-bold">{r.totalScore}/{r.totalMarks}</TableCell>
                    <TableCell>
                      <span className={r.percentage >= 70 ? 'text-green-600 font-bold' : r.percentage >= 50 ? 'text-orange-500 font-bold' : 'text-red-500 font-bold'}>
                        {r.percentage}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {r.passed
                        ? <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Passed</Badge>
                        : <Badge variant="destructive">Failed</Badge>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(r.submittedAt), 'MMM d, HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
