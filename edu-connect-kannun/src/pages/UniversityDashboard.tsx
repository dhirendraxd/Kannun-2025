import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
        variant: "destructive"
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
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleApply = async (programId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to apply to programs",
        variant: "destructive"
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
        variant: "destructive"
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
          <Link to="/browse-universities">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Universities
            </Button>
          </Link>
        </div>
      </div>
    );
  }

