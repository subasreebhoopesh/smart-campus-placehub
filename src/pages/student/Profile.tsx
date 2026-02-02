import { useState } from 'react';
import { Save, Upload, Plus, X, Mail, Phone, Linkedin, Github } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

const studentData = {
  name: 'Rahul Sharma',
  rollNumber: 'CSE2021001',
  email: 'rahul.sharma@college.edu',
  phone: '+91 9876543210',
  branch: 'CSE',
  cgpa: 8.5,
  linkedin: 'linkedin.com/in/rahulsharma',
  github: 'github.com/rahulsharma',
  skills: ['React', 'Node.js', 'Python', 'Machine Learning', 'TypeScript'],
  about:
    'Passionate software developer with experience in full-stack development. Strong problem-solving skills and eager to learn new technologies.',
  education: [
    {
      degree: 'B.Tech in Computer Science',
      institution: 'ABC Institute of Technology',
      year: '2021-2025',
      grade: 'CGPA: 8.5',
    },
    {
      degree: 'Class XII',
      institution: 'XYZ Senior Secondary School',
      year: '2021',
      grade: '92%',
    },
  ],
  projects: [
    { name: 'E-Commerce Platform', description: 'Full-stack app with React and Node.js' },
    { name: 'ML Stock Predictor', description: 'Machine learning model for stock prediction' },
  ],
};

export default function Profile() {
  const [skills, setSkills] = useState(studentData.skills);
  const [newSkill, setNewSkill] = useState('');
  const [about, setAbout] = useState(studentData.about);

  const profileCompletion = 85;

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">Manage your profile information</p>
          </div>
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>

        {/* Profile Completion */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span>Profile Completion</span>
                  <span className="font-medium">{profileCompletion}%</span>
                </div>
                <Progress value={profileCompletion} />
              </div>
              <Button variant="outline" size="sm">
                Complete Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Photo & Basic Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-4xl">RS</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Photo
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Academic Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Roll Number</p>
                  <p className="font-medium">{studentData.rollNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Branch</p>
                  <p className="font-medium">{studentData.branch}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CGPA</p>
                  <p className="font-medium text-primary text-xl">{studentData.cgpa}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload your resume (PDF)
                  </p>
                  <Button variant="outline" size="sm">
                    Choose File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={studentData.name} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        defaultValue={studentData.email}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        className="pl-10"
                        defaultValue={studentData.phone}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="linkedin"
                        className="pl-10"
                        defaultValue={studentData.linkedin}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="github">GitHub</Label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="github"
                        className="pl-10"
                        defaultValue={studentData.github}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
                <CardDescription>Brief description about yourself</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={4}
                  placeholder="Tell recruiters about yourself..."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>Add your technical and soft skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1 text-sm">
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button onClick={addSkill} className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
                <CardDescription>Your educational background</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentData.education.map((edu, index) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/50">
                      <p className="font-medium">{edu.degree}</p>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      <div className="flex justify-between text-sm mt-1">
                        <span>{edu.year}</span>
                        <span className="text-primary">{edu.grade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Showcase your work</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentData.projects.map((project, index) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/50">
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Add Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
