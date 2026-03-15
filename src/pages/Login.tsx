import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Shield, Building2, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Login() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'admin',
      title: 'Admin',
      description: 'Manage the entire placement system',
      icon: Shield,
      color: 'from-blue-500 to-indigo-600',
      path: '/admin/login',
    },
    {
      id: 'hr',
      title: 'HR / Recruiter',
      description: 'Review applications and manage drives',
      icon: Building2,
      color: 'from-purple-500 to-pink-600',
      path: '/hr/login',
    },
    {
      id: 'student',
      title: 'Student',
      description: 'Apply for placements and track status',
      icon: User,
      color: 'from-green-500 to-emerald-600',
      path: '/student/login',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="font-bold text-3xl">PlaceHub</span>
          </Link>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-lg">
            Select your role to continue to the portal
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => (
            <Card
              key={role.id}
              className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 hover:scale-105"
              onClick={() => navigate(role.path)}
            >
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto mb-4 h-20 w-20 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <role.icon className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl">{role.title}</CardTitle>
                <CardDescription className="text-base">
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-6">
                <Button 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  variant="outline"
                >
                  Login as {role.title}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center space-y-4">
          <Card className="bg-white/50 backdrop-blur-sm border-primary/20">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">New Student?</span>{' '}
                <Link to="/student/register" className="text-primary hover:underline font-medium">
                  Register here
                </Link>
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">
              ← Back to Home
            </Link>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-colors">
              Need Help?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
