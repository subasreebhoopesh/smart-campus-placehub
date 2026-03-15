import { useState, useEffect } from 'react';
import { BookOpen, FileText, Download, Edit, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { studentAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Interview Questions by Department and Role
const interviewQuestions: Record<string, Record<string, Array<{ q: string; a: string }>>> = {
  'CSE': {
    'Software Engineer': [
      { q: 'What is the difference between process and thread?', a: 'A process is an independent program with its own memory space. A thread is a lightweight unit within a process that shares memory.' },
      { q: 'Explain REST API principles.', a: 'REST uses HTTP methods (GET, POST, PUT, DELETE), is stateless, and resources are identified by URIs.' },
      { q: 'What is polymorphism in OOP?', a: 'Polymorphism allows objects of different classes to be treated as objects of a common parent class.' },
    ],
    'Full Stack Developer': [
      { q: 'What is the difference between SQL and NoSQL?', a: 'SQL databases are relational with fixed schemas. NoSQL databases are non-relational with flexible schemas.' },
      { q: 'Explain middleware in Express.js.', a: 'Middleware functions have access to request and response objects and can modify them or end the cycle.' },
    ],
    'Data Scientist': [
      { q: 'What is overfitting?', a: 'Overfitting occurs when a model learns training data too well, including noise. Prevented by cross-validation and regularization.' },
      { q: 'Explain bias-variance tradeoff.', a: 'Bias is error from wrong assumptions. Variance is error from sensitivity to training data. Goal is to balance both.' },
    ],
  },
  'IT': {
    'Software Developer': [
      { q: 'What is Agile methodology?', a: 'Agile is an iterative development approach with short sprints and continuous feedback.' },
      { q: 'Explain version control with Git.', a: 'Git tracks code changes, enables collaboration, branching, and merging.' },
    ],
    'Web Developer': [
      { q: 'What is responsive web design?', a: 'Designing websites that adapt to different screen sizes using flexible layouts and media queries.' },
      { q: 'Explain the box model in CSS.', a: 'Every element is a box with content, padding, border, and margin.' },
    ],
  },
  'ECE': {
    'VLSI Design Engineer': [
      { q: 'What is clock skew?', a: 'Difference in arrival times of clock signal at different parts of the circuit.' },
      { q: 'Explain setup time and hold time.', a: 'Setup time is minimum time data must be stable before clock edge. Hold time is after clock edge.' },
    ],
    'Embedded Systems': [
      { q: 'What is an interrupt?', a: 'Signal that temporarily halts CPU to handle urgent tasks.' },
      { q: 'Explain I2C protocol.', a: 'Serial communication protocol using two wires (SDA, SCL) for master-slave communication.' },
    ],
  },
  'EEE': {
    'Power Systems Engineer': [
      { q: 'What is power factor?', a: 'Ratio of real power to apparent power. Low power factor means inefficient power usage.' },
      { q: 'Explain transformer working.', a: 'Based on electromagnetic induction. Changing current in primary induces voltage in secondary.' },
    ],
    'Control Systems': [
      { q: 'What is PID controller?', a: 'Proportional-Integral-Derivative controller that responds to current, past, and predicted future errors.' },
    ],
  },
  'MECH': {
    'Mechanical Design': [
      { q: 'What is FEA?', a: 'Finite Element Analysis divides structure into small elements for stress and thermal analysis.' },
      { q: 'Explain stress and strain.', a: 'Stress is force per unit area. Strain is deformation per unit length.' },
    ],
    'Production Engineer': [
      { q: 'What is lean manufacturing?', a: 'Philosophy focused on minimizing waste while maximizing value.' },
    ],
  },
  'CIVIL': {
    'Structural Engineer': [
      { q: 'What is reinforced concrete?', a: 'Concrete with embedded steel bars. Concrete resists compression, steel resists tension.' },
      { q: 'Explain moment of inertia.', a: 'Measure of resistance to bending. Depends on cross-section shape.' },
    ],
    'Construction Manager': [
      { q: 'What is CPM?', a: 'Critical Path Method identifies longest sequence of dependent activities.' },
    ],
  },
};

// Resume Templates
const resumeTemplates = [
  {
    id: 'modern',
    name: 'Modern Professional',
    category: 'Software Engineer',
    description: 'Clean and modern design perfect for tech roles',
    preview: '/templates/modern.png',
  },
  {
    id: 'classic',
    name: 'Classic Formal',
    category: 'Business Analyst',
    description: 'Traditional format suitable for corporate roles',
    preview: '/templates/classic.png',
  },
  {
    id: 'creative',
    name: 'Creative Designer',
    category: 'Product Manager',
    description: 'Eye-catching design for creative positions',
    preview: '/templates/creative.png',
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    category: 'Data Scientist',
    description: 'Simple and elegant layout',
    preview: '/templates/minimal.png',
  },
  {
    id: 'fresher',
    name: 'Fresher Template',
    category: 'Fresher - General',
    description: 'Perfect for fresh graduates',
    preview: '/templates/fresher.png',
  },
];

export default function Resources() {
  // Interview Questions State
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [questions, setQuestions] = useState<Array<{ q: string; a: string }>>([]);
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

  // Resume Builder State
  const [resumeCategory, setResumeCategory] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [resumeData, setResumeData] = useState({
    name: '',
    email: '',
    phone: '',
    summary: '',
    skills: '',
    experience: '',
    education: '',
    projects: '',
  });

  const departments = Object.keys(interviewQuestions);

  const handleDepartmentChange = (dept: string) => {
    setSelectedDepartment(dept);
    setSelectedRole('');
    setQuestions([]);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    if (selectedDepartment && interviewQuestions[selectedDepartment]?.[role]) {
      setQuestions(interviewQuestions[selectedDepartment][role]);
      setShowAnswers({});
    }
  };

  const toggleAnswer = (index: number) => {
    setShowAnswers(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setIsEditDialogOpen(true);
  };

  const handleDownloadResume = () => {
    // Create a professional HTML resume with modern styling
    const resumeHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${resumeData.name} - Professional Resume</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
          }
          
          .resume-container {
            max-width: 850px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
          }
          
          .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
            letter-spacing: 1px;
          }
          
          .contact-info {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
            margin-top: 15px;
            font-size: 0.95em;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          
          ${companyName ? `
          .target-company {
            margin-top: 15px;
            padding: 10px 20px;
            background: rgba(255,255,255,0.2);
            border-radius: 20px;
            display: inline-block;
            font-weight: 600;
          }
          ` : ''}
          
          .content {
            padding: 40px;
          }
          
          .section {
            margin-bottom: 35px;
          }
          
          .section-title {
            font-size: 1.4em;
            color: #667eea;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 3px solid #667eea;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .summary-text {
            font-size: 1.05em;
            line-height: 1.8;
            color: #555;
            text-align: justify;
          }
          
          .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 10px;
          }
          
          .skill-badge {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 18px;
            border-radius: 25px;
            font-size: 0.9em;
            font-weight: 600;
            box-shadow: 0 2px 5px rgba(102, 126, 234, 0.3);
          }
          
          .experience-item, .education-item, .project-item {
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            border-radius: 5px;
          }
          
          .item-title {
            font-size: 1.1em;
            font-weight: 700;
            color: #333;
            margin-bottom: 8px;
          }
          
          .item-content {
            color: #555;
            line-height: 1.7;
            white-space: pre-line;
          }
          
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
            border-top: 1px solid #e0e0e0;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .resume-container {
              box-shadow: none;
            }
            .header {
              background: #667eea;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .skill-badge {
              background: #667eea;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          
          @page {
            margin: 0.5in;
          }
        </style>
      </head>
      <body>
        <div class="resume-container">
          <!-- Header Section -->
          <div class="header">
            <h1>${resumeData.name}</h1>
            <div class="contact-info">
              <div class="contact-item">
                <span>📧</span>
                <span>${resumeData.email}</span>
              </div>
              <div class="contact-item">
                <span>📱</span>
                <span>${resumeData.phone}</span>
              </div>
            </div>
            ${companyName ? `
              <div class="target-company">
                🎯 Applying to: ${companyName}
              </div>
            ` : ''}
          </div>
          
          <!-- Content Section -->
          <div class="content">
            ${resumeData.summary ? `
              <div class="section">
                <h2 class="section-title">Professional Summary</h2>
                <p class="summary-text">${resumeData.summary}</p>
              </div>
            ` : ''}
            
            ${resumeData.skills ? `
              <div class="section">
                <h2 class="section-title">Technical Skills</h2>
                <div class="skills-container">
                  ${resumeData.skills.split(',').map(skill => 
                    `<span class="skill-badge">${skill.trim()}</span>`
                  ).join('')}
                </div>
              </div>
            ` : ''}
            
            ${resumeData.experience ? `
              <div class="section">
                <h2 class="section-title">Professional Experience</h2>
                <div class="experience-item">
                  <div class="item-content">${resumeData.experience}</div>
                </div>
              </div>
            ` : ''}
            
            ${resumeData.education ? `
              <div class="section">
                <h2 class="section-title">Education</h2>
                <div class="education-item">
                  <div class="item-content">${resumeData.education}</div>
                </div>
              </div>
            ` : ''}
            
            ${resumeData.projects ? `
              <div class="section">
                <h2 class="section-title">Projects</h2>
                <div class="project-item">
                  <div class="item-content">${resumeData.projects}</div>
                </div>
              </div>
            ` : ''}
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p>Resume generated on ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p style="margin-top: 5px; font-size: 0.85em;">
              This resume was created using PlaceHub - Smart Campus Placement Portal
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([resumeHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.name.replace(/\s+/g, '_')}_Professional_Resume.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Explore Resources</h1>
          <p className="text-muted-foreground">Interview preparation and resume building tools</p>
        </div>

        <Tabs defaultValue="interview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="interview" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Interview Questions
            </TabsTrigger>
            <TabsTrigger value="resume" className="gap-2">
              <FileText className="h-4 w-4" />
              Resume Builder
            </TabsTrigger>
          </TabsList>

          {/* Interview Questions Tab */}
          <TabsContent value="interview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Interview Question Bank
                </CardTitle>
                <CardDescription>
                  Select your department and target role to get relevant interview questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Job Role</Label>
                    <Select 
                      value={selectedRole} 
                      onValueChange={handleRoleChange}
                      disabled={!selectedDepartment}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedDepartment && Object.keys(interviewQuestions[selectedDepartment] || {}).map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {questions.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {questions.length} Questions for {selectedRole}
                      </h3>
                      <Badge variant="outline">{selectedDepartment}</Badge>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      {questions.map((item, index) => (
                        <Card key={index} className="border-l-4 border-l-primary">
                          <CardContent className="pt-6">
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <Badge className="mt-1">Q{index + 1}</Badge>
                                <p className="font-medium flex-1">{item.q}</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleAnswer(index)}
                                className="w-full"
                              >
                                {showAnswers[index] ? 'Hide Answer' : 'Show Answer'}
                              </Button>
                              {showAnswers[index] && (
                                <div className="bg-muted p-4 rounded-lg">
                                  <p className="text-sm"><strong>Answer:</strong> {item.a}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDepartment && selectedRole && questions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No questions available for this combination yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resume Builder Tab */}
          <TabsContent value="resume" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Resume Builder
                </CardTitle>
                <CardDescription>
                  Create a professional resume tailored to your target company
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Resume Category</Label>
                    <Select value={resumeCategory} onValueChange={setResumeCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                        <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                        <SelectItem value="Product Manager">Product Manager</SelectItem>
                        <SelectItem value="Business Analyst">Business Analyst</SelectItem>
                        <SelectItem value="Fresher - General">Fresher - General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Company (Optional)</Label>
                    <Input
                      placeholder="e.g., Google, Microsoft"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>

                {resumeCategory && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold">Choose a Template</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {resumeTemplates
                        .filter(t => !resumeCategory || t.category === resumeCategory || t.category === 'Fresher - General')
                        .map(template => (
                          <Card 
                            key={template.id} 
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => handleTemplateSelect(template.id)}
                          >
                            <CardContent className="pt-6">
                              <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg mb-4 flex items-center justify-center">
                                <FileText className="h-16 w-16 text-primary" />
                              </div>
                              <h4 className="font-semibold">{template.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                              <Badge variant="outline" className="mt-2">{template.category}</Badge>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Resume Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Resume Details
              </DialogTitle>
              <DialogDescription>
                Fill in your details to generate a professional resume
                {companyName && ` for ${companyName}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={resumeData.name}
                    onChange={(e) => setResumeData({ ...resumeData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={resumeData.email}
                    onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  placeholder="+91 9876543210"
                  value={resumeData.phone}
                  onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  placeholder="Brief overview of your experience and goals..."
                  rows={3}
                  value={resumeData.summary}
                  onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  placeholder="JavaScript, React, Node.js, Python"
                  value={resumeData.skills}
                  onChange={(e) => setResumeData({ ...resumeData, skills: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Textarea
                  id="experience"
                  placeholder="List your work experience, internships..."
                  rows={4}
                  value={resumeData.experience}
                  onChange={(e) => setResumeData({ ...resumeData, experience: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Textarea
                  id="education"
                  placeholder="Your educational qualifications..."
                  rows={3}
                  value={resumeData.education}
                  onChange={(e) => setResumeData({ ...resumeData, education: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projects">Projects</Label>
                <Textarea
                  id="projects"
                  placeholder="Describe your key projects..."
                  rows={4}
                  value={resumeData.projects}
                  onChange={(e) => setResumeData({ ...resumeData, projects: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleDownloadResume} 
                className="flex-1 gap-2"
                disabled={!resumeData.name || !resumeData.email || !resumeData.phone}
              >
                <Download className="h-4 w-4" />
                Download Resume
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
