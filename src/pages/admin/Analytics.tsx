import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, Users, Building2, Award } from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.admin.getAnalytics();
      if (response.success) {
        setAnalyticsData(response.analytics);
      }
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load analytics data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analyticsData) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </DashboardLayout>
    );
  }

  const summaryStats = [
    { 
      label: 'Total Placements', 
      value: analyticsData.summary.totalPlacements.toString(), 
      icon: Award, 
      change: '+15%' 
    },
    { 
      label: 'Average Package', 
      value: `Rs.${analyticsData.summary.avgPackage} LPA`, 
      icon: TrendingUp, 
      change: '+12%' 
    },
    { 
      label: 'Companies Visited', 
      value: analyticsData.summary.companiesVisited.toString(), 
      icon: Building2, 
      change: '+8' 
    },
    { 
      label: 'Placement Rate', 
      value: `${analyticsData.summary.placementRate}%`, 
      icon: Users, 
      change: '+5%' 
    },
  ];

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Placement statistics and insights</p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summaryStats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-500">{stat.change} from last year</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Branch-wise Placement */}
          <Card>
            <CardHeader>
              <CardTitle>Branch-wise Placement Rate</CardTitle>
              <CardDescription>Placement statistics by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.branchWisePlacement}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="branch" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="placed" name="Placed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total" name="Total" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Placements Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Placement Trend</CardTitle>
              <CardDescription>Number of placements per month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.monthlyPlacements}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="placements"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Package Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Package Distribution</CardTitle>
              <CardDescription>Students by package range</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.packageDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="range"
                      label={({ range, percent }) =>
                        `${range} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {analyticsData.packageDistribution.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Recruiters */}
          <Card>
            <CardHeader>
              <CardTitle>Top Recruiting Companies</CardTitle>
              <CardDescription>Companies with most hires</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {analyticsData.topRecruiters.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analyticsData.topRecruiters}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis type="category" dataKey="company" className="text-xs" width={80} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar
                        dataKey="hires"
                        fill="hsl(var(--primary))"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No recruitment data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Year-over-Year Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Placement Statistics Summary</CardTitle>
            <CardDescription>Key metrics comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-4xl font-bold text-primary">{analyticsData.totals.eligible}</p>
                <p className="text-sm text-muted-foreground mt-1">Eligible Students</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-4xl font-bold text-green-500">{analyticsData.totals.placed}</p>
                <p className="text-sm text-muted-foreground mt-1">Students Placed</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-4xl font-bold text-orange-500">{analyticsData.totals.yetToPlace}</p>
                <p className="text-sm text-muted-foreground mt-1">Yet to be Placed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
