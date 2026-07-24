import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Mail, Lock, Phone, Globe, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function CompanyRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    companyName: '',
    industry: '',
    website: '',
    hrName: '',
    hrEmail: '',
    hrPhone: '',
    hrPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.companyName || !form.hrName || !form.hrEmail || !form.hrPassword) {
      toast({ title: 'Missing Fields', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    if (form.hrPassword !== form.confirmPassword) {
      toast({ title: 'Password Mismatch', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (form.hrPassword.length < 6) {
      toast({ title: 'Weak Password', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/company-requests/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: form.companyName,
          industry: form.industry,
          website: form.website,
          hrName: form.hrName,
          hrEmail: form.hrEmail,
          hrPhone: form.hrPhone,
          hrPassword: form.hrPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        toast({ title: 'Error', description: data.message || 'Submission failed', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Network Error', description: 'Could not connect to server', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-10 pb-8">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">Request Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Your company registration request has been sent to the placement admin. You will receive login credentials once your request is approved.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700 mb-6">
              <strong>What happens next?</strong><br />
              Admin reviews your request → Approves or Rejects → You can login with your HR credentials after approval.
            </div>
            <Button onClick={() => navigate('/hr/login')} className="w-full">
              Go to HR Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Company Registration</CardTitle>
          <CardDescription>
            Register your company for campus placements. Admin will review and approve your request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Company Details</p>
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <div className="relative mt-1">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="companyName" name="companyName" className="pl-10" placeholder="e.g. Infosys" value={form.companyName} onChange={handleChange} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <div className="relative mt-1">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="industry" name="industry" className="pl-10" placeholder="e.g. IT Services" value={form.industry} onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <div className="relative mt-1">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="website" name="website" className="pl-10" placeholder="https://..." value={form.website} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>

            {/* HR Contact Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">HR Contact Person</p>
              <div>
                <Label htmlFor="hrName">HR Name *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="hrName" name="hrName" className="pl-10" placeholder="Full Name" value={form.hrName} onChange={handleChange} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="hrEmail">HR Email *</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="hrEmail" name="hrEmail" type="email" className="pl-10" placeholder="hr@company.com" value={form.hrEmail} onChange={handleChange} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="hrPhone">Phone</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="hrPhone" name="hrPhone" className="pl-10" placeholder="9876543210" value={form.hrPhone} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="hrPassword">Password *</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="hrPassword" name="hrPassword" type="password" className="pl-10" placeholder="Min 6 characters" value={form.hrPassword} onChange={handleChange} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="confirmPassword" name="confirmPassword" type="password" className="pl-10" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} required />
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Registration Request'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already approved?{' '}
              <button type="button" onClick={() => navigate('/hr/login')} className="text-primary hover:underline">
                Login here
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
