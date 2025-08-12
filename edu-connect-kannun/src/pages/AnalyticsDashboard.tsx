import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
              <Activity className="h-5 w-5 text-blue-600" />
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Live Analytics</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">University Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into student engagement and program performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="shadow-medium border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-300">Total Views</p>
                  <p className="text-2xl font-bold text-blue-600">{metrics.totalViews.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-300/20">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-emerald-500">+18% this month</span>
              </div>
            </CardContent>
          </Card>
