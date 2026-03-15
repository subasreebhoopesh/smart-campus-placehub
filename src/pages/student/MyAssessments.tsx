import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Clock, CheckCircle, XCircle, Trophy, Loader2, Play } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { assessmentAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function MyAssessments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const data = await assessmentAPI.getAvailable();
      setAssessments(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const pending = assessments.filter(a => !a.alreadyAttempted);
  const completed = assessments.filter(a => a.alreadyAttempted);

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            My Assessments
          </h1>
          <p className="text-muted-foreground">Take company assessments to improve your application</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Pending */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Pending Tests
                {pending.length > 0 && (
                  <Badge className="bg-orange-500">{pending.length}</Badge>
                )}
              </h2>
              {pending.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No pending assessments right now.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {pending.map(a => (
                    <Card key={a.id} className="border-orange-200 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{a.title}</CardTitle>
                            <CardDescription className="mt-1">{a.companyName} · {a.jobRole}</CardDescription>
                          </div>
                          <Badge variant="outline" className="border-orange-400 text-orange-600">Pending</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                        <div className="flex gap-3 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" /> {a.duration} min
                          </span>
                          <span className="text-muted-foreground">{a.questionCount} questions</span>
                          <span className="text-muted-foreground">{a.totalMarks} marks</span>
                        </div>
                        {a.driveDate && (
                          <p className="text-xs text-muted-foreground">
                            Drive date: {format(new Date(a.driveDate), 'MMM d, yyyy')}
                          </p>
                        )}
                        <Button
                          className="w-full"
                          onClick={() => navigate(`/student/assessment/${a.driveId}`)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Test
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Completed */}
            {completed.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Completed Tests
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {completed.map(a => (
                    <Card key={a.id} className={a.result?.passed ? 'border-green-200' : 'border-red-200'}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{a.title}</CardTitle>
                            <CardDescription className="mt-1">{a.companyName} · {a.jobRole}</CardDescription>
                          </div>
                          {a.result?.passed
                            ? <Badge className="bg-green-500">Passed</Badge>
                            : <Badge variant="destructive">Failed</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-primary">{a.result?.percentage}%</p>
                            <p className="text-xs text-muted-foreground">Score</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold">{a.result?.totalScore}</p>
                            <p className="text-xs text-muted-foreground">Marks</p>
                          </div>
                        </div>
                        {a.result?.submittedAt && (
                          <p className="text-xs text-muted-foreground">
                            Submitted: {format(new Date(a.result.submittedAt), 'MMM d, yyyy h:mm a')}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
