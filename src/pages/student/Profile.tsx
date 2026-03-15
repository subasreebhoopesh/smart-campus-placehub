import { useState, useEffect } from 'react';
import { Save, Upload, Plus, X, Mail, Phone, Linkedin, Github, Settings, Loader2, Trash2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/services/api';

interface Project {
  name: string;
  description: string;
  technologies?: string;
  link?: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Profile data
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cgpa: '',
    tenthPercentage: '',
    twelfthPercentage: '',
    phone: '',
    linkedin: '',
    github: '',
    about: '',
  });

  // Project dialog
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    technologies: '',
    link: '',
  });

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await api.students.getProfile();
      console.log('Profile data:', data);
      
      setProfile(data);
      setSkills(data.skills || []);
      setProjects(data.projects || []);
      
      // Get user data from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      setFormData({
        name: user.name || '',
        email: user.email || '',
        cgpa: data.cgpa?.toString() || '0',
        tenthPercentage: data.tenth_percentage?.toString() || '',
        twelfthPercentage: data.twelfth_percentage?.toString() || '',
        phone: data.phone || '',
        linkedin: data.linkedin || '',
        github: data.github || '',
        about: data.about || '',
      });

      // Update user avatar in localStorage and trigger update
      if (data.profile_photo_url) {
        user.avatar = data.profile_photo_url;
        localStorage.setItem('user', JSON.stringify(user));
        // Dispatch event to update TopNav
        window.dispatchEvent(new Event('profileUpdated'));
      }
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    
    let completed = 0;
    const total = 10;
    
    if (profile.cgpa > 0) completed++;
    if (profile.tenth_percentage) completed++;
    if (profile.twelfth_percentage) completed++;
    if (skills.length > 0) completed++;
    if (projects.length > 0) completed++;
    if (formData.phone) completed++;
    if (formData.linkedin) completed++;
    if (formData.github) completed++;
    if (formData.about) completed++;
    if (profile.resume_url) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const openProjectDialog = (index: number | null = null) => {
    if (index !== null) {
      setEditingProjectIndex(index);
      const project = projects[index];
      setProjectForm({
        name: project.name,
        description: project.description,
        technologies: project.technologies || '',
        link: project.link || ''
      });
    } else {
      setEditingProjectIndex(null);
      setProjectForm({ name: '', description: '', technologies: '', link: '' });
    }
    setIsProjectDialogOpen(true);
  };

  const saveProject = () => {
    if (!projectForm.name || !projectForm.description) {
      toast({
        title: "Missing Fields",
        description: "Please fill in project name and description",
        variant: "destructive",
      });
      return;
    }

    if (editingProjectIndex !== null) {
      // Edit existing project
      const updatedProjects = [...projects];
      updatedProjects[editingProjectIndex] = projectForm;
      setProjects(updatedProjects);
    } else {
      // Add new project
      setProjects([...projects, projectForm]);
    }

    setIsProjectDialogOpen(false);
    setProjectForm({ name: '', description: '', technologies: '', link: '' });
    setEditingProjectIndex(null);
  };

  const deleteProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updateData = {
        name: formData.name,
        email: formData.email,
        cgpa: parseFloat(formData.cgpa) || 0,
        tenthPercentage: parseFloat(formData.tenthPercentage) || 0,
        twelfthPercentage: parseFloat(formData.twelfthPercentage) || 0,
        skills: skills,
        projects: projects,
        phone: formData.phone,
        linkedin: formData.linkedin,
        github: formData.github,
        about: formData.about,
      };

      await api.students.updateProfile(updateData);

      // Update localStorage with new name and email
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.name = formData.name;
      user.email = formData.email;
      localStorage.setItem('user', JSON.stringify(user));

      toast({
        title: "Profile Updated!",
        description: "Your profile has been successfully updated.",
      });

      // Refresh profile
      fetchProfile();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Resume must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingResume(true);
      await api.students.uploadResume(file);
      
      toast({
        title: "Resume Uploaded!",
        description: "Your resume has been uploaded successfully.",
      });

      fetchProfile();
    } catch (error: any) {
      console.error('Failed to upload resume:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload resume",
        variant: "destructive",
      });
    } finally {
      setUploadingResume(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Photo must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingPhoto(true);
      const result = await api.students.uploadPhoto(file);
      
      toast({
        title: "Photo Uploaded!",
        description: "Your profile photo has been uploaded successfully.",
      });

      // Refresh profile
      await fetchProfile();
      
      // Trigger custom event to update avatar in TopNav
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (error: any) {
      console.error('Failed to upload photo:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoDownload = () => {
    if (!profile?.profile_photo_url) {
      toast({
        title: "No Photo",
        description: "Please upload a profile photo first",
        variant: "destructive",
      });
      return;
    }

    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = `http://localhost:3001${profile.profile_photo_url}`;
    link.download = `profile-photo-${user.name || 'student'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download Started",
      description: "Your profile photo is being downloaded",
    });
  };

  if (loading) {
    return (
      <DashboardLayout userRole="student">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const profileCompletion = calculateProfileCompletion();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">Manage your profile information</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => navigate('/student/dashboard')}>
              <Settings className="h-4 w-4" />
              Dashboard
            </Button>
            <Button className="gap-2" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
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
              {profileCompletion < 100 && (
                <p className="text-sm text-muted-foreground">
                  Complete your profile to increase visibility
                </p>
              )}
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
                  <AvatarImage src={profile?.profile_photo_url ? `http://localhost:3001${profile.profile_photo_url}` : undefined} />
                  <AvatarFallback className="text-4xl">
                    {user.name?.charAt(0).toUpperCase() || 'S'}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload
                      </>
                    )}
                  </Button>
                  {profile?.profile_photo_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={handlePhotoDownload}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Academic Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Roll Number</p>
                  <p className="font-medium">{profile?.roll_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Branch</p>
                  <p className="font-medium">{profile?.branch}</p>
                </div>
                <Separator />
                <div>
                  <Label htmlFor="cgpa" className="text-sm text-muted-foreground">CGPA *</Label>
                  <Input
                    id="cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                    className="mt-1 font-medium text-primary text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="tenth" className="text-sm text-muted-foreground">10th Percentage</Label>
                  <Input
                    id="tenth"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.tenthPercentage}
                    onChange={(e) => setFormData({ ...formData, tenthPercentage: e.target.value })}
                    className="mt-1 font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="twelfth" className="text-sm text-muted-foreground">12th Percentage</Label>
                  <Input
                    id="twelfth"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.twelfthPercentage}
                    onChange={(e) => setFormData({ ...formData, twelfthPercentage: e.target.value })}
                    className="mt-1 font-medium"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resume</CardTitle>
              </CardHeader>
              <CardContent>
                {profile?.resume_url ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <p className="text-sm font-medium text-green-800">Resume Uploaded ✓</p>
                      <a
                        href={profile.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 hover:underline"
                      >
                        View Resume
                      </a>
                    </div>
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleResumeUpload}
                      disabled={uploadingResume}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => document.getElementById('resume-upload')?.click()}
                      disabled={uploadingResume}
                    >
                      {uploadingResume ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Update Resume'
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload your resume (PDF, max 5MB)
                    </p>
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleResumeUpload}
                      disabled={uploadingResume}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('resume-upload')?.click()}
                      disabled={uploadingResume}
                    >
                      {uploadingResume ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Choose File'
                      )}
                    </Button>
                  </div>
                )}
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
                    <Input 
                      id="name" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your.email@example.com"
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
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 9876543210"
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
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        placeholder="linkedin.com/in/yourprofile"
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
                        value={formData.github}
                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                        placeholder="github.com/yourprofile"
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
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  rows={4}
                  placeholder="Tell recruiters about yourself, your interests, and career goals..."
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
                    placeholder="Add a skill (e.g., React, Python, Communication)..."
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
                <CardTitle>Projects</CardTitle>
                <CardDescription>Showcase your work and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map((project, index) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/50 relative group">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openProjectDialog(index)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteProject(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                      {project.technologies && (
                        <p className="text-xs text-muted-foreground mt-2">
                          <strong>Tech:</strong> {project.technologies}
                        </p>
                      )}
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline mt-1 inline-block"
                        >
                          View Project →
                        </a>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => openProjectDialog()}
                  >
                    <Plus className="h-4 w-4" />
                    Add Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add/Edit Project Dialog */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProjectIndex !== null ? 'Edit Project' : 'Add New Project'}</DialogTitle>
            <DialogDescription>
              Add details about your project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                placeholder="E-Commerce Platform"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-desc">Description *</Label>
              <Textarea
                id="project-desc"
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                placeholder="Brief description of your project..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-tech">Technologies Used</Label>
              <Input
                id="project-tech"
                value={projectForm.technologies}
                onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                placeholder="React, Node.js, MongoDB"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-link">Project Link</Label>
              <Input
                id="project-link"
                value={projectForm.link}
                onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                placeholder="https://github.com/yourproject"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProjectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveProject}>
              {editingProjectIndex !== null ? 'Update' : 'Add'} Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
