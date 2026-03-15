import { useState, useEffect } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function HRSkills() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    loadSkills();
  }, [user]);

  const loadSkills = () => {
    const skills = JSON.parse(
      localStorage.getItem(`requiredSkills_${user?.companyId}`) || '[]'
    );
    setRequiredSkills(skills);
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;

    if (requiredSkills.includes(newSkill.trim())) {
      toast({
        title: "Skill Already Added",
        description: "This skill is already in the list",
        variant: "destructive",
      });
      return;
    }

    const updated = [...requiredSkills, newSkill.trim()];
    setRequiredSkills(updated);
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const handleSave = () => {
    localStorage.setItem(
      `requiredSkills_${user?.companyId}`,
      JSON.stringify(requiredSkills)
    );

    toast({
      title: "Skills Saved!",
      description: "Required skills have been updated successfully",
    });
  };

  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js',
    'SQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'TypeScript',
    'Angular', 'Vue.js', 'Spring Boot', 'Django', 'Flask',
    'Machine Learning', 'Data Science', 'DevOps', 'Kubernetes',
  ];

  return (
    <DashboardLayout userRole="hr">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Required Skills</h1>
          <p className="text-muted-foreground">
            Define the skills required for your company's positions
          </p>
        </div>

        {/* Add Skill */}
        <Card>
          <CardHeader>
            <CardTitle>Add Required Skill</CardTitle>
            <CardDescription>
              Add skills that candidates should possess
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter skill name (e.g., React, Python)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              />
              <Button onClick={handleAddSkill}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Required Skills */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Required Skills</CardTitle>
                <CardDescription>
                  {requiredSkills.length} skills defined
                </CardDescription>
              </div>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {requiredSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-sm py-2 px-3"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No skills added yet. Add skills to enable automatic matching.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Common Skills Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle>Common Skills</CardTitle>
            <CardDescription>
              Click to add commonly required skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {commonSkills
                .filter(skill => !requiredSkills.includes(skill))
                .map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => setRequiredSkills([...requiredSkills, skill])}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {skill}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Skill Matching Info */}
        <Card>
          <CardHeader>
            <CardTitle>How Skill Matching Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                • Students with matching skills will be highlighted in the applications list
              </p>
              <p>
                • A skill match percentage will be calculated for each applicant
              </p>
              <p>
                • Students with 70% or higher match will be marked as strong candidates
              </p>
              <p>
                • You can use this to quickly identify and shortlist qualified candidates
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
