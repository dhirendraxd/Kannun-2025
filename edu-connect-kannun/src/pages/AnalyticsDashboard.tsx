import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  TrendingUp,
  Users,
  Eye,
  BookmarkCheck,
  Calendar,
  Target,
  Globe2,
  Award,
  Activity,
  BarChart3,
  Clock,
  MapPin
} from "lucide-react";

// Comprehensive analytics data
const generateDetailedMetrics = () => ({
  totalViews: Math.floor(Math.random() * 1500) + 3500,
  totalApplications: Math.floor(Math.random() * 75) + 180,
  savedByStudents: Math.floor(Math.random() * 30) + 40,
  conversionRate: (Math.random() * 3 + 3.5).toFixed(1),
  studentEngagement: (Math.random() * 20 + 70).toFixed(1),
  topCountries: [
    { name: "United States", applications: Math.floor(Math.random() * 50) + 80 },
    { name: "Canada", applications: Math.floor(Math.random() * 30) + 40 },
    { name: "United Kingdom", applications: Math.floor(Math.random() * 25) + 35 },
    { name: "Australia", applications: Math.floor(Math.random() * 20) + 25 },
    { name: "Germany", applications: Math.floor(Math.random() * 15) + 20 }
  ],
  programPerformance: [
    { name: "Computer Science", views: Math.floor(Math.random() * 500) + 800, applications: Math.floor(Math.random() * 30) + 50 },
    { name: "Business Administration", views: Math.floor(Math.random() * 400) + 600, applications: Math.floor(Math.random() * 25) + 35 },
    { name: "Engineering", views: Math.floor(Math.random() * 350) + 550, applications: Math.floor(Math.random() * 20) + 30 },
    { name: "Data Science", views: Math.floor(Math.random() * 300) + 450, applications: Math.floor(Math.random() * 15) + 25 }
  ],
  monthlyTrend: [
    { month: "Jan", views: Math.floor(Math.random() * 200) + 300, applications: Math.floor(Math.random() * 20) + 25 },
    { month: "Feb", views: Math.floor(Math.random() * 250) + 350, applications: Math.floor(Math.random() * 25) + 30 },
    { month: "Mar", views: Math.floor(Math.random() * 300) + 400, applications: Math.floor(Math.random() * 30) + 35 },
    { month: "Apr", views: Math.floor(Math.random() * 350) + 450, applications: Math.floor(Math.random() * 35) + 40 },
    { month: "May", views: Math.floor(Math.random() * 400) + 500, applications: Math.floor(Math.random() * 40) + 45 },
    { month: "Jun", views: Math.floor(Math.random() * 450) + 550, applications: Math.floor(Math.random() * 45) + 50 }
  ]
});

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(generateDetailedMetrics());

  // Update analytics every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(generateDetailedMetrics());
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/university-dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Live Analytics</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">University Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into student engagement and program performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="shadow-large border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold text-foreground">{metrics.totalViews.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">+18% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-large border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <p className="text-2xl font-bold text-foreground">{metrics.totalApplications}</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
              </div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">+12% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-large border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Student Engagement</p>
                  <p className="text-2xl font-bold text-foreground">{metrics.studentEngagement}%</p>
                </div>
                <div className="p-3 bg-accent/30 rounded-lg">
                  <Target className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">+5% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-large border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold text-foreground">{metrics.conversionRate}%</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">+3% this month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Program Performance */}
          <Card className="shadow-large border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-primary">
                <Award className="h-5 w-5" />
                <span>Program Performance</span>
              </CardTitle>
              <CardDescription>Views and applications by program</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.programPerformance.map((program, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg border border-secondary/20 hover:bg-secondary/10 transition-colors">
                    <div>
                      <h3 className="font-semibold text-foreground">{program.name}</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-primary flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {program.views} views
                        </span>
                        <span className="text-secondary flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {program.applications} applications
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-primary/50 text-primary">
                      {((program.applications / program.views) * 100).toFixed(1)}% conversion
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <Card className="shadow-large border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-secondary">
                <Globe2 className="h-5 w-5" />
                <span>Top Countries</span>
              </CardTitle>
              <CardDescription>Applications by country</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topCountries.map((country, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-accent/5 rounded-lg border border-accent/20 hover:bg-accent/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-accent" />
                      </div>
                      <span className="font-medium text-foreground">{country.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-secondary">{country.applications}</span>
                      <p className="text-xs text-muted-foreground">applications</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card className="shadow-large border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-primary">
              <Calendar className="h-5 w-5" />
              <span>Monthly Trends</span>
            </CardTitle>
            <CardDescription>Views and applications over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              {metrics.monthlyTrend.map((month, index) => (
                <div key={index} className="p-4 bg-secondary/5 rounded-lg border border-secondary/20 hover:bg-secondary/10 transition-colors">
                  <div className="text-center">
                    <h3 className="font-semibold text-foreground mb-2">{month.month}</h3>
                    <div className="space-y-2">
                      <div className="p-2 bg-primary/10 rounded border border-primary/20">
                        <p className="text-xs text-primary flex items-center justify-center gap-1">
                          <Eye className="h-3 w-3" />
                          Views
                        </p>
                        <p className="text-sm font-bold text-primary">{month.views}</p>
                      </div>
                      <div className="p-2 bg-secondary/10 rounded border border-secondary/20">
                        <p className="text-xs text-secondary flex items-center justify-center gap-1">
                          <Users className="h-3 w-3" />
                          Apps
                        </p>
                        <p className="text-sm font-bold text-secondary">{month.applications}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Insights */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Card className="shadow-large border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Peak Hours</h3>
                  <p className="text-sm text-muted-foreground">Most active time</p>
                </div>
              </div>
              <p className="text-xl font-bold text-primary">2-4 PM EST</p>
              <p className="text-sm text-muted-foreground mt-1">+35% activity during this window</p>
            </CardContent>
          </Card>

          <Card className="shadow-large border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <BookmarkCheck className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Save Rate</h3>
                  <p className="text-sm text-muted-foreground">Programs bookmarked</p>
                </div>
              </div>
              <p className="text-xl font-bold text-secondary">{((metrics.savedByStudents / metrics.totalViews) * 100).toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground mt-1">Students saving programs</p>
            </CardContent>
          </Card>

          <Card className="shadow-large border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Activity className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Live Status</h3>
                  <p className="text-sm text-muted-foreground">Current activity</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-medium text-foreground">
                  {Math.floor(Math.random() * 15) + 5} users browsing
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}