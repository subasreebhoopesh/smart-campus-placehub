import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Download, 
  Eye, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Award,
  Code,
  Plus,
  Trash2,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    portfolio: string;
  };
  objective: string;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    cgpa: string;
  }>;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  projects: Array<{
    name: string;
    technologies: string;
    description: string;
  }>;
  skills: string[];
  achievements: string[];
}

export default function ResumeBuilder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [template, setTemplate] = useState<'modern' | 'classic' | 'minimal'>('modern');
  const resumeRef = useRef<HTMLDivElement>(null);

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      linkedin: '',
      github: '',
      portfolio: ''
    },
    objective: '',
    education: [],
    experience: [],
    projects: [],
    skills: [],
    achievements: []
  });

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const response = await api.students.getProfile();
      
      // Auto-fill from student profile
      setResumeData({
        personalInfo: {
          name: response.name || '',
          email: response.email || '',
          phone: response.phone || '',
          linkedin: response.linkedin || '',
          github: response.github || '',
          portfolio: response.portfolio || ''
        },
        objective: response.objective || 'Seeking a challenging position to utilize my skills and contribute to organizational growth.',
        education: [{
          degree: `${response.degree || 'B.Tech'} in ${response.branch || 'Computer Science'}`,
          institution: response.college || 'College Name',
          year: response.graduationYear || '2024',
          cgpa: response.cgpa?.toString() || '0.0'
        }],
        experience: response.experience || [],
        projects: response.projects || [],
        skills: response.skills || [],
        achievements: response.achievements || []
      });
    } catch (error) {
      console.error('Failed to fetch student data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, { degree: '', institution: '', year: '', cgpa: '' }]
    });
  };

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, { title: '', company: '', duration: '', description: '' }]
    });
  };

  const addProject = () => {
    setResumeData({
      ...resumeData,
      projects: [...resumeData.projects, { name: '', technologies: '', description: '' }]
    });
  };

  const addSkill = () => {
    const skill = prompt('Enter skill name:');
    if (skill) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, skill]
      });
    }
  };

  const addAchievement = () => {
    const achievement = prompt('Enter achievement:');
    if (achievement) {
      setResumeData({
        ...resumeData,
        achievements: [...resumeData.achievements, achievement]
      });
    }
  };

  const downloadPDF = async () => {
    try {
      // Using html2pdf library
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = resumeRef.current;
      const opt = {
        margin: 0.5,
        filename: `${resumeData.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save();
      
      toast({
        title: 'Success',
        description: 'Resume downloaded successfully!',
      });
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to download resume. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-300 to-pink-300 flex items-center justify-center">
            <FileText className="h-6 w-6 text-gray-800" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Resume Builder
            </h1>
            <p className="text-muted-foreground">Create your professional resume in minutes</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Editor Section */}
        <div className="space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Choose Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {(['modern', 'classic', 'minimal'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTemplate(t)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      template === t
                        ? 'border-purple-400 bg-purple-50 dark:bg-purple-950/30'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-sm font-medium capitalize">{t}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={resumeData.personalInfo.name}
                  onChange={(e) => setResumeData({
                    ...resumeData,
                    personalInfo: { ...resumeData.personalInfo, name: e.target.value }
                  })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, email: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, phone: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>LinkedIn</Label>
                  <Input
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) => setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, linkedin: e.target.value }
                    })}
                    placeholder="linkedin.com/in/username"
                  />
                </div>
                <div>
                  <Label>GitHub</Label>
                  <Input
                    value={resumeData.personalInfo.github}
                    onChange={(e) => setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, github: e.target.value }
                    })}
                    placeholder="github.com/username"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Objective */}
          <Card>
            <CardHeader>
              <CardTitle>Career Objective</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={resumeData.objective}
                onChange={(e) => setResumeData({ ...resumeData, objective: e.target.value })}
                rows={3}
                placeholder="Brief statement about your career goals..."
              />
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Skills
                </span>
                <Button size="sm" onClick={addSkill}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {skill}
                    <button
                      onClick={() => {
                        const newSkills = resumeData.skills.filter((_, i) => i !== index);
                        setResumeData({ ...resumeData, skills: newSkills });
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
            <Button
              onClick={downloadPDF}
              className="flex-1 bg-gradient-to-r from-purple-300 to-pink-300 hover:from-purple-400 hover:to-pink-400 text-gray-800"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="lg:sticky lg:top-6 h-fit">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>This is how your resume will look</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  ref={resumeRef}
                  className="bg-white p-8 rounded-lg shadow-lg text-gray-900"
                  style={{ minHeight: '800px' }}
                >
                  {/* Modern Template */}
                  {template === 'modern' && (
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="text-center border-b-4 border-purple-400 pb-4">
                        <h1 className="text-4xl font-bold text-gray-900">{resumeData.personalInfo.name}</h1>
                        <div className="flex justify-center gap-4 mt-2 text-sm text-gray-600">
                          <span>{resumeData.personalInfo.email}</span>
                          <span>•</span>
                          <span>{resumeData.personalInfo.phone}</span>
                        </div>
                        {resumeData.personalInfo.linkedin && (
                          <div className="text-sm text-gray-600 mt-1">
                            LinkedIn: {resumeData.personalInfo.linkedin}
                          </div>
                        )}
                      </div>

                      {/* Objective */}
                      {resumeData.objective && (
                        <div>
                          <h2 className="text-xl font-bold text-purple-600 mb-2">OBJECTIVE</h2>
                          <p className="text-sm text-gray-700">{resumeData.objective}</p>
                        </div>
                      )}

                      {/* Education */}
                      {resumeData.education.length > 0 && (
                        <div>
                          <h2 className="text-xl font-bold text-purple-600 mb-2">EDUCATION</h2>
                          {resumeData.education.map((edu, index) => (
                            <div key={index} className="mb-3">
                              <div className="flex justify-between">
                                <span className="font-semibold">{edu.degree}</span>
                                <span className="text-sm">{edu.year}</span>
                              </div>
                              <div className="text-sm text-gray-600">{edu.institution}</div>
                              {edu.cgpa && <div className="text-sm">CGPA: {edu.cgpa}</div>}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Skills */}
                      {resumeData.skills.length > 0 && (
                        <div>
                          <h2 className="text-xl font-bold text-purple-600 mb-2">SKILLS</h2>
                          <div className="flex flex-wrap gap-2">
                            {resumeData.skills.map((skill, index) => (
                              <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Experience */}
                      {resumeData.experience.length > 0 && (
                        <div>
                          <h2 className="text-xl font-bold text-purple-600 mb-2">EXPERIENCE</h2>
                          {resumeData.experience.map((exp, index) => (
                            <div key={index} className="mb-3">
                              <div className="flex justify-between">
                                <span className="font-semibold">{exp.title}</span>
                                <span className="text-sm">{exp.duration}</span>
                              </div>
                              <div className="text-sm text-gray-600">{exp.company}</div>
                              <p className="text-sm mt-1">{exp.description}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Projects */}
                      {resumeData.projects.length > 0 && (
                        <div>
                          <h2 className="text-xl font-bold text-purple-600 mb-2">PROJECTS</h2>
                          {resumeData.projects.map((project, index) => (
                            <div key={index} className="mb-3">
                              <div className="font-semibold">{project.name}</div>
                              <div className="text-sm text-gray-600">Technologies: {project.technologies}</div>
                              <p className="text-sm mt-1">{project.description}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Achievements */}
                      {resumeData.achievements.length > 0 && (
                        <div>
                          <h2 className="text-xl font-bold text-purple-600 mb-2">ACHIEVEMENTS</h2>
                          <ul className="list-disc list-inside space-y-1">
                            {resumeData.achievements.map((achievement, index) => (
                              <li key={index} className="text-sm">{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
