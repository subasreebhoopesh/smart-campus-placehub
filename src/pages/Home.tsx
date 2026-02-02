import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Building2,
  Briefcase,
  TrendingUp,
  ArrowRight,
  Users,
  Award,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  { icon: Users, label: 'Total Students', value: '2,500+', color: 'text-blue-500' },
  { icon: Building2, label: 'Partner Companies', value: '150+', color: 'text-green-500' },
  { icon: Award, label: 'Students Placed', value: '1,800+', color: 'text-purple-500' },
  { icon: TrendingUp, label: 'Highest Package', value: '45 LPA', color: 'text-orange-500' },
];

const recentPlacements = [
  { name: 'Ananya Gupta', company: 'Amazon', package: '28 LPA', branch: 'CSE' },
  { name: 'Rahul Sharma', company: 'Google', package: '25 LPA', branch: 'CSE' },
  { name: 'Sneha Reddy', company: 'Microsoft', package: '22 LPA', branch: 'IT' },
  { name: 'Priya Patel', company: 'Intel', package: '18 LPA', branch: 'ECE' },
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
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">PlaceHub</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Smart Placement Management
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Streamline your campus placements with our comprehensive management system. 
            Track students, companies, drives, and analytics all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="gap-2">
                Admin Login <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="gap-2">
                Student Portal <GraduationCap className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need for Placements
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Placements */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Recent Placement Highlights
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentPlacements.map((placement, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {placement.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{placement.name}</p>
                      <p className="text-sm text-muted-foreground">{placement.branch}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{placement.company}</span>
                    <span className="text-sm font-bold text-primary">{placement.package}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join our placement management system and streamline your campus recruitment process.
          </p>
          <Link to="/login">
            <Button size="lg">
              Login Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-semibold">PlaceHub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 PlaceHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
