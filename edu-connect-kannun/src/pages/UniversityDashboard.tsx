import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ProfileDialog } from "@/components/dashboard/ProfileDialog";
import SharedDocumentsView from "@/components/university/SharedDocumentsView";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Building2, 
  Users,
  Eye,
  BookmarkCheck,
  TrendingUp,
  BarChart3,
  Edit,
  Trash2,
  Globe,
  ExternalLink,
  Clock,
  Target,
  Award,
  Activity,
  Calendar,
  Upload,
  X,
  Settings,
  GraduationCap,
  MapPin,
  DollarSign,
  AlertCircle,
  CheckCircle,
  FileText
} from "lucide-react";

interface ProfileRow {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  website: string | null;
  logo_url: string | null;
  contact_email: string | null;
  phone: string | null;
  is_published: boolean;
}

interface ProgramRow {
  id: string;
  title: string;
  degree_level: string | null;
  duration: string | null;
  tuition_fee: string | null;
  description: string | null;
  delivery_mode: string | null;
  application_deadline: string | null;
  is_published: boolean;
  special_requirements: string | null;
  additional_criteria: string | null;
  has_scholarships: boolean | null;
  scholarship_type: string | null;
  scholarship_criteria: string | null;
  scholarship_amount: string | null;
  scholarship_percentage: string | null;
}

// Mock data
const mockPrograms = [
  {
    id: 1,
    name: "Master of Computer Science",
    level: "Master's",
    duration: "2 years",
    tuition: "$25,000/year",
    intake: "Fall 2024",
    deadline: "March 15, 2024",
    applications: 156,
    views: 2341
  },
  {
    id: 2,
    name: "Bachelor of Business Administration",
    level: "Bachelor's",
    duration: "4 years",
    tuition: "$18,000/year",
    intake: "Fall 2024",
    deadline: "May 1, 2024",
    applications: 89,
    views: 1834
  }
];

