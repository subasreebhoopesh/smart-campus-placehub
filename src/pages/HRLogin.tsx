import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Lock, Mail, ArrowRight, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function HRLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password, 'hr');
      if (result.success) {
        toast({ title: 'Login Successful!', description: 'Welcome to HR Dashboard' });
        navigate('/hr/dashboard');
      } else {
        toast({
          title: 'Login Failed',
          description: result.message || 'Invalid email or password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred during login. Please ensure backend is running.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="h-16 w-16 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">HR / Recruiter Portal</h1>
          <p className="text-muted-foreground mt-1">Login to your account or register your company</p>
        </div>

        {/* Two option cards */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* LEFT: Login */}
          <Card className="border-2 border-purple-200 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl text-purple-700">Already Registered?</CardTitle>
              <CardDescription>Login with your approved HR credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="hr@company.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : (
                    <>Login <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* RIGHT: Register */}
          <Card
            className="border-2 border-dashed border-purple-300 hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => navigate('/company/register')}
          >
            <CardContent className="flex flex-col items-center justify-center h-full py-12 text-center space-y-4">
              <div className="h-20 w-20 rounded-2xl bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-colors">
                <PlusCircle className="h-10 w-10 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-700">New Company?</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Register your company for campus placements
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-sm text-purple-700 w-full">
                <strong>How it works:</strong>
                <ul className="mt-1 space-y-1 text-left list-disc list-inside">
                  <li>Fill company + HR details</li>
                  <li>Set your own email & password</li>
                  <li>Admin approves your request</li>
                  <li>Login with your credentials</li>
                </ul>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 group-hover:scale-105 transition-transform">
                Register Your Company <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-purple-600 transition-colors">
            ← Back to Main Login
          </Link>
        </div>

      </div>
    </div>
  );
}
