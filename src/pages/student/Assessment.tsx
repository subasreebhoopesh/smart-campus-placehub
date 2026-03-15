import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Code, FileText, ChevronLeft, ChevronRight, Send, Loader2, Trophy } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { assessmentAPI } from '@/services/api';

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'javascript', label: 'JavaScript' },
];

export default function Assessment() {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [language, setLanguage] = useState<Record<string, string>>({});
  const [code, setCode] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef<number>(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    fetchAssessment();
    return () => clearInterval(timerRef.current);
  }, [driveId]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const data = await assessmentAPI.getForDrive(driveId!);
      if (!data) {
        toast({ title: 'No Assessment', description: 'No assessment found for this drive', variant: 'destructive' });
        navigate(-1);
        return;
      }
      setAssessment(data);
      setTimeLeft(data.duration * 60);

      if (data.alreadyAttempted) {
        setSubmitted(true);
        setResult(data.result);
      }

      // Init code with starter code
      const initCode: Record<string, string> = {};
      const initLang: Record<string, string> = {};
      data.questions.forEach((q: any) => {
        if (q.type === 'coding') {
          initLang[q._id] = 'python';
          initCode[q._id] = q.starterCode?.python || '';
        }
      });
      setCode(initCode);
      setLanguage(initLang);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const startTest = () => {
    setStarted(true);
    startTime.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleMcqAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleLanguageChange = (questionId: string, lang: string) => {
    setLanguage(prev => ({ ...prev, [questionId]: lang }));
    const q = assessment.questions.find((q: any) => q._id === questionId);
    if (q?.starterCode?.[lang]) {
      setCode(prev => ({ ...prev, [questionId]: q.starterCode[lang] }));
    }
  };

  const handleCodeChange = (questionId: string, value: string) => {
    setCode(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    clearInterval(timerRef.current);

    try {
      setSubmitting(true);
      const timeTaken = Math.round((Date.now() - startTime.current) / 1000);

      const submissionAnswers = assessment.questions.map((q: any) => {
        if (q.type === 'mcq') {
          return {
            questionId: q._id,
            type: 'mcq',
            selectedAnswer: answers[q._id] || ''
          };
        } else {
          return {
            questionId: q._id,
            type: 'coding',
            code: code[q._id] || '',
            language: language[q._id] || 'python',
            testOutputs: [] // client-side execution not available; server grades
          };
        }
      });

      const res = await assessmentAPI.submit(assessment.id, submissionAnswers, timeTaken);
      setResult(res);
      setSubmitted(true);
      toast({ title: res.passed ? '🎉 Passed!' : 'Submitted', description: res.message });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const answeredCount = assessment?.questions?.filter((q: any) =>
    q.type === 'mcq' ? answers[q._id] : (code[q._id] || '').trim().length > 50
  ).length || 0;

  if (loading) return (
    <DashboardLayout userRole="student">
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  );

  // Already submitted — show result
  if (submitted && result) return (
    <DashboardLayout userRole="student">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className={result.passed ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50'}>
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            {result.passed
              ? <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
              : <XCircle className="h-16 w-16 text-red-400 mx-auto" />}
            <h2 className="text-2xl font-bold">{result.passed ? 'Congratulations! You Passed!' : 'Assessment Completed'}</h2>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-3xl font-bold text-primary">{result.totalScore}</p>
                <p className="text-sm text-muted-foreground">Score</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-3xl font-bold">{result.totalMarks}</p>
                <p className="text-sm text-muted-foreground">Total Marks</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className={`text-3xl font-bold ${result.percentage >= 70 ? 'text-green-600' : result.percentage >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                  {result.percentage}%
                </p>
                <p className="text-sm text-muted-foreground">Percentage</p>
              </div>
            </div>
            <p className="text-muted-foreground">{result.message}</p>
            <Button onClick={() => navigate('/student/opportunities')}>Back to Opportunities</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );

  // Pre-test info screen
  if (!started) return (
    <DashboardLayout userRole="student">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              {assessment?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">{assessment?.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{assessment?.duration} min</p>
                <p className="text-sm text-muted-foreground">Duration</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">{assessment?.totalMarks}</p>
                <p className="text-sm text-muted-foreground">Total Marks</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{assessment?.passingMarks}</p>
                <p className="text-sm text-muted-foreground">Passing Marks</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-600">{assessment?.questions?.length}</p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Question Breakdown:</p>
              <div className="flex gap-2">
                <Badge variant="outline">{assessment?.questions?.filter((q: any) => q.type === 'mcq').length} MCQ (10 pts each)</Badge>
                <Badge variant="outline">{assessment?.questions?.filter((q: any) => q.type === 'coding').length} Coding (20 pts each)</Badge>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm space-y-1">
              <p className="font-medium text-yellow-800">Instructions:</p>
              <p>• Once started, the timer cannot be paused</p>
              <p>• For coding questions, select your preferred language</p>
              <p>• You can only attempt this test once</p>
              <p>• Submit before time runs out</p>
            </div>
            <Button className="w-full" size="lg" onClick={startTest}>
              Start Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );

  const questions = assessment?.questions || [];
  const currentQuestion = questions[currentQ];

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-4">
        {/* Header bar */}
        <div className="flex items-center justify-between bg-card border rounded-lg px-4 py-3">
          <div>
            <p className="font-semibold">{assessment?.title}</p>
            <p className="text-sm text-muted-foreground">{answeredCount}/{questions.length} answered</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 font-mono text-lg font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-primary'}`}>
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft)}
            </div>
            <Button variant="destructive" size="sm" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              Submit
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {/* Question navigator */}
          <div className="col-span-1">
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm font-medium mb-3">Questions</p>
                <div className="grid grid-cols-4 gap-1">
                  {questions.map((q: any, i: number) => {
                    const answered = q.type === 'mcq' ? !!answers[q._id] : (code[q._id] || '').trim().length > 50;
                    return (
                      <button
                        key={q._id}
                        onClick={() => setCurrentQ(i)}
                        className={`h-8 w-8 rounded text-xs font-medium transition-colors ${
                          i === currentQ ? 'bg-primary text-white' :
                          answered ? 'bg-green-100 text-green-700 border border-green-300' :
                          'bg-muted text-muted-foreground'
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-green-100 border border-green-300" /> Answered</div>
                  <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-muted" /> Not answered</div>
                  <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-primary" /> Current</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question area */}
          <div className="col-span-3">
            {currentQuestion && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={currentQuestion.type === 'coding' ? 'border-purple-400 text-purple-600' : 'border-blue-400 text-blue-600'}>
                        {currentQuestion.type === 'coding' ? <Code className="h-3 w-3 mr-1" /> : <FileText className="h-3 w-3 mr-1" />}
                        {currentQuestion.type === 'coding' ? 'Coding' : 'MCQ'}
                      </Badge>
                      <Badge variant="outline">{currentQuestion.topic}</Badge>
                      <Badge className="bg-primary/10 text-primary">{currentQuestion.points} pts</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Q{currentQ + 1} of {questions.length}</p>
                  </div>
                  <CardTitle className="text-lg mt-2">{currentQuestion.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentQuestion.type === 'mcq' ? (
                    <RadioGroup
                      value={answers[currentQuestion._id] || ''}
                      onValueChange={(val) => handleMcqAnswer(currentQuestion._id, val)}
                    >
                      {currentQuestion.options?.map((opt: string, i: number) => (
                        <div key={i} className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${answers[currentQuestion._id] === opt ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}>
                          <RadioGroupItem value={opt} id={`opt-${i}`} />
                          <Label htmlFor={`opt-${i}`} className="cursor-pointer flex-1">{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="space-y-3">
                      {currentQuestion.description && (
                        <div className="bg-muted p-4 rounded-lg">
                          <pre className="text-sm whitespace-pre-wrap font-mono">{currentQuestion.description}</pre>
                        </div>
                      )}

                      {/* Test cases */}
                      {currentQuestion.testCases?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Sample Test Cases:</p>
                          {currentQuestion.testCases.map((tc: any, i: number) => (
                            <div key={i} className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-gray-50 p-2 rounded border">
                                <p className="text-muted-foreground mb-1">Input:</p>
                                <pre className="font-mono">{tc.input}</pre>
                              </div>
                              <div className="bg-green-50 p-2 rounded border border-green-200">
                                <p className="text-muted-foreground mb-1">Expected Output:</p>
                                <pre className="font-mono text-green-700">{tc.expectedOutput}</pre>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Language selector */}
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-medium">Language:</p>
                        <Select
                          value={language[currentQuestion._id] || 'python'}
                          onValueChange={(val) => handleLanguageChange(currentQuestion._id, val)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGES.map(l => (
                              <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Code editor */}
                      <div className="relative">
                        <div className="flex items-center justify-between bg-gray-800 text-gray-300 px-4 py-2 rounded-t-lg text-xs">
                          <span>{LANGUAGES.find(l => l.value === (language[currentQuestion._id] || 'python'))?.label}</span>
                          <span>Write your solution below</span>
                        </div>
                        <textarea
                          value={code[currentQuestion._id] || ''}
                          onChange={(e) => handleCodeChange(currentQuestion._id, e.target.value)}
                          className="w-full h-64 bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-b-lg border-0 outline-none resize-none"
                          spellCheck={false}
                          placeholder="// Write your code here..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}>
                      <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    {currentQ < questions.length - 1 ? (
                      <Button onClick={() => setCurrentQ(currentQ + 1)}>
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    ) : (
                      <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
                        Submit Test
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
