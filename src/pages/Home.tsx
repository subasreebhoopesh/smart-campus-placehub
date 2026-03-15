import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  GraduationCap,
  Building2,
  Briefcase,
  TrendingUp,
  ArrowRight,
  Users,
  Award,
  CheckCircle,
  Calendar,
  MapPin,
  Star,
  Sparkles,
  Target,
  Zap,
  Clock,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import api from '@/services/api';
import { format } from 'date-fns';

const stats = [
  { 
    icon: Users, 
    label: 'Total Students', 
    getValue: (realStats: any) => `${realStats.totalStudents}`,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950'
  },
  { 
    icon: Building2, 
    label: 'Partner Companies', 
    getValue: (realStats: any) => `${realStats.totalCompanies}`,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950'
  },
  { 
    icon: Award, 
    label: 'Students Placed', 
    getValue: (realStats: any) => `${realStats.placedStudents}`,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950'
  },
  { 
    icon: TrendingUp, 
    label: 'Highest Package', 
    getValue: (realStats: any) => realStats.highestPackage > 0 
      ? `${(realStats.highestPackage / 100000).toFixed(1)} LPA` 
      : 'N/A',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950'
  },
];

const features = [
  {
    title: 'Streamlined Placement Process',
    description: 'End-to-end management of placement drives from registration to offer letters.',
    icon: CheckCircle,
  },
  {
    title: 'Real-time Analytics',
    description: 'Track placement statistics, trends, and insights with interactive dashboards.',
    icon: TrendingUp,
  },
  {
    title: 'Company Database',
    description: 'Comprehensive database of recruiting companies with visit history.',
    icon: Building2,
  },
  {
    title: 'Student Management',
    description: 'Complete student profiles with skills, CGPA, and placement status.',
    icon: Users,
  },
];

