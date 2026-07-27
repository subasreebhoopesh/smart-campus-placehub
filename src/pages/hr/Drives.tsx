import { useState, useEffect } from 'react';
import { Plus, Briefcase, Calendar, Users, GraduationCap, Loader2, Trash2, PlusCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MBA'];

const ROUND_TYPES = [
  { value: 'online_mcq', label: '📝 Online MCQ Test', description: 'Auto-generates role-relevant MCQ questions with timer' },
  { value: 'aptitude_test', label: '🧮 Aptitude Test', description: 'Logical reasoning and quantitative aptitude' },
  { value: 'technical_interview', label: '💻 Technical Interview', description: 'Face-to-face technical round' },
  { value: 'group_discussion', label: '👥 Group Discussion', description: 'Group discussion round' },
  { value: 'hr_interview', label: '🤝 HR Interview', description: 'Final HR round' },
];

interface Round {
  roundNumber: number;
  roundType: string;
  description: string;
}

interface Drive {
  id: string;
  company_name: string;
  job_role: string;
  drive_date: string;
  eligible_branches: string;
  min_cgpa: number;
  package_offered: number;
  description: string;
  status: string;
  registered_students: number;
}

export default function HRDrives() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);

  const [form, setForm] = useState({
    jobRole: '',
    driveDate: '',
    minCgpa: '',
    packageOffered: '',
    description: '',
    requiredStudents: '1',
  });

  useEffect(() => { fetchDrives(); }, []);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/drives/hr/my-drives`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDrives(data.drives || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBranch = (branch: string) => {
    setSelectedBranches(prev =>
      prev.includes(branch) ? prev.filter(b => b !== branch) : [...prev, branch]
    );
  };

  const addRound = () => {
    setRounds(prev => [...prev, { roundNumber: prev.length + 1, roundType: '', description: '' }]);
  };

  const removeRound = (index: number) => {
    setRounds(prev => prev.filter((_, i) => i !== index).map((r, i) => ({ ...r, roundNumber: i + 1 })));
  };

  const updateRound = (index: number, field: keyof Round, value: string | number) => {
    setRounds(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const handleSubmit = async () => {
    if (!form.jobRole || !form.driveDate) {
      toast({ title: 'Missing Fields', description: 'Job role and drive date are required', variant: 'destructive' });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/drives/hr`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          eligibleBranches: selectedBranches,
          minCgpa: parseFloat(form.minCgpa) || 0,
          packageOffered: parseFloat(form.packageOffered) || 0,
          requiredStudents: parseInt(form.requiredStudents) || 1,
          interviewRounds: rounds.filter(r => r.roundType),
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const msg = data.assessmentCreated
          ? `Drive created! Online MCQ assessment auto-generated for students.`
          : data.message;
        toast({ title: '✅ Drive Created!', description: msg });
        setDialogOpen(false);
        setForm({ jobRole: '', driveDate: '', minCgpa: '', packageOffered: '', description: '', requiredStudents: '1' });
        setSelectedBranches([]);
        setRounds([]);
        fetchDrives();
      } else {
        toast({ title: 'Error', description: data.message, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to create drive', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (status: string) => {
    if (status === 'upcoming') return 'bg-blue-100 text-blue-700';
    if (status === 'ongoing') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <DashboardLayout userRole="hr">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Placement Drives</h1>
            <p className="text-muted-foreground">Create and manage drives for <b>{user?.companyName}</b></p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Create Drive
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : drives.length === 0 ? (
          <Card>
            <CardContent className="pt-16 pb-16 text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">No drives created yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Create Drive" to post your first placement drive.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {drives.map(drive => (
              <Card key={drive.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{drive.job_role}</h3>
                      <p className="text-sm text-muted-foreground">{drive.company_name}</p>
                    </div>
                    <Badge className={statusColor(drive.status)}>{drive.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(drive.drive_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5" />
                      Min CGPA: {drive.min_cgpa || 'Any'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {drive.package_offered} LPA
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {drive.registered_students || 0} applied
                    </div>
                  </div>
                  {drive.eligible_branches && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {drive.eligible_branches.split(',').map(b => (
                        <Badge key={b} variant="secondary" className="text-xs">{b.trim()}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Drive Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Placement Drive — {user?.companyName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Job Role *</Label>
              <Input className="mt-1" placeholder="e.g. Software Engineer" value={form.jobRole} onChange={e => setForm({ ...form, jobRole: e.target.value })} />
            </div>
            <div>
              <Label>Drive Date *</Label>
              <Input className="mt-1" type="date" value={form.driveDate} onChange={e => setForm({ ...form, driveDate: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Minimum CGPA</Label>
                <Input className="mt-1" type="number" step="0.1" min="0" max="10" placeholder="e.g. 7.0" value={form.minCgpa} onChange={e => setForm({ ...form, minCgpa: e.target.value })} />
              </div>
              <div>
                <Label>Package (LPA)</Label>
                <Input className="mt-1" type="number" step="0.5" placeholder="e.g. 6.5" value={form.packageOffered} onChange={e => setForm({ ...form, packageOffered: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Required Students</Label>
              <Input className="mt-1" type="number" min="1" placeholder="1" value={form.requiredStudents} onChange={e => setForm({ ...form, requiredStudents: e.target.value })} />
            </div>
            <div>
              <Label>Eligible Branches</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {BRANCHES.map(branch => (
                  <button
                    key={branch}
                    type="button"
                    onClick={() => toggleBranch(branch)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${selectedBranches.includes(branch) ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:border-primary'}`}
                  >
                    {branch}
                  </button>
                ))}
              </div>
              {selectedBranches.length === 0 && <p className="text-xs text-muted-foreground mt-1">No selection = all branches eligible</p>}
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1" placeholder="Job description, requirements..." rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            {/* Interview Rounds */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Interview Rounds</Label>
                <Button type="button" variant="outline" size="sm" onClick={addRound} className="gap-1">
                  <PlusCircle className="h-3.5 w-3.5" /> Add Round
                </Button>
              </div>

              {rounds.length === 0 && (
                <p className="text-xs text-muted-foreground py-2 px-3 bg-gray-50 rounded border border-dashed">
                  No rounds added. Click "Add Round" to define interview stages.
                </p>
              )}

              <div className="space-y-3">
                {rounds.map((round, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">Round {round.roundNumber}</span>
                      <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-400 hover:text-red-600" onClick={() => removeRound(index)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Select value={round.roundType} onValueChange={(val) => updateRound(index, 'roundType', val)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select round type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ROUND_TYPES.map(rt => (
                          <SelectItem key={rt.value} value={rt.value}>
                            <div>
                              <div>{rt.label}</div>
                              <div className="text-xs text-muted-foreground">{rt.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {round.roundType === 'online_mcq' && (
                      <div className="text-xs bg-blue-50 border border-blue-200 rounded p-2 text-blue-700">
                        🤖 AI will auto-generate 20 MCQ questions based on "{form.jobRole || 'the job role'}" with a 30-minute timer for students.
                      </div>
                    )}
                    <Input
                      className="bg-white text-sm"
                      placeholder="Round description (optional)"
                      value={round.description}
                      onChange={(e) => updateRound(index, 'description', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Drive'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
