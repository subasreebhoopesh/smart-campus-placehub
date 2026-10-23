import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Users, Award, Calendar, Clock, BarChart2, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

export default function HRAssessments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsDialog, setStatsDialog] = useState<any>(null);
  const [allResults, setAllResults] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/assessments/hr/assessments');
      setAssessments(Array.isArray(response) ? response : []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch assessments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewQualified = (assessmentId: string) => {
    navigate(`/hr/qualified-students/${assessmentId}`);
  };

  const handleViewAllStats = async (assessment: any) => {
    setStatsDialog(assessment);
    setLoadingStats(true);
    try {
      const response = await api.get(`/assessments/hr/all-results/${assessment.id}`);
      setAllResults(response);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch statistics',
        variant: 'destructive'
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const stats = {
    total: assessments.length,
    totalAttempts: assessments.reduce((s, a) => s + (a.totalAttempts || 0), 0),
    totalQualified: assessments.reduce((s, a) => s + (a.passedCount || 0), 0),
  };

  return (
    <DashboardLayout userRole="hr">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Assessments</h1>
          <p className="text-muted-foreground">View assessments and qualified candidates</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Assessments</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <ClipboardCheck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalAttempts}</p>
                  <p className="text-sm text-muted-foreground">Total Attempts</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.totalQualified}</p>
                  <p className="text-sm text-muted-foreground">Qualified Students</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessments List */}
        <Card>
          <CardHeader>
            <CardTitle>All Assessments</CardTitle>
            <CardDescription>Click "View Qualified" to see students who passed the assessment</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No assessments available yet</p>
                <p className="text-sm text-muted-foreground mt-2">Assessments will appear here once Admin creates them for your drives</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment Details</TableHead>
                    <TableHead>Drive Info</TableHead>
                    <TableHead className="text-center">Marks</TableHead>
                    <TableHead className="text-center">Attempts</TableHead>
                    <TableHead className="text-center">Qualified</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{assessment.title}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {assessment.duration} min
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {assessment.questionCount} Questions
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{assessment.jobRole}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            {assessment.driveDate ? format(new Date(assessment.driveDate), 'MMM d, yyyy') : 'Not scheduled'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div>
                          <p className="font-medium">{assessment.totalMarks}</p>
                          <p className="text-xs text-muted-foreground">Pass: {assessment.passingMarks}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{assessment.totalAttempts}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {assessment.totalAttempts > 0 ? (
                          <div>
                            <p className="font-bold text-green-600">{assessment.passedCount}</p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round((assessment.passedCount / assessment.totalAttempts) * 100)}% pass rate
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleViewQualified(assessment.id)}
                            disabled={assessment.passedCount === 0}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Qualified
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewAllStats(assessment)}
                            disabled={assessment.totalAttempts === 0}
                          >
                            <BarChart2 className="h-4 w-4" />
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

      {/* All Results Stats Dialog */}
      <Dialog open={!!statsDialog} onOpenChange={() => setStatsDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{statsDialog?.title} — All Results</DialogTitle>
            <DialogDescription>Complete statistics including all students</DialogDescription>
          </DialogHeader>
          {loadingStats ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : allResults ? (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Total Attempts</p>
                    <p className="text-2xl font-bold">{allResults.totalAttempts}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Passed</p>
                    <p className="text-2xl font-bold text-green-600">{allResults.passedCount}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{allResults.failedCount}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Results Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allResults.results.map((result: any) => (
                    <TableRow key={result.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{result.studentName}</p>
                          <p className="text-xs text-muted-foreground">{result.studentEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{result.rollNumber}</TableCell>
                      <TableCell className="font-medium">
                        {result.totalScore}/{result.totalMarks}
                      </TableCell>
                      <TableCell>
                        <span className={
                          result.percentage >= 70 ? 'text-green-600 font-bold' :
                          result.percentage >= 50 ? 'text-orange-500 font-bold' :
                          'text-red-500 font-bold'
                        }>
                          {result.percentage}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {result.passed ? (
                          <Badge className="bg-green-500">Passed</Badge>
                        ) : (
                          <Badge variant="destructive">Failed</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(result.submittedAt), 'MMM d, HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