export default function Home() {
  const [recentPlacements, setRecentPlacements] = useState<any[]>([]);
  const [upcomingDrives, setUpcomingDrives] = useState<any[]>([]);
  const [topCompanies, setTopCompanies] = useState<any[]>([]);
  const [realStats, setRealStats] = useState({
    totalStudents: 0,
    totalCompanies: 0,
    placedStudents: 0,
    highestPackage: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const [allCompanies, setAllCompanies] = useState<any[]>([]);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch public stats (no auth required)
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const statsRes = await fetch(`${API_BASE_URL}/public/stats`).then(r => r.json()).catch(() => ({}));
      
      setRealStats({
        totalStudents: statsRes.totalStudents || 0,
        totalCompanies: statsRes.totalCompanies || 0,
        placedStudents: statsRes.placedStudents || 0,
        highestPackage: statsRes.highestPackage || 0
      });

      // Fetch upcoming drives (public - no auth needed via drives endpoint)
      const drivesRes = await fetch(`${API_BASE_URL}/drives`).then(r => r.json()).catch(() => []);
      const drives = Array.isArray(drivesRes) ? drivesRes : [];

      const upcoming = drives
        .filter((d: any) => d.status === 'upcoming' || d.status === 'ongoing')
        .sort((a: any, b: any) => new Date(a.driveDate).getTime() - new Date(b.driveDate).getTime())
        .slice(0, 4);
      setUpcomingDrives(upcoming);

    } catch (error) {
      console.error('Failed to fetch home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPackage = (pkg: number) => {
    if (pkg >= 100000) {
      return `${(pkg / 100000).toFixed(1)} LPA`;
    }
    return `₹${pkg.toLocaleString()}`;
  };

  const handleViewAllPartners = async () => {
    try {
      setShowAllCompanies(true);
      const companies = await api.companies.getAll();
      setAllCompanies(Array.isArray(companies) ? companies : []);
    } catch (error) {
      console.error('Failed to fetch all companies:', error);
      setAllCompanies([]);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-300 to-purple-300 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110">
              <GraduationCap className="h-6 w-6 text-gray-800" />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">PlaceHub</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button className="bg-gradient-to-r from-blue-300 to-purple-300 hover:from-blue-400 hover:to-purple-400 text-gray-800 shadow-md hover:shadow-lg transition-all">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Animated Background - Pastel */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 opacity-60"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 mb-6 shadow-md">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">Smart Campus Recruitment Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight animate-fade-in">
            Smart Placement
            <br />
            Management
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            Streamline your campus placements with our comprehensive management system. 
            Track students, companies, drives, and analytics all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/login">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-300 to-purple-300 hover:from-blue-400 hover:to-purple-400 text-gray-800 shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-lg px-8 py-6">
                <Zap className="h-5 w-5" />
                Get Started Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          {/* Floating Icons */}
          <div className="mt-16 flex justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-md">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium">Easy to Use</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-md">
              <Zap className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-medium">Real-time Updates</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-md">
              <Target className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium">100% Accurate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-blue-950/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Our Impact in Numbers
            </h2>
            <p className="text-muted-foreground">Real-time statistics from our platform</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center hover:shadow-2xl transition-all hover:scale-110 border-2 hover:border-blue-300 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950/30">
                <CardContent className="pt-8 pb-6">
                  <div className={`h-20 w-20 mx-auto mb-4 rounded-2xl ${stat.bgColor} flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform`}>
                    <stat.icon className={`h-10 w-10 ${stat.color}`} />
                  </div>
                  <p className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {stat.getValue(realStats)}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Everything You Need for Placements
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make campus recruitment seamless
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-2xl transition-all hover:scale-105 hover:-translate-y-2 border-2 hover:border-purple-300 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-950/30 group">
                <CardHeader>
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-300 to-pink-300 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                    <feature.icon className="h-8 w-8 text-gray-800" />
                  </div>
                  <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Drives Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Upcoming Placement Drives
              </h2>
              <p className="text-lg text-muted-foreground">Don't miss out on these opportunities</p>
            </div>
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-yellow-200 to-orange-200 flex items-center justify-center shadow-lg animate-pulse">
              <Sparkles className="h-8 w-8 text-gray-800" />
            </div>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading drives...</p>
            </div>
          ) : upcomingDrives.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {upcomingDrives.map((drive, index) => (
                <Card key={index} className="hover:shadow-2xl transition-all hover:scale-105 hover:-translate-y-2 border-2 hover:border-purple-300 bg-white dark:bg-gray-800">
                  <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950/50 dark:to-purple-950/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2 font-bold">{drive.companyName || 'Company'}</CardTitle>
                        <CardDescription className="text-base font-medium">{drive.jobRole}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="ml-2 text-sm px-3 py-1 bg-gradient-to-r from-green-300 to-emerald-300 text-gray-800">
                        {drive.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {drive.driveDate 
                            ? format(new Date(drive.driveDate), 'MMM dd, yyyy')
                            : 'Date TBA'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-600">
                          {formatPackage(drive.packageOffered || 0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{drive.registeredStudents || 0} students registered</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {drive.eligibleBranches?.slice(0, 3).map((branch: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {branch}
                          </Badge>
                        ))}
                        {drive.eligibleBranches?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{drive.eligibleBranches.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No upcoming drives scheduled yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Check back soon for new opportunities!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Top Companies Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-rose-950/30 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 mb-4 shadow-md">
              <Star className="h-4 w-4" />
              <span className="text-sm font-semibold">Trusted by Top Companies</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
              Our Recruiting Partners
            </h2>
            <p className="text-xl text-muted-foreground">Leading IT companies that trust us for campus recruitment</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Google */}
            <a href="https://www.google.com/careers" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full">
                <CardContent className="pt-6 text-center">
                  <div className="h-20 w-20 mx-auto mb-4 rounded-lg bg-white shadow-sm flex items-center justify-center p-3">
                    <div className="text-4xl font-bold">
                      <span className="text-blue-500">G</span>
                      <span className="text-red-500">o</span>
                      <span className="text-yellow-500">o</span>
                      <span className="text-blue-500">g</span>
                      <span className="text-green-500">l</span>
                      <span className="text-red-500">e</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-1">Google</h3>
                  <p className="text-xs text-muted-foreground mb-2">Technology & Cloud</p>
                  <Badge variant="secondary" className="text-xs">20-45 LPA</Badge>
                </CardContent>
              </Card>
            </a>

            {/* Microsoft */}
            <a href="https://careers.microsoft.com" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full">
                <CardContent className="pt-6 text-center">
                  <div className="h-20 w-20 mx-auto mb-4 rounded-lg bg-white shadow-sm flex items-center justify-center p-3">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="w-8 h-8 bg-red-500"></div>
                      <div className="w-8 h-8 bg-green-500"></div>
                      <div className="w-8 h-8 bg-blue-500"></div>
                      <div className="w-8 h-8 bg-yellow-500"></div>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-1">Microsoft</h3>
                  <p className="text-xs text-muted-foreground mb-2">Software & Cloud</p>
                  <Badge variant="secondary" className="text-xs">18-40 LPA</Badge>
                </CardContent>
              </Card>
            </a>

            {/* Amazon */}
            <a href="https://www.amazon.jobs" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full">
                <CardContent className="pt-6 text-center">
                  <div className="h-20 w-20 mx-auto mb-4 rounded-lg bg-gradient-to-r from-orange-400 to-yellow-300 shadow-sm flex items-center justify-center">
                    <div className="text-white font-bold text-3xl">a</div>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white rounded-full"></div>
                  </div>
                  <h3 className="font-bold text-lg mb-1">Amazon</h3>
                  <p className="text-xs text-muted-foreground mb-2">E-commerce & AWS</p>
                  <Badge variant="secondary" className="text-xs">22-50 LPA</Badge>
                </CardContent>
              </Card>
            </a>

            {/* TCS */}
            <a href="https://www.tcs.com/careers" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full">
                <CardContent className="pt-6 text-center">
                  <div className="h-20 w-20 mx-auto mb-4 rounded-lg bg-blue-900 shadow-sm flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">TCS</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">TCS</h3>
                  <p className="text-xs text-muted-foreground mb-2">IT Services</p>
                  <Badge variant="secondary" className="text-xs">3.5-7 LPA</Badge>
                </CardContent>
              </Card>
            </a>

            {/* Infosys */}
            <a href="https://www.infosys.com/careers" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full">
                <CardContent className="pt-6 text-center">
                  <div className="h-20 w-20 mx-auto mb-4 rounded-lg bg-blue-600 shadow-sm flex items-center justify-center">
                    <span className="text-white font-bold text-xl">Infosys</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">Infosys</h3>
                  <p className="text-xs text-muted-foreground mb-2">IT Consulting</p>
                  <Badge variant="secondary" className="text-xs">4-9 LPA</Badge>
                </CardContent>
              </Card>
            </a>

            {/* Wipro */}
            <a href="https://careers.wipro.com" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full">
                <CardContent className="pt-6 text-center">
                  <div className="h-20 w-20 mx-auto mb-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm flex items-center justify-center">
                    <span className="text-white font-bold text-xl">WIPRO</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">Wipro</h3>
                  <p className="text-xs text-muted-foreground mb-2">IT Services</p>
                  <Badge variant="secondary" className="text-xs">3.5-8 LPA</Badge>
                </CardContent>
              </Card>
            </a>

            {/* Cognizant */}
            <a href="https://careers.cognizant.com" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full">
                <CardContent className="pt-6 text-center">
                  <div className="h-20 w-20 mx-auto mb-4 rounded-lg bg-blue-700 shadow-sm flex items-center justify-center">
                    <span className="text-white font-bold text-lg">CTS</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">Cognizant</h3>
                  <p className="text-xs text-muted-foreground mb-2">IT Services</p>
                  <Badge variant="secondary" className="text-xs">4-8 LPA</Badge>
                </CardContent>
              </Card>
            </a>

            {/* Accenture */}
            <a href="https://www.accenture.com/careers" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full">
                <CardContent className="pt-6 text-center">
                  <div className="h-20 w-20 mx-auto mb-4 rounded-lg bg-purple-600 shadow-sm flex items-center justify-center">
                    <span className="text-white font-bold text-xl">&gt;</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">Accenture</h3>
                  <p className="text-xs text-muted-foreground mb-2">Consulting</p>
                  <Badge variant="secondary" className="text-xs">4.5-9 LPA</Badge>
                </CardContent>
              </Card>
            </a>

            {/* IBM */}
            <a href="https://www.ibm.com/careers" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full">
                <CardContent className="pt-6 text-center">
                  <div className="h-20 w-20 mx-auto mb-4 rounded-lg bg-blue-800 shadow-sm flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">IBM</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">IBM</h3>
                  <p className="text-xs text-muted-foreground mb-2">Technology</p>
                  <Badge variant="secondary" className="text-xs">5-12 LPA</Badge>
                </CardContent>
              </Card>
            </a>

            {/* Oracle */}
            <a href="https://www.oracle.com/careers" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full">
                <CardContent className="pt-6 text-center">
                  <div className="h-20 w-20 mx-auto mb-4 rounded-lg bg-red-600 shadow-sm flex items-center justify-center">
                    <span className="text-white font-bold text-xl">ORACLE</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">Oracle</h3>
                  <p className="text-xs text-muted-foreground mb-2">Database & Cloud</p>
                  <Badge variant="secondary" className="text-xs">6-15 LPA</Badge>
                </CardContent>
              </Card>
            </a>

            {/* Capgemini */}
            <a href="https://www.capgemini.com/careers" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full">
                <CardContent className="pt-6 text-center">
                  <div className="h-20 w-20 mx-auto mb-4 rounded-lg bg-blue-500 shadow-sm flex items-center justify-center">
                    <span className="text-white font-bold text-lg">CGI</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">Capgemini</h3>
                  <p className="text-xs text-muted-foreground mb-2">IT Consulting</p>
                  <Badge variant="secondary" className="text-xs">4-8 LPA</Badge>
                </CardContent>
              </Card>
            </a>

            {/* HCL */}
            <a href="https://www.hcltech.com/careers" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full">
                <CardContent className="pt-6 text-center">
                  <div className="h-20 w-20 mx-auto mb-4 rounded-lg bg-blue-900 shadow-sm flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">HCL</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">HCL Tech</h3>
                  <p className="text-xs text-muted-foreground mb-2">IT Services</p>
                  <Badge variant="secondary" className="text-xs">3.5-7 LPA</Badge>
                </CardContent>
              </Card>
            </a>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-muted-foreground mb-6 font-medium">And many more companies...</p>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleViewAllPartners}
              className="border-2 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all hover:scale-105 shadow-md"
            >
              <Building2 className="h-5 w-5 mr-2" />
              View All Partners
            </Button>
          </div>
        </div>
      </section>

      {/* All Companies Modal */}
      <Dialog open={showAllCompanies} onOpenChange={setShowAllCompanies}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">All Recruiting Partners</DialogTitle>
            <DialogDescription>
              Complete list of companies partnered with us for campus recruitment
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {allCompanies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allCompanies.map((company, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="h-16 w-16 mx-auto mb-3 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg mb-1">{company.name}</h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          {company.industry || 'Technology'}
                        </p>
                        {company.packageMax && (
                          <Badge variant="secondary" className="text-xs">
                            {formatPackage(company.packageMin || 0)} - {formatPackage(company.packageMax)}
                          </Badge>
                        )}
                        {company.location && (
                          <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {company.location}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No companies available at the moment.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Recent Placements */}
      <section className="py-20 px-4 bg-gradient-to-b from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Recent Placement Highlights
            </h2>
            <p className="text-lg text-muted-foreground">Celebrating our students' success stories</p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-300 border-r-transparent"></div>
              <p className="text-muted-foreground mt-4">Loading placements...</p>
            </div>
          ) : recentPlacements.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPlacements.map((placement, index) => (
                <Card key={index} className="hover:shadow-2xl transition-all hover:scale-105 hover:-translate-y-2 border-2 hover:border-green-300 bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-950/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-300 to-emerald-300 flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-gray-800">
                          {placement.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg">{placement.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {placement.branch}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="text-sm font-semibold flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-blue-400" />
                        {placement.company}
                      </span>
                      <span className="text-lg font-bold text-green-500 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {placement.package}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No recent placements to display yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Check back soon for updates!</p>
            </div>
          )}
        </div>
      </section>



      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-blue-950/20">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-300 to-purple-300 flex items-center justify-center shadow-lg">
                <GraduationCap className="h-7 w-7 text-gray-800" />
              </div>
              <div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">PlaceHub</span>
                <p className="text-xs text-muted-foreground">Smart Campus Recruitment</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} PlaceHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
