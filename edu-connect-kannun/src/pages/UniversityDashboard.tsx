import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileDialog } from "@/components/dashboard/ProfileDialog";
import { useAuth } from "@/contexts/AuthContext";
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
  GraduationCap
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
  studentEngagement: (Math.random() * 20 + 70).toFixed(1)
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

  const fetchAll = async () => {
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
  };

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
  }, [user?.id]);

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
      })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile saved" });
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!user) return;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/logo-${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("universities").upload(path, file, {
      upsert: false,
      cacheControl: "3600",
    });
    if (uploadErr) {
      toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" });
      return;
    }
    const { data } = supabase.storage.from("universities").getPublicUrl(path);
    const publicUrl = data.publicUrl;
    await supabase.from("university_profiles").update({ logo_url: publicUrl }).eq("id", user.id);
    toast({ title: "Logo updated" });
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
  });

  const addProgram = async () => {
    if (!user || !newProgram.title) return;
    const { error } = await supabase.from("university_programs").insert({
      university_id: user.id,
      title: newProgram.title,
      degree_level: newProgram.degree_level,
      duration: newProgram.duration,
      tuition_fee: newProgram.tuition_fee,
      description: newProgram.description,
      delivery_mode: newProgram.delivery_mode,
      application_deadline: newProgram.application_deadline || null,
      is_published: newProgram.is_published ?? true,
    });
    if (error) {
      toast({ title: "Failed to add program", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Program added" });
      setNewProgram({ title: "", degree_level: "", duration: "", tuition_fee: "", description: "", delivery_mode: "", application_deadline: "", is_published: true });
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
            <TabsTrigger value="profile">Institution Profile</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
                          </div>
                          <Globe className="h-8 w-8 text-secondary" />
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
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/analytics')}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Full Analytics
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
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
                    <div className="flex items-center gap-3">
                      {profile?.logo_url ? (
                        <img src={profile.logo_url} alt="logo" className="h-12 w-12 rounded object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center"><Building2 className="h-5 w-5 text-muted-foreground" /></div>
                      )}
                      <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleLogoUpload(e.target.files[0])} />
                      <Button type="button" variant="outline" onClick={() => logoInputRef.current?.click()} className="inline-flex items-center"><Upload className="h-4 w-4 mr-2" /> Upload Logo</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:col-span-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{profile?.is_published ? "Published" : "Hidden"}</Badge>
                      <Button type="button" variant="ghost" onClick={() => setProfile((p) => p && { ...p, is_published: !p.is_published })}>
                        Toggle Publish
                      </Button>
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
                  <CardTitle>Add New Program</CardTitle>
                  <CardDescription>Create a new course offering</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={newProgram.title || ""} onChange={(e) => setNewProgram((p) => ({ ...p, title: e.target.value }))} placeholder="e.g., Master of Computer Science" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Degree Level</Label>
                      <Input value={newProgram.degree_level || ""} onChange={(e) => setNewProgram((p) => ({ ...p, degree_level: e.target.value }))} placeholder="Bachelor / Master / PhD" />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input value={newProgram.duration || ""} onChange={(e) => setNewProgram((p) => ({ ...p, duration: e.target.value }))} placeholder="e.g., 2 years" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Tuition Fee</Label>
                      <Input value={newProgram.tuition_fee || ""} onChange={(e) => setNewProgram((p) => ({ ...p, tuition_fee: e.target.value }))} placeholder="e.g., $25,000/year" />
                    </div>
                    <div className="space-y-2">
                      <Label>Delivery Mode</Label>
                      <Input value={newProgram.delivery_mode || ""} onChange={(e) => setNewProgram((p) => ({ ...p, delivery_mode: e.target.value }))} placeholder="On-campus / Online / Hybrid" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Application Deadline</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="date" className="pl-9" value={newProgram.application_deadline || ""} onChange={(e) => setNewProgram((p) => ({ ...p, application_deadline: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={newProgram.description || ""} onChange={(e) => setNewProgram((p) => ({ ...p, description: e.target.value }))} rows={4} />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={addProgram} className="inline-flex items-center"><Plus className="h-4 w-4 mr-2" /> Add Program</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-medium border-border/50">
                <CardHeader>
                  <CardTitle>Your Programs</CardTitle>
                  <CardDescription>Manage your course offerings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {programs.length === 0 && <p className="text-sm text-muted-foreground">No programs yet.</p>}
                  {programs.map((p) => (
                    <div key={p.id} className="p-4 rounded-lg border flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{p.title}</div>
                        <Button variant="ghost" size="icon" onClick={() => deleteProgram(p.id)}><X className="h-4 w-4" /></Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {[p.degree_level, p.duration, p.tuition_fee].filter(Boolean).join(" • ")}
                      </div>
                      <Badge variant="outline">{p.is_published ? "Published" : "Hidden"}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}