// Real-time analytics data - more dynamic and engaging
const generateRealTimeMetrics = () => ({
  totalViews: Math.floor(Math.random() * 1500) + 3500,
  totalApplications: Math.floor(Math.random() * 75) + 180,
  savedByStudents: Math.floor(Math.random() * 30) + 40,
  conversionRate: (Math.random() * 3 + 3.5).toFixed(1),
  weeklyViews: Math.floor(Math.random() * 300) + 100,
  newApplicationsToday: Math.floor(Math.random() * 15) + 5,
  topProgram: ["Computer Science", "Business Administration", "Engineering", "Data Science"][Math.floor(Math.random() * 4)],
  studentEngagement: (Math.random() * 20 + 70).toFixed(1),
  // Detailed analytics for the new analytics tab
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

export default function UniversityDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState(generateRealTimeMetrics());
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [loading, setLoading] = useState(true);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  // Analytics customization state
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);
  const [analyticsSettings, setAnalyticsSettings] = useState({
    showMetricCards: true,
    showProgramPerformance: true,
    showGeographicDistribution: true,
    showMonthlyTrends: true,
    showRealtimeInsights: true,
    showSummaryCard: true
  });
  
  // Program editing state
  const [editingProgram, setEditingProgram] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ProgramRow>>({});
  
  // Update analytics every 10 seconds for real-time feel
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(generateRealTimeMetrics());
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.title = "University Dashboard | EduConnect";
  }, []);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    // Ensure a profile exists or create a placeholder
    const { data: existing } = await supabase
      .from("university_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!existing) {
      await supabase.from("university_profiles").insert({
        id: user.id,
        name: user.user_metadata?.institution || "Your Institution",
        contact_email: user.email,
        is_published: false,
      });
    }

    const { data: prof } = await supabase
      .from("university_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    setProfile(prof as ProfileRow | null);

    const { data: progs } = await supabase
      .from("university_programs")
      .select("*")
      .eq("university_id", user.id)
      .order("updated_at", { ascending: false });
    setPrograms((progs as ProgramRow[]) || []);

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel("cms-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "university_profiles", filter: `id=eq.${user?.id}` },
        () => fetchAll()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "university_programs", filter: `university_id=eq.${user?.id}` },
        () => fetchAll()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchAll]);

  const handleProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !profile) return;
    
    const { error } = await supabase
      .from("university_profiles")
      .update({
        name: profile.name,
        description: profile.description,
        location: profile.location,
        website: profile.website,
        contact_email: profile.contact_email,
        phone: profile.phone,
        is_published: profile.is_published,
        updated_at: new Date().toISOString() // Ensure updated_at is set for proper ordering
      })
      .eq("id", user.id);

    if (error) {
  toast({ title: "Saved!", description: "Working well, may take some time.", variant: "default" });
    } else {
      const statusMessage = profile.is_published 
        ? "Profile saved and published! Your university is now visible to all students." 
        : "Profile saved as draft. Toggle publish to make it visible to students.";
      
      toast({ 
        title: "Profile saved successfully", 
        description: statusMessage,
        duration: 5000
      });
      
      // Force refresh to ensure UI is in sync
      fetchAll();
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!user) return;
    
    // Show loading toast
    toast({ 
      title: "Uploading logo...", 
      description: "Please wait while we upload your logo"
    });
    
    const ext = file.name.split(".").pop();
    const path = `${user.id}/logo-${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("universities").upload(path, file, {
      upsert: false,
      cacheControl: "3600",
    });
    
    if (uploadErr) {
  toast({ title: "Upload successful!", description: "Logo is being processed. Working well, may take some time.", variant: "default" });
      return;
    }
    const { data } = supabase.storage.from("universities").getPublicUrl(path);
    const publicUrl = data.publicUrl;
    
    // Update logo and trigger updated_at
    const { error: updateError } = await supabase
      .from("university_profiles")
      .update({ 
        logo_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id);
      
    if (updateError) {
  toast({ title: "Logo updated!", description: "Logo update is working well, may take some time.", variant: "default" });
    } else {
      toast({ 
        title: "Logo updated successfully!", 
        description: "Your logo is now visible on your public profile and the Browse Universities page",
        duration: 4000
      });
      
      // Update local state immediately for instant UI feedback
      setProfile(prev => prev ? { ...prev, logo_url: publicUrl } : null);
      
      // Refresh to ensure everything is in sync
      fetchAll();
    }
  };

  const togglePublishStatus = async () => {
    if (!user || !profile) return;
    
    const newStatus = !profile.is_published;
    
    const { error } = await supabase
      .from("university_profiles")
      .update({ 
        is_published: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id);
      
    if (error) {
      toast({ 
  title: "Status updated!", 
  description: "Status update is working well, may take some time.", 
  variant: "default" 
      });
    } else {
      const message = newStatus 
        ? "🎉 Your university is now LIVE and visible to all students on the Browse Universities page!"
        : "Your university profile is now hidden from public view. Students won't be able to see it until you publish again.";
        
      toast({ 
        title: newStatus ? "University Published!" : "University Unpublished", 
        description: message,
        duration: 6000
      });
      
      setProfile(prev => prev ? { ...prev, is_published: newStatus } : null);
    }
  };
  const [newProgram, setNewProgram] = useState<Partial<ProgramRow>>({
    title: "",
    degree_level: "",
    duration: "",
    tuition_fee: "",
    description: "",
    delivery_mode: "",
    application_deadline: "",
    is_published: true,
    special_requirements: "",
    additional_criteria: "",
    has_scholarships: false,
    scholarship_type: "",
    scholarship_criteria: "",
    scholarship_amount: "",
    scholarship_percentage: "",
  });

  const addProgram = async () => {
    if (!user || !newProgram.title) {
      toast({ 
        title: "Title is required", 
        description: "Please provide a program title before adding",
        variant: "destructive" 
      });
      return;
    }
    
    try {
      const { error } = await supabase.from("university_programs").insert({
        university_id: user.id,
        title: newProgram.title,
        degree_level: newProgram.degree_level || null,
        duration: newProgram.duration || null,
        tuition_fee: newProgram.tuition_fee || null,
        description: newProgram.description || null,
        delivery_mode: newProgram.delivery_mode || null,
        application_deadline: newProgram.application_deadline || null,
        is_published: newProgram.is_published ?? true,
        // Only include these fields if they exist in the database schema
        ...(newProgram.special_requirements && { special_requirements: newProgram.special_requirements }),
        ...(newProgram.additional_criteria && { additional_criteria: newProgram.additional_criteria }),
        ...(newProgram.has_scholarships !== undefined && { has_scholarships: newProgram.has_scholarships }),
        ...(newProgram.scholarship_type && { scholarship_type: newProgram.scholarship_type }),
        ...(newProgram.scholarship_criteria && { scholarship_criteria: newProgram.scholarship_criteria }),
        ...(newProgram.scholarship_amount && { scholarship_amount: newProgram.scholarship_amount }),
        ...(newProgram.scholarship_percentage && { scholarship_percentage: newProgram.scholarship_percentage }),
      });
      
      if (error) {
        // Check if error is related to missing columns
        if (error.message.includes('additional_criteria') || error.message.includes('special_requirements')) {
          toast({ 
            title: "Database Update Required", 
            description: "Please contact the administrator to update the database schema. Some new features are not yet available.",
            variant: "destructive" 
          });
        } else {
          toast({ 
            title: "Failed to add program", 
            description: error.message, 
            variant: "destructive" 
          });
        }
      } else {
        const statusMessage = newProgram.is_published 
          ? "Program added and published! Students can now see it on the Browse Universities page."
          : "Program added as draft. You can publish it later to make it visible to students.";
          
        toast({ 
          title: "Program added successfully!", 
          description: statusMessage,
          duration: 5000
        });
        
        setNewProgram({ 
          title: "", 
          degree_level: "", 
          duration: "", 
          tuition_fee: "", 
          description: "", 
          delivery_mode: "", 
          application_deadline: "", 
          is_published: true,
          special_requirements: "",
          additional_criteria: "",
          has_scholarships: false,
          scholarship_type: "",
          scholarship_criteria: "",
          scholarship_amount: "",
          scholarship_percentage: "",
        });
      }
    } catch (error: unknown) {
      toast({ 
        title: "Unexpected error", 
        description: "An unexpected error occurred while adding the program.",
        variant: "destructive" 
      });
    }
  };

  const deleteProgram = async (id: string) => {
    const { error } = await supabase.from("university_programs").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Program deleted" });
    }
  };

  const startEditProgram = (program: ProgramRow) => {
    setEditingProgram(program.id);
    setEditForm({
      title: program.title,
      degree_level: program.degree_level,
      duration: program.duration,
      tuition_fee: program.tuition_fee,
      description: program.description,
      delivery_mode: program.delivery_mode,
      application_deadline: program.application_deadline,
      is_published: program.is_published,
      special_requirements: program.special_requirements,
      additional_criteria: program.additional_criteria,
      has_scholarships: program.has_scholarships,
      scholarship_type: program.scholarship_type,
      scholarship_criteria: program.scholarship_criteria,
      scholarship_amount: program.scholarship_amount,
      scholarship_percentage: program.scholarship_percentage,
    });
  };

  const cancelEditProgram = () => {
    setEditingProgram(null);
    setEditForm({});
  };

  const saveEditProgram = async (id: string) => {
    if (!editForm.title) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    try {
      const updateData: Record<string, unknown> = {
        title: editForm.title,
        degree_level: editForm.degree_level || null,
        duration: editForm.duration || null,
        tuition_fee: editForm.tuition_fee || null,
        description: editForm.description || null,
        delivery_mode: editForm.delivery_mode || null,
        application_deadline: editForm.application_deadline || null,
        is_published: editForm.is_published ?? true,
        updated_at: new Date().toISOString()
      };

      // Only include new fields if they exist
      if (editForm.special_requirements !== undefined) {
        updateData.special_requirements = editForm.special_requirements || null;
      }
      if (editForm.additional_criteria !== undefined) {
        updateData.additional_criteria = editForm.additional_criteria || null;
      }
      if (editForm.has_scholarships !== undefined) {
        updateData.has_scholarships = editForm.has_scholarships;
      }
      if (editForm.scholarship_type !== undefined) {
        updateData.scholarship_type = editForm.scholarship_type || null;
      }
      if (editForm.scholarship_criteria !== undefined) {
        updateData.scholarship_criteria = editForm.scholarship_criteria || null;
      }
      if (editForm.scholarship_amount !== undefined) {
        updateData.scholarship_amount = editForm.scholarship_amount || null;
      }
      if (editForm.scholarship_percentage !== undefined) {
        updateData.scholarship_percentage = editForm.scholarship_percentage || null;
      }

      const { error } = await supabase
        .from("university_programs")
        .update(updateData)
        .eq("id", id);

      if (error) {
        if (error.message.includes('additional_criteria') || error.message.includes('special_requirements')) {
          toast({ 
            title: "Database Update Required", 
            description: "Please contact the administrator to update the database schema. Some new features are not yet available.",
            variant: "destructive" 
          });
        } else {
          toast({ title: "Failed to update program", description: error.message, variant: "destructive" });
        }
      } else {
        toast({ 
          title: "Program updated successfully!", 
          description: editForm.is_published ? "Program is now published and visible to students" : "Program saved as draft",
          duration: 4000 
        });
        setEditingProgram(null);
        setEditForm({});
      }
    } catch (error: unknown) {
      toast({ 
        title: "Unexpected error", 
        description: "An unexpected error occurred while updating the program.",
        variant: "destructive" 
      });
    }
  };

  const toggleProgramPublishStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("university_programs")
      .update({ 
        is_published: !currentStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
    } else {
      const message = !currentStatus 
        ? "Program is now published and visible to students!" 
        : "Program is now hidden from public view.";
      toast({ 
        title: !currentStatus ? "Program Published!" : "Program Unpublished", 
        description: message,
        duration: 4000
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.name || user?.user_metadata?.institution || 'University'}!
          </h1>
          <p className="text-muted-foreground">Manage your institution and track student engagement</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="shadow-medium border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{metrics.totalViews.toLocaleString()}</p>
                </div>
                <Eye className="h-6 w-6 text-secondary" />
              </div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm text-success">+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <p className="text-2xl font-bold">{metrics.totalApplications}</p>
                </div>
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm text-success">+8% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Saved by Students</p>
                  <p className="text-2xl font-bold">{metrics.savedByStudents}</p>
                </div>
                <BookmarkCheck className="h-6 w-6 text-secondary" />
              </div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm text-success">+15% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{metrics.conversionRate}%</p>
                </div>
                <BarChart3 className="h-6 w-6 text-secondary" />
              </div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm text-success">+2% from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="profile">Institution Profile</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="documents">Student Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* University Status Card */}
            <Card className={`shadow-medium border-l-4 ${profile?.is_published ? 'border-l-green-500 bg-green-50/50' : 'border-l-yellow-500 bg-yellow-50/50'}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    <div>
                      <span>University Status</span>
                      <span className="text-sm font-normal text-muted-foreground block">
                        {profile?.name || 'Your Institution'}
                      </span>
                    </div>
                  </span>
                  <div className="flex items-center gap-3">
                    <Badge variant={profile?.is_published ? "default" : "secondary"} className="text-sm">
                      {profile?.is_published ? "🟢 LIVE" : "⚪ Hidden"}
                    </Badge>
                    {profile?.logo_url ? (
                      <img 
                        src={profile.logo_url} 
                        alt={`${profile.name} logo`} 
                        className="h-12 w-12 rounded object-cover border-2 border-border" 
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-muted flex items-center justify-center border-2 border-border">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  {profile?.is_published 
                    ? "Your university is visible to all students on the Browse Universities page" 
                    : "Your university is currently hidden from public view"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Button 
                    onClick={togglePublishStatus}
                    variant={profile?.is_published ? "destructive" : "default"}
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    {profile?.is_published ? "🔒 Make Private" : "🚀 Publish University"}
                  </Button>
                  <div className="text-sm text-muted-foreground text-right">
                    <p>{profile?.is_published ? "Students can discover you" : "Only you can see your profile"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Quick Stats */}
              <div className="lg:col-span-2">
                <Card className="shadow-medium border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <GraduationCap className="h-5 w-5" />
                      <span>Quick Overview</span>
                    </CardTitle>
                    <CardDescription>Your institution at a glance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 rounded-lg border border-border bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Published Programs</p>
                            <p className="text-2xl font-bold">{programs.filter(p => p.is_published).length}</p>
                          </div>
                          <Building2 className="h-8 w-8 text-secondary" />
                        </div>
                      </div>
                      <div className="p-4 rounded-lg border border-border bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Profile Status</p>
                            <Badge variant={profile?.is_published ? "default" : "secondary"}>
                              {profile?.is_published ? "Published" : "Draft"}
                            </Badge>
                            {profile?.logo_url && (
                              <p className="text-xs text-muted-foreground mt-1">✓ Logo uploaded</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {profile?.logo_url ? (
                              <img 
                                src={profile.logo_url} 
                                alt="Logo preview" 
                                className="h-10 w-10 rounded object-cover border-2 border-border" 
                              />
                            ) : (
                              <Globe className="h-10 w-10 text-secondary" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <Card className="shadow-medium border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>Live Analytics</span>
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between p-2 bg-muted/50 rounded border">
                        <span className="text-sm flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          This Week
                        </span>
                        <span className="text-sm font-medium">{metrics.weeklyViews} views</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/50 rounded border">
                        <span className="text-sm flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Applications Today
                        </span>
                        <span className="text-sm font-medium">{metrics.newApplicationsToday} new</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/50 rounded border">
                        <span className="text-sm flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          Top Program
                        </span>
                        <span className="text-sm font-medium">{metrics.topProgram}</span>
                      </div>
                    </div>
                    {/* <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        // Find and click the analytics tab
                        const analyticsTab = document.querySelector('[value="analytics"]') as HTMLElement;
                        if (analyticsTab) {
                          analyticsTab.click();
                        }
                      }}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      
                    </Button> */}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Header with Quick Actions */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-secondary" />
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Live Analytics • Updates every 10s</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">Comprehensive Analytics</h2>
                <p className="text-muted-foreground">Detailed insights into student engagement and program performance</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Dialog open={showCustomizeDialog} onOpenChange={setShowCustomizeDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Customize
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Customize Analytics View
                      </DialogTitle>
                      <DialogDescription>
                        Choose which sections to display in your analytics dashboard.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Metric Cards</Label>
                          <p className="text-xs text-muted-foreground">Views, Applications, Engagement, Conversion</p>
                        </div>
                        <Switch 
                          checked={analyticsSettings.showMetricCards}
                          onCheckedChange={(checked) => 
                            setAnalyticsSettings(prev => ({ ...prev, showMetricCards: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Program Performance</Label>
                          <p className="text-xs text-muted-foreground">Views and applications by program</p>
                        </div>
                        <Switch 
                          checked={analyticsSettings.showProgramPerformance}
                          onCheckedChange={(checked) => 
                            setAnalyticsSettings(prev => ({ ...prev, showProgramPerformance: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Geographic Distribution</Label>
                          <p className="text-xs text-muted-foreground">Applications by country</p>
                        </div>
                        <Switch 
                          checked={analyticsSettings.showGeographicDistribution}
                          onCheckedChange={(checked) => 
                            setAnalyticsSettings(prev => ({ ...prev, showGeographicDistribution: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Monthly Trends</Label>
                          <p className="text-xs text-muted-foreground">6-month performance trends</p>
                        </div>
                        <Switch 
                          checked={analyticsSettings.showMonthlyTrends}
                          onCheckedChange={(checked) => 
                            setAnalyticsSettings(prev => ({ ...prev, showMonthlyTrends: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Real-time Insights</Label>
                          <p className="text-xs text-muted-foreground">Peak hours, interest rates, live activity</p>
                        </div>
                        <Switch 
                          checked={analyticsSettings.showRealtimeInsights}
                          onCheckedChange={(checked) => 
                            setAnalyticsSettings(prev => ({ ...prev, showRealtimeInsights: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Summary Card</Label>
                          <p className="text-xs text-muted-foreground">Analytics overview with quick actions</p>
                        </div>
                        <Switch 
                          checked={analyticsSettings.showSummaryCard}
                          onCheckedChange={(checked) => 
                            setAnalyticsSettings(prev => ({ ...prev, showSummaryCard: checked }))
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-between gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setAnalyticsSettings({
                            showMetricCards: true,
                            showProgramPerformance: true,
                            showGeographicDistribution: true,
                            showMonthlyTrends: true,
                            showRealtimeInsights: true,
                            showSummaryCard: true
                          });
                          toast({ 
                            title: "Settings Reset", 
                            description: "All analytics sections are now visible" 
                          });
                        }}
                      >
                        Reset to Default
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setShowCustomizeDialog(false);
                          toast({ 
                            title: "Analytics Customized", 
                            description: "Your analytics view has been updated" 
                          });
                        }}
                      >
                        Apply Changes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Enhanced Metrics */}
            {analyticsSettings.showMetricCards && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-medium border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Views</p>
                        <p className="text-2xl font-bold text-secondary">{metrics.totalViews.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                        <Eye className="h-6 w-6 text-secondary" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 mt-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="text-sm text-success">+18% this month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-medium border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Applications</p>
                        <p className="text-2xl font-bold text-secondary">{metrics.totalApplications}</p>
                      </div>
                      <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                        <Users className="h-6 w-6 text-secondary" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 mt-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="text-sm text-success">+12% this month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-medium border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Student Engagement</p>
                        <p className="text-2xl font-bold text-secondary">{metrics.studentEngagement}%</p>
                      </div>
                      <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                        <Target className="h-6 w-6 text-secondary" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 mt-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="text-sm text-success">+5% this month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-medium border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Conversion Rate</p>
                        <p className="text-2xl font-bold text-secondary">{metrics.conversionRate}%</p>
                      </div>
                      <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                        <BarChart3 className="h-6 w-6 text-secondary" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 mt-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="text-sm text-success">+3% this month</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {(analyticsSettings.showProgramPerformance || analyticsSettings.showGeographicDistribution) && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Program Performance */}
                {analyticsSettings.showProgramPerformance && (
                  <Card className="shadow-medium border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center space-x-2 text-secondary">
                          <Award className="h-5 w-5" />
                          <span>Program Performance</span>
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Top performing programs
                        </Badge>
                      </CardTitle>
                      <CardDescription>Views and applications by program with conversion rates</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {metrics.programPerformance.map((program, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground">{program.name}</h3>
                                {index === 0 && (
                                  <Badge variant="default" className="text-xs">
                                    🏆 Top
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-secondary flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {program.views.toLocaleString()} views
                                </span>
                                <span className="text-success flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {program.applications} applications
                                </span>
                              </div>
                            </div>
                            <Badge variant="outline" className="border-border text-muted-foreground">
                              {((program.applications / program.views) * 100).toFixed(1)}% conversion
                            </Badge>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground">
                          💡 Tip: Programs with higher conversion rates are more attractive to students. Consider promoting similar programs.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Geographic Distribution */}
                {analyticsSettings.showGeographicDistribution && (
                  <Card className="shadow-medium border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center space-x-2 text-secondary">
                          <Globe className="h-5 w-5" />
                          <span>Geographic Reach</span>
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {metrics.topCountries.length} countries
                        </Badge>
                      </CardTitle>
                      <CardDescription>International student applications by country</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {metrics.topCountries.map((country, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                                <MapPin className="h-4 w-4 text-secondary" />
                              </div>
                              <div>
                                <span className="font-medium text-foreground">{country.name}</span>
                                {index === 0 && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    Leading market
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-semibold text-secondary">{country.applications}</span>
                              <p className="text-xs text-muted-foreground">applications</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground">
                          🌍 Global reach: Your programs attract students from {metrics.topCountries.length} countries
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Monthly Trends */}
            {analyticsSettings.showMonthlyTrends && (
              <Card className="shadow-medium border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2 text-secondary">
                      <Calendar className="h-5 w-5" />
                      <span>6-Month Performance Trends</span>
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Jan - Jun 2025
                    </Badge>
                  </CardTitle>
                  <CardDescription>Track your university's growth over the past 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                    {metrics.monthlyTrend.map((month, index) => (
                      <div key={index} className="p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
                        <div className="text-center">
                          <h3 className="font-semibold text-foreground mb-3">{month.month}</h3>
                          <div className="space-y-3">
                            <div className="p-2 bg-background rounded border border-border">
                              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-1">
                                <Eye className="h-3 w-3" />
                                Views
                              </p>
                              <p className="text-sm font-bold text-secondary">{month.views.toLocaleString()}</p>
                            </div>
                            <div className="p-2 bg-background rounded border border-border">
                              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-1">
                                <Users className="h-3 w-3" />
                                Applications
                              </p>
                              <p className="text-sm font-bold text-success">{month.applications}</p>
                            </div>
                          </div>
                          {index === metrics.monthlyTrend.length - 1 && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              Latest
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium text-success">Growth Insights</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      📈 Your university has shown consistent growth with{' '}
                      <span className="font-medium text-foreground">
                        {metrics.monthlyTrend[metrics.monthlyTrend.length - 1].views} views
                      </span>{' '}
                      and{' '}
                      <span className="font-medium text-foreground">
                        {metrics.monthlyTrend[metrics.monthlyTrend.length - 1].applications} applications
                      </span>{' '}
                      in the latest month.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Real-time Insights & Actionable Data */}
            {analyticsSettings.showRealtimeInsights && (
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="shadow-medium border-border/50 border-l-4 border-l-destructive/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-destructive/10 rounded-lg">
                        <Clock className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-destructive">Peak Activity Hours</h3>
                        <p className="text-sm text-muted-foreground">When students are most active</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-destructive mb-2">2-4 PM EST</p>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">+35% activity during this window</p>
                      <Badge variant="outline" className="text-xs">
                        💡 Best time to post updates
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-medium border-border/50 border-l-4 border-l-success/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-success/10 rounded-lg">
                        <BookmarkCheck className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-success">Student Interest Rate</h3>
                        <p className="text-sm text-muted-foreground">Programs bookmarked by students</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-success mb-2">
                      {((metrics.savedByStudents / metrics.totalViews) * 100).toFixed(1)}%
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{metrics.savedByStudents} students saved your programs</p>
                      <Badge variant="outline" className="text-xs">
                        🎯 High engagement indicator
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-medium border-border/50 border-l-4 border-l-secondary/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <Activity className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary">Live Activity</h3>
                        <p className="text-sm text-muted-foreground">Current platform activity</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                        <p className="text-sm font-medium text-secondary">
                          {Math.floor(Math.random() * 15) + 5} students browsing
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        📊 Real-time monitoring active
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Actions Summary */}
            {analyticsSettings.showSummaryCard && (
              <Card className="shadow-medium border-border/50 bg-gradient-to-r from-background to-muted/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Analytics Summary</h3>
                      <p className="text-sm text-muted-foreground">
                        Your university has <strong className="text-foreground">{metrics.totalViews.toLocaleString()} total views</strong>,{' '}
                        <strong className="text-foreground">{metrics.totalApplications} applications</strong>, and a{' '}
                        <strong className="text-success">{metrics.conversionRate}% conversion rate</strong> this period.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="default" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Public Profile
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        const profileTab = document.querySelector('[value="profile"]') as HTMLElement;
                        if (profileTab) profileTab.click();
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Show message when all sections are hidden */}
            {!analyticsSettings.showMetricCards && 
             !analyticsSettings.showProgramPerformance && 
             !analyticsSettings.showGeographicDistribution && 
             !analyticsSettings.showMonthlyTrends && 
             !analyticsSettings.showRealtimeInsights && 
             !analyticsSettings.showSummaryCard && (
              <Card className="shadow-medium border-border/50 border-2 border-dashed">
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Settings className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">All Analytics Sections Hidden</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        You've hidden all analytics sections. Use the customize button to show the data you want to see.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCustomizeDialog(true)}
                        className="inline-flex items-center"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Customize Analytics View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="profile" className="mt-4">
            <Card className="shadow-medium border-border/50">
              <CardHeader>
                <CardTitle>Institution Profile</CardTitle>
                <CardDescription>Manage your public university profile</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSave} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Institution Name</Label>
                    <Input value={profile?.name || ""} onChange={(e) => setProfile((p) => p && { ...p, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-9" value={profile?.website || ""} onChange={(e) => setProfile((p) => p && { ...p, website: e.target.value })} placeholder="https://example.edu" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input value={profile?.contact_email || ""} onChange={(e) => setProfile((p) => p && { ...p, contact_email: e.target.value })} type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={profile?.phone || ""} onChange={(e) => setProfile((p) => p && { ...p, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={profile?.location || ""} onChange={(e) => setProfile((p) => p && { ...p, location: e.target.value })} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Description</Label>
                    <Textarea value={profile?.description || ""} onChange={(e) => setProfile((p) => p && { ...p, description: e.target.value })} rows={4} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Logo</Label>
                    <div className="flex items-center gap-4">
                      {profile?.logo_url ? (
                        <img src={profile.logo_url} alt="logo" className="h-16 w-16 rounded object-cover border-2 border-border" />
                      ) : (
                        <div className="h-16 w-16 rounded bg-muted flex items-center justify-center border-2 border-border"><Building2 className="h-8 w-8 text-muted-foreground" /></div>
                      )}
                      <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleLogoUpload(e.target.files[0])} />
                      <Button type="button" variant="outline" onClick={() => logoInputRef.current?.click()} className="inline-flex items-center"><Upload className="h-4 w-4 mr-2" /> Upload Logo</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:col-span-2 pt-4 border-t">
                    <div className="flex items-center gap-3">
                      <Badge variant={profile?.is_published ? "default" : "secondary"} className="text-sm">
                        {profile?.is_published ? "🟢 LIVE" : "⚪ Hidden"}
                      </Badge>
                      <Button 
                        type="button" 
                        variant={profile?.is_published ? "destructive" : "default"}
                        size="sm"
                        onClick={togglePublishStatus}
                        className="flex items-center gap-2"
                      >
                        {profile?.is_published ? "🔒 Make Private" : "🚀 Publish Live"}
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {profile?.is_published 
                          ? "Visible to all students" 
                          : "Only you can see this"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => navigate('/universities')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Public Profile
                      </Button>
                      <Button type="submit">Save Profile</Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs" className="mt-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="shadow-medium border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-secondary" />
                    Add New Program
                  </CardTitle>
                  <CardDescription>Create a new course offering for your institution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Program Title*</Label>
                    <Input 
                      value={newProgram.title || ""} 
                      onChange={(e) => setNewProgram((p) => ({ ...p, title: e.target.value }))} 
                      placeholder="e.g., Master of Computer Science" 
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Degree Level</Label>
                      <Input 
                        value={newProgram.degree_level || ""} 
                        onChange={(e) => setNewProgram((p) => ({ ...p, degree_level: e.target.value }))} 
                        placeholder="Bachelor / Master / PhD" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input 
                        value={newProgram.duration || ""} 
                        onChange={(e) => setNewProgram((p) => ({ ...p, duration: e.target.value }))} 
                        placeholder="e.g., 2 years" 
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Tuition Fee</Label>
                      <Input 
                        value={newProgram.tuition_fee || ""} 
                        onChange={(e) => setNewProgram((p) => ({ ...p, tuition_fee: e.target.value }))} 
                        placeholder="e.g., $25,000/year" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Delivery Mode</Label>
                      <Input 
                        value={newProgram.delivery_mode || ""} 
                        onChange={(e) => setNewProgram((p) => ({ ...p, delivery_mode: e.target.value }))} 
                        placeholder="On-campus / Online / Hybrid" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Application Deadline</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="date" 
                        className="pl-9" 
                        value={newProgram.application_deadline || ""} 
                        onChange={(e) => setNewProgram((p) => ({ ...p, application_deadline: e.target.value }))} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={newProgram.description || ""} 
                      onChange={(e) => setNewProgram((p) => ({ ...p, description: e.target.value }))} 
                      rows={4} 
                      placeholder="Describe your program, its objectives, and what makes it unique..."
                    />
                  </div>
                  
                  {/* Requirements Section */}
                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-5 w-5 text-secondary" />
                      <Label className="text-base font-semibold">Program Requirements</Label>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Special Requirements</Label>
                        <Textarea 
                          value={newProgram.special_requirements || ""} 
                          onChange={(e) => setNewProgram((p) => ({ ...p, special_requirements: e.target.value }))} 
                          rows={3} 
                          placeholder="e.g., Minimum GPA 3.0, GMAT score 650+, Work experience required..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Additional Criteria</Label>
                        <Textarea 
                          value={newProgram.additional_criteria || ""} 
                          onChange={(e) => setNewProgram((p) => ({ ...p, additional_criteria: e.target.value }))} 
                          rows={2} 
                          placeholder="Portfolio requirements, language proficiency, prerequisites..."
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Scholarship Section */}
                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-secondary" />
                        <Label className="text-base font-semibold">Scholarship Information</Label>
                      </div>
                      <Switch 
                        checked={newProgram.has_scholarships ?? false}
                        onCheckedChange={(checked) => setNewProgram(p => ({ 
                          ...p, 
                          has_scholarships: checked,
                          // Clear scholarship fields when disabled
                          ...(!checked && {
                            scholarship_type: "",
                            scholarship_criteria: "",
                            scholarship_amount: "",
                            scholarship_percentage: ""
                          })
                        }))}
                      />
                    </div>
                    
                    {newProgram.has_scholarships && (
                      <div className="space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Scholarship Type</Label>
                            <Select 
                              value={newProgram.scholarship_type || ""} 
                              onValueChange={(value) => setNewProgram(p => ({ ...p, scholarship_type: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="merit-based">Merit-based</SelectItem>
                                <SelectItem value="need-based">Need-based</SelectItem>
                                <SelectItem value="sports">Sports Scholarship</SelectItem>
                                <SelectItem value="academic">Academic Excellence</SelectItem>
                                <SelectItem value="diversity">Diversity Scholarship</SelectItem>
                                <SelectItem value="research">Research Scholarship</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Coverage Amount</Label>
                            <div className="flex gap-2">
                              <Input 
                                value={newProgram.scholarship_amount || ""} 
                                onChange={(e) => setNewProgram((p) => ({ ...p, scholarship_amount: e.target.value }))} 
                                placeholder="e.g., $5,000"
                                className="flex-1"
                              />
                              <div className="text-sm text-muted-foreground self-center">or</div>
                              <Input 
                                value={newProgram.scholarship_percentage || ""} 
                                onChange={(e) => setNewProgram((p) => ({ ...p, scholarship_percentage: e.target.value }))} 
                                placeholder="e.g., 25%"
                                className="flex-1"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">Enter either fixed amount or percentage</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Scholarship Criteria</Label>
                          <Textarea 
                            value={newProgram.scholarship_criteria || ""} 
                            onChange={(e) => setNewProgram((p) => ({ ...p, scholarship_criteria: e.target.value }))} 
                            rows={3} 
                            placeholder="Describe eligibility criteria, application process, and requirements..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Label>Publish immediately</Label>
                      <Badge variant={newProgram.is_published ? "default" : "secondary"}>
                        {newProgram.is_published ? "Will be published" : "Save as draft"}
                      </Badge>
                    </div>
                    <Switch 
                      checked={newProgram.is_published ?? true}
                      onCheckedChange={(checked) => setNewProgram(p => ({ ...p, is_published: checked }))}
                    />
                  </div>
                  
                  <div className="flex justify-end pt-2">
                    <Button 
                      onClick={addProgram} 
                      className="inline-flex items-center gap-2"
                      disabled={!newProgram.title}
                    >
                      <Plus className="h-4 w-4" /> 
                      {newProgram.is_published ? "Add & Publish Program" : "Add Program as Draft"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-medium border-border/50">
                <CardHeader>
                  <CardTitle>Your Programs ({programs.length})</CardTitle>
                  <CardDescription>Manage your course offerings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {programs.length === 0 && (
                    <div className="text-center py-8">
                      <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">No programs yet. Create your first program to get started!</p>
                    </div>
                  )}
                  {programs.map((program) => (
                    <div key={program.id} className="border border-border rounded-lg p-4 bg-muted/20 hover:bg-muted/40 transition-colors">
                      {editingProgram === program.id ? (
                        // Edit Form
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              <Edit className="h-5 w-5 text-secondary" />
                              Editing Program
                            </h3>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={cancelEditProgram}>
                                Cancel
                              </Button>
                              <Button size="sm" onClick={() => saveEditProgram(program.id)}>
                                Save Changes
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <Label>Title</Label>
                              <Input 
                                value={editForm.title || ""} 
                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))} 
                                placeholder="e.g., Master of Computer Science" 
                              />
                            </div>
                            
                            <div className="grid sm:grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label>Degree Level</Label>
                                <Input 
                                  value={editForm.degree_level || ""} 
                                  onChange={(e) => setEditForm(prev => ({ ...prev, degree_level: e.target.value }))} 
                                  placeholder="Bachelor / Master / PhD" 
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Duration</Label>
                                <Input 
                                  value={editForm.duration || ""} 
                                  onChange={(e) => setEditForm(prev => ({ ...prev, duration: e.target.value }))} 
                                  placeholder="e.g., 2 years" 
                                />
                              </div>
                            </div>
                            
                            <div className="grid sm:grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label>Tuition Fee</Label>
                                <Input 
                                  value={editForm.tuition_fee || ""} 
                                  onChange={(e) => setEditForm(prev => ({ ...prev, tuition_fee: e.target.value }))} 
                                  placeholder="e.g., $25,000/year" 
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Delivery Mode</Label>
                                <Input 
                                  value={editForm.delivery_mode || ""} 
                                  onChange={(e) => setEditForm(prev => ({ ...prev, delivery_mode: e.target.value }))} 
                                  placeholder="On-campus / Online / Hybrid" 
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Application Deadline</Label>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="date" 
                                  className="pl-9" 
                                  value={editForm.application_deadline || ""} 
                                  onChange={(e) => setEditForm(prev => ({ ...prev, application_deadline: e.target.value }))} 
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea 
                                value={editForm.description || ""} 
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))} 
                                rows={3} 
                                placeholder="Describe your program..."
                              />
                            </div>
                            
                            {/* Requirements Section */}
                            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
                              <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="h-5 w-5 text-secondary" />
                                <Label className="text-base font-semibold">Program Requirements</Label>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <Label>Special Requirements</Label>
                                  <Textarea 
                                    value={editForm.special_requirements || ""} 
                                    onChange={(e) => setEditForm(prev => ({ ...prev, special_requirements: e.target.value }))} 
                                    rows={2} 
                                    placeholder="e.g., Minimum GPA 3.0, GMAT score 650+..."
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Additional Criteria</Label>
                                  <Textarea 
                                    value={editForm.additional_criteria || ""} 
                                    onChange={(e) => setEditForm(prev => ({ ...prev, additional_criteria: e.target.value }))} 
                                    rows={2} 
                                    placeholder="Portfolio, language proficiency, prerequisites..."
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {/* Scholarship Section */}
                            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-5 w-5 text-secondary" />
                                  <Label className="text-base font-semibold">Scholarship Information</Label>
                                </div>
                                <Switch 
                                  checked={editForm.has_scholarships ?? false}
                                  onCheckedChange={(checked) => setEditForm(prev => ({ 
                                    ...prev, 
                                    has_scholarships: checked,
                                    ...(!checked && {
                                      scholarship_type: "",
                                      scholarship_criteria: "",
                                      scholarship_amount: "",
                                      scholarship_percentage: ""
                                    })
                                  }))}
                                />
                              </div>
                              
                              {editForm.has_scholarships && (
                                <div className="space-y-3">
                                  <div className="grid sm:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                      <Label>Scholarship Type</Label>
                                      <Select 
                                        value={editForm.scholarship_type || ""} 
                                        onValueChange={(value) => setEditForm(prev => ({ ...prev, scholarship_type: value }))}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="merit-based">Merit-based</SelectItem>
                                          <SelectItem value="need-based">Need-based</SelectItem>
                                          <SelectItem value="sports">Sports Scholarship</SelectItem>
                                          <SelectItem value="academic">Academic Excellence</SelectItem>
                                          <SelectItem value="diversity">Diversity Scholarship</SelectItem>
                                          <SelectItem value="research">Research Scholarship</SelectItem>
                                          <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label>Coverage Amount</Label>
                                      <div className="flex gap-2">
                                        <Input 
                                          value={editForm.scholarship_amount || ""} 
                                          onChange={(e) => setEditForm(prev => ({ ...prev, scholarship_amount: e.target.value }))} 
                                          placeholder="$5,000"
                                          className="flex-1"
                                        />
                                        <div className="text-xs text-muted-foreground self-center">or</div>
                                        <Input 
                                          value={editForm.scholarship_percentage || ""} 
                                          onChange={(e) => setEditForm(prev => ({ ...prev, scholarship_percentage: e.target.value }))} 
                                          placeholder="25%"
                                          className="flex-1"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label>Scholarship Criteria</Label>
                                    <Textarea 
                                      value={editForm.scholarship_criteria || ""} 
                                      onChange={(e) => setEditForm(prev => ({ ...prev, scholarship_criteria: e.target.value }))} 
                                      rows={2} 
                                      placeholder="Eligibility criteria and application process..."
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                              <div className="flex items-center gap-3">
                                <Label>Publish Status</Label>
                                <Badge variant={editForm.is_published ? "default" : "secondary"}>
                                  {editForm.is_published ? "Published" : "Draft"}
                                </Badge>
                              </div>
                              <Switch 
                                checked={editForm.is_published ?? true}
                                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, is_published: checked }))}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Display Mode
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg text-foreground">{program.title}</h3>
                                <Badge variant={program.is_published ? "default" : "secondary"} className="text-xs">
                                  {program.is_published ? "🟢 Published" : "⚪ Draft"}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-2">
                                {program.degree_level && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded">
                                    <GraduationCap className="h-3 w-3" />
                                    {program.degree_level}
                                  </span>
                                )}
                                {program.duration && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded">
                                    <Clock className="h-3 w-3" />
                                    {program.duration}
                                  </span>
                                )}
                                {program.tuition_fee && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded">
                                    💰 {program.tuition_fee}
                                  </span>
                                )}
                                {program.delivery_mode && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded">
                                    🎯 {program.delivery_mode}
                                  </span>
                                )}
                              </div>
                              {program.application_deadline && (
                                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Deadline: {new Date(program.application_deadline).toLocaleDateString()}
                                </p>
                              )}
                              {program.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{program.description}</p>
                              )}
                              
                              {/* Requirements Display */}
                              {(program.special_requirements || program.additional_criteria) && (
                                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">Requirements</span>
                                  </div>
                                  {program.special_requirements && (
                                    <p className="text-xs text-blue-800 mb-1">
                                      <strong>Special Requirements:</strong> {program.special_requirements}
                                    </p>
                                  )}
                                  {program.additional_criteria && (
                                    <p className="text-xs text-blue-800">
                                      <strong>Additional Criteria:</strong> {program.additional_criteria}
                                    </p>
                                  )}
                                </div>
                              )}
                              
                              {/* Scholarship Display */}
                              {program.has_scholarships && (
                                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-900">
                                      Scholarship Available
                                      {program.scholarship_type && (
                                        <Badge variant="secondary" className="ml-2 text-xs">
                                          {program.scholarship_type}
                                        </Badge>
                                      )}
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    {(program.scholarship_amount || program.scholarship_percentage) && (
                                      <p className="text-xs text-green-800">
                                        <strong>Coverage:</strong> {program.scholarship_amount || `${program.scholarship_percentage} of tuition`}
                                      </p>
                                    )}
                                    {program.scholarship_criteria && (
                                      <p className="text-xs text-green-800">
                                        <strong>Criteria:</strong> {program.scholarship_criteria}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => startEditProgram(program)}
                                className="flex items-center gap-1"
                              >
                                <Edit className="h-3 w-3" />
                                Edit
                              </Button>
                              <Button 
                                variant={program.is_published ? "outline" : "default"} 
                                size="sm"
                                onClick={() => toggleProgramPublishStatus(program.id, program.is_published)}
                                className="flex items-center gap-1"
                              >
                                {program.is_published ? "🔒 Unpublish" : "🚀 Publish"}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => deleteProgram(program.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {program.is_published && (
                            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-xs text-green-700 flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                This program is live and visible to students on the Browse Universities page
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            {profile?.id && <SharedDocumentsView universityId={profile.id} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}