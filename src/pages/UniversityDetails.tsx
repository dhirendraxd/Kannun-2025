import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Building2, 
  Globe, 
  MapPin, 
  Mail, 
  Phone,
  Calendar,
  DollarSign,
  Clock,
  GraduationCap,
  BookmarkPlus,
  ExternalLink
} from "lucide-react";

interface UniversityProfile {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  website: string | null;
  logo_url: string | null;
  banner_url: string | null;
  contact_email: string | null;
  phone: string | null;
}

interface Program {
  id: string;
  title: string;
  description: string | null;
  degree_level: string | null;
  duration: string | null;
  tuition_fee: string | null;
  application_deadline: string | null;
  delivery_mode: string | null;
}

export default function UniversityDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [university, setUniversity] = useState<UniversityProfile | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) {
      loadUniversityData();
      checkIfSaved();
    }
  }, [id, user]);

  const loadUniversityData = async () => {
    try {
      // Load university profile
      const { data: uniData } = await supabase
        .from('university_profiles')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single();

      if (uniData) {
        setUniversity(uniData);
      }

      // Load university programs
      const { data: programsData } = await supabase
        .from('university_programs')
        .select('*')
        .eq('university_id', id)
        .eq('is_published', true);

      setPrograms(programsData || []);
    } catch (error) {
      console.error('Error loading university data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('student_saved_universities')
      .select('id')
      .eq('user_id', user.id)
      .eq('university_id', id)
      .maybeSingle();
    
    setIsSaved(!!data);
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save universities",
        variant: "default"
      });
      return;
    }

    try {
      if (isSaved) {
        await supabase
          .from('student_saved_universities')
          .delete()
          .eq('user_id', user.id)
          .eq('university_id', id);
        setIsSaved(false);
        toast({
          title: "University removed",
          description: "University removed from your saved list"
        });
      } else {
        await supabase
          .from('student_saved_universities')
          .insert({
            user_id: user.id,
            university_id: id
          });
        setIsSaved(true);
        toast({
          title: "University saved",
          description: "University added to your saved list"
        });
      }
    } catch (error) {
      toast({
        title: "Update",
        description: error.message,
        variant: "default"
      });
    }
  };

  const handleApply = async (programId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to apply to programs",
        variant: "default"
      });
      return;
    }

    try {
      await supabase
        .from('student_applications')
        .insert({
          user_id: user.id,
          university_id: id,
          program_id: programId,
          status: 'submitted'
        });

      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully"
      });
    } catch (error) {
      toast({
        title: "Application failed",
        description: error.message,
        variant: "default"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading university details...</p>
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">University not found</h1>
          <Link to="/universities">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Universities
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header with banner */}
      <div className="relative">
        {university.banner_url ? (
          <div className="h-64 bg-cover bg-center" style={{ backgroundImage: `url(${university.banner_url})` }}>
            <div className="absolute inset-0 bg-black/50" />
          </div>
        ) : (
          <div className="h-64 bg-gradient-to-r from-primary to-secondary">
            <div className="absolute inset-0 bg-black/30" />
          </div>
        )}
        
        <div className="absolute top-6 left-6">
          <Link to="/universities">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      <div className="container py-8 px-4">
        {/* University Info Card */}
        <Card className="shadow-medium border-border/50 -mt-20 relative z-10 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                {university.logo_url ? (
                  <img
                    src={university.logo_url}
                    alt={`${university.name} logo`}
                    className="h-20 w-20 rounded-lg object-cover border-2 border-border"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center border-2 border-border">
                    <Building2 className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{university.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                      {university.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {university.location}
                        </span>
                      )}
                      <Badge variant="outline">{programs.length} programs</Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant={isSaved ? "default" : "outline"}
                      onClick={handleSave}
                    >
                      <BookmarkPlus className="h-4 w-4 mr-2" />
                      {isSaved ? "Saved" : "Save"}
                    </Button>
                    {university.website && (
                      <a
                        href={university.website.startsWith("http") ? university.website : `https://${university.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Website
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
                
                {university.description && (
                  <p className="text-muted-foreground mt-4 leading-relaxed">
                    {university.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Programs */}
            <Card className="shadow-medium border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Academic Programs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {programs.length > 0 ? (
                  <div className="space-y-6">
                    {programs.map((program) => (
                      <Card key={program.id} className="border border-border/50">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold mb-2">{program.title}</h3>
                              {program.degree_level && (
                                <Badge variant="secondary" className="mb-2">
                                  {program.degree_level}
                                </Badge>
                              )}
                            </div>
                            <Button onClick={() => handleApply(program.id)}>
                              Apply Now
                            </Button>
                          </div>
                          
                          {program.description && (
                            <p className="text-muted-foreground mb-4">{program.description}</p>
                          )}
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            {program.duration && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{program.duration}</span>
                              </div>
                            )}
                            {program.tuition_fee && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span>{program.tuition_fee}</span>
                              </div>
                            )}
                            {program.application_deadline && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{new Date(program.application_deadline).toLocaleDateString()}</span>
                              </div>
                            )}
                            {program.delivery_mode && (
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <span>{program.delivery_mode}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No programs available at this time.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card className="shadow-medium border-border/50">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {university.contact_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`mailto:${university.contact_email}`}
                      className="text-sm hover:underline"
                    >
                      {university.contact_email}
                    </a>
                  </div>
                )}
                {university.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{university.phone}</span>
                  </div>
                )}
                {university.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={university.website.startsWith("http") ? university.website : `https://${university.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-medium border-border/50">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Programs Offered</span>
                  <Badge variant="outline">{programs.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Location</span>
                  <span className="text-sm">{university.location || "Not specified"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}