import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Mail, Phone, Download, ExternalLink, Loader2, Filter, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

export default function QualifiedStudents() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'percentage'>('score');

  useEffect(() => {
    fetchQualifiedStudents();
  }, [assessmentId]);

  useEffect(() => {
    if (students.length > 0) {
      sortStudents(sortBy);
    }
  }, [sortBy]);

  const fetchQualifiedStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/assessments/hr/qualified-students/${assessmentId}`);
      setData(response);
      setStudents(response.students || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch qualified students',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const sortStudents = (criteria: 'score' | 'percentage') => {
    const sorted = [...students].sort((a, b) => {
      if (criteria === 'score') {
        return b.assessmentScore - a.assessmentScore;
      }
      return b.assessmentPercentage - a.assessmentPercentage;
    });
    setStudents(sorted);
  };

  const handleShortlist = async (studentId: string) => {
    try {
      toast({
        title: 'Feature Coming Soon',
        description: 'Shortlist functionality will be added soon',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const downloadResume = (resumeUrl: string, studentName: string) => {
    if (!resumeUrl) {
      toast({
        title: 'No Resume',
        description: 'This student has not uploaded a resume',
        variant: 'destructive'
      });
      return;
    }
    window.open(resumeUrl, '_blank');
  };

  if (loading) {
    return (
      <DashboardLayout userRole="hr">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data || students.length === 0) {
    return (
      <DashboardLayout userRole="hr">
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => navigate('/hr/assessments')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessments
          </Button>
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No qualified students yet</p>
                <p className="text-sm text-muted-foreground mt-2">Students who pass the assessment will appear here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="hr">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button variant="ghost" onClick={() => navigate('/hr/assessments')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessments
          </Button>
          <h1 className="text-3xl font-bold">{data.assessmentTitle}</h1>
          <p className="text-muted-foreground">Students who scored {data.passingMarks} or above (out of {data.totalMarks})</p>
        </div>

        {/* Summary Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{data.qualifiedCount}</p>
                  <p className="text-sm text-muted-foreground">Qualified Students</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Marks</p>
                <p className="text-xl font-bold">{data.totalMarks}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Passing Marks</p>
                <p className="text-xl font-bold">{data.passingMarks}</p>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">Sort by Score</SelectItem>
                    <SelectItem value="percentage">Sort by Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {students.map((student, index) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={student.profilePhotoUrl} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {student.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                        #{index + 1}
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{student.name}</CardTitle>
                      <CardDescription>{student.rollNumber} • {student.branch}</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-green-500">
                    <Award className="h-3 w-3 mr-1" />
                    Qualified
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Assessment Score */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Assessment Score</p>
                      <p className="text-2xl font-bold text-green-600">
                        {student.assessmentScore}/{student.assessmentMarks}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Percentage</p>
                      <p className="text-2xl font-bold text-green-600">
                        {student.assessmentPercentage}%
                      </p>
                    </div>
                  </div>
                  {student.timeTaken && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Time taken: {Math.floor(student.timeTaken / 60)} min {student.timeTaken % 60} sec
                    </p>
                  )}
                </div>

                {/* Student Details */}
                <div className="space-y-2">
                  {student.cgpa && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">CGPA</span>
                      <span className="font-medium">{student.cgpa}</span>
                    </div>
                  )}
                  
                  {student.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${student.email}`} className="text-blue-600 hover:underline">
                        {student.email}
                      </a>
                    </div>
                  )}

                  {student.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{student.phone}</span>
                    </div>
                  )}

                  {student.skills && student.skills.length > 0 && (
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {student.skills.slice(0, 6).map((skill: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {student.skills.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{student.skills.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    size="sm"
                    onClick={() => handleShortlist(student.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Shortlist for Interview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadResume(student.resumeUrl, student.name)}
                    disabled={!student.resumeUrl}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
