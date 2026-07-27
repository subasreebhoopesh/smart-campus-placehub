import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Clock, CheckCircle, XCircle, Trophy, Loader2, Play, Lock, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { assessmentAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';

// Live countdown hook
function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState('');
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!targetDate) return;
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('0s');
        setSeconds(0);
        return;
      }
      setSeconds(Math.floor(diff / 1000));
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 0) setTimeLeft(`${h}h ${m}m`);
      else if (m > 0) setTimeLeft(`${m}m ${s}s`);
      else setTimeLeft(`${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return { timeLeft, seconds };
}

function AssessmentWindowStatus({ scheduledStart, scheduledEnd }: { scheduledStart?: string; scheduledEnd?: string }) {
  const now = Date.now();

  if (!scheduledStart && !scheduledEnd) return null;

  const start = scheduledStart ? new Date(scheduledStart).getTime() : null;
  const end = scheduledEnd ? new Date(scheduledEnd).getTime() : null;

  const isOpen = start && end ? now >= start && now <= end : true;
  const isExpired = end ? now > end : false;
  const isUpcoming = start ? now < start : false;

  const { timeLeft: countdownToStart } = useCountdown(isUpcoming ? scheduledStart! : null);
  const { timeLeft: countdownToEnd } = useCountdown(isOpen && scheduledEnd ? scheduledEnd : null);

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 text-xs bg-red-50 border border-red-200 rounded px-3 py-1.5 text-red-700">
        <XCircle className="h-3.5 w-3.5" />
        Test window closed — {end ? format(new Date(end), 'MMM d, h:mm a') : ''}
      </div>
    );
  }

  if (isUpcoming) {
    return (
      <div className="flex items-center gap-2 text-xs bg-orange-50 border border-orange-200 rounded px-3 py-1.5 text-orange-700">
        <Clock className="h-3.5 w-3.5 animate-pulse" />
        Opens in <span className="font-bold ml-1">{countdownToStart}</span>
        <span className="text-orange-500 ml-1">— {start ? format(new Date(start), 'MMM d, h:mm a') : ''}</span>
      </div>
    );
  }

  if (isOpen) {
    return (
      <div className="flex items-center gap-2 text-xs bg-green-50 border border-green-200 rounded px-3 py-1.5 text-green-700">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        Test window OPEN — closes in <span className="font-bold ml-1">{countdownToEnd}</span>
      </div>
    );
  }

  return null;
}

export default function MyAssessments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  // Re-render every second to keep window statuses live
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

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

  const isWindowOpen = (a: any) => {
    if (!a.scheduledStart && !a.scheduledEnd) return true; // no schedule = always open
    const now = Date.now();
    const start = a.scheduledStart ? new Date(a.scheduledStart).getTime() : null;
    const end = a.scheduledEnd ? new Date(a.scheduledEnd).getTime() : null;
    return (!start || now >= start) && (!end || now <= end);
  };

  const isWindowExpired = (a: any) => {
    if (!a.scheduledEnd) return false;
    return Date.now() > new Date(a.scheduledEnd).getTime();
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
                {pending.length > 0 && <Badge className="bg-orange-500">{pending.length}</Badge>}
              </h2>
              {pending.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No pending assessments right now.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {pending.map(a => {
                    const windowOpen = isWindowOpen(a);
                    const expired = isWindowExpired(a);
                    return (
                      <Card key={a.id} className={`transition-shadow ${expired ? 'border-gray-200 opacity-70' : 'border-orange-200 hover:shadow-md'}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{a.title}</CardTitle>
                              <CardDescription className="mt-1">{a.companyName} · {a.jobRole}</CardDescription>
                            </div>
                            {expired
                              ? <Badge variant="destructive">Expired</Badge>
                              : windowOpen
                              ? <Badge className="bg-green-500">Live</Badge>
                              : <Badge variant="outline" className="border-orange-400 text-orange-600">Scheduled</Badge>
                            }
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>

                          {/* Window status with countdown */}
                          <AssessmentWindowStatus
                            scheduledStart={a.scheduledStart}
                            scheduledEnd={a.scheduledEnd}
                          />

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

                          {expired ? (
                            <div className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-500 border border-dashed rounded-lg">
                              <Lock className="h-4 w-4" /> Test window has closed
                            </div>
                          ) : !windowOpen ? (
                            <div className="w-full flex items-center justify-center gap-2 py-2 text-sm text-orange-600 border border-orange-200 rounded-lg bg-orange-50">
                              <AlertTriangle className="h-4 w-4" /> Test not yet open — wait for the scheduled time
                            </div>
                          ) : (
                            <Button
                              className="w-full bg-green-600 hover:bg-green-700"
                              onClick={() => navigate(`/student/assessment/${a.driveId}`)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Test Now
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
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
