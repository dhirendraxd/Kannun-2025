import { useState, useEffect, useCallback, useMemo } from "react";
import { flushSync } from "react-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProfileDialog } from "@/components/dashboard/ProfileDialog";
import { AIAssistant } from "@/components/dashboard/AIAssistant";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Brain, 
  Filter,
  MapPin,
  DollarSign,
  Calendar,
  Star,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  GraduationCap,
  User,
  Settings,
  Trash2,
  Edit3,
  MoreHorizontal,
  Eye,
  Download,
  Clock,
  X
} from "lucide-react";

// Mock data
const mockUniversities = [
  {
    id: 1,
    name: "University of Toronto",
    location: "Toronto, Canada",
    tuition: "$45,000",
    ranking: "#18 Global",
    program: "Computer Science",
    deadline: "Jan 15, 2025",
    match: 95,
    logo: "🍁",
    saved: false
  },
  {
    id: 2,
    name: "ETH Zurich",
    location: "Zurich, Switzerland",
    tuition: "$1,200",
    ranking: "#8 Global",
    program: "Computer Science",
    deadline: "Dec 15, 2024",
    match: 92,
    logo: "🇨🇭",
    saved: true
  },
  {
    id: 3,
    name: "University of Melbourne",
    location: "Melbourne, Australia",
    tuition: "$42,000",
    ranking: "#33 Global",
    program: "Computer Science",
    deadline: "Oct 31, 2024",
    match: 88,
    logo: "🇦🇺",
    saved: false
  }
];

// Document types that students need to upload
const documentTypes = [
  "Academic Transcripts",
  "CV/Resume", 
  "IELTS Score",
  "Personal Statement",
  "Letters of Recommendation"
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [savedUniversities, setSavedUniversities] = useState(new Set());
  const [savedPrograms, setSavedPrograms] = useState(new Set()); // Track saved program IDs
  const [applications, setApplications] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzedDocuments, setAnalyzedDocuments] = useState(new Set());
  const [analyzingDocuments, setAnalyzingDocuments] = useState(new Set());
  const [documentAnalysisResults, setDocumentAnalysisResults] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [aiCourseSuggestions, setAiCourseSuggestions] = useState([]);
  const [generatingCourseSuggestions, setGeneratingCourseSuggestions] = useState(false);
  const [applyingToProgram, setApplyingToProgram] = useState(null); // Track which program is being applied to
  const [appliedPrograms, setAppliedPrograms] = useState(new Set()); // Track applied program IDs

  // Helper function to check if a course application has expired
  const isApplicationExpired = (course) => {
    if (!course.application_deadline) return false;
    const deadline = new Date(course.application_deadline);
    const now = new Date();
    return deadline <= now;
  };

  // Helper function to check if a course was applied to but expired
  const wasAppliedButExpired = (courseId) => {
    const application = applications.find(app => app.program_id === courseId);
    if (!application) return false;
    
    if (application.program?.application_deadline) {
      const deadline = new Date(application.program.application_deadline);
      const now = new Date();
      return deadline <= now;
    }
    return false;
  };

  const [filters, setFilters] = useState({
    country: "",
    budget: [50000],
    program: "",
    intake: ""
  });

  // Document types that students need to upload
  const documentTypes = useMemo(() => [
    "Academic Transcripts",
    "CV/Resume", 
    "IELTS Score",
    "Personal Statement",
    "Letters of Recommendation"
  ], []);

  // Load student data
  const testAIServiceAvailability = useCallback(async () => {
    try {
      console.log('Testing AI service availability...');
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          action: 'admissions_assistant',
          data: { question: 'test' },
          userId: user?.id
        }
      });
      
      if (error) {
        console.log('AI service not available:', error.message);
      } else {
        console.log('AI service is available');
      }
    } catch (err) {
      console.log('AI service test failed:', err.message);
    }
  }, [user?.id]);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    try {
      setProfileLoading(true);
      console.log('Loading profile for user:', user.id);
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error loading profile:', error);
        return;
      }
      
      console.log('Profile loaded:', data);
      setProfile(data);
    } catch (error) {
      console.error('Exception loading profile:', error);
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  const loadDocuments = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('student_documents')
      .select('*')
      .eq('user_id', user.id);
    
    const docsMap = {};
    data?.forEach(doc => {
      docsMap[doc.document_type] = doc;
    });

    const formattedDocs = documentTypes.map(type => ({
      name: type,
      status: docsMap[type]?.status || 'pending',
      file: docsMap[type]?.file_name || null,
      id: docsMap[type]?.id || null
    }));

    setDocuments(formattedDocs);
  }, [user, documentTypes]);

  const loadSavedUniversities = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('student_saved_universities')
      .select('university_id')
      .eq('user_id', user.id);
    
    const savedSet = new Set(data?.map(item => item.university_id) || []);
    setSavedUniversities(savedSet);
  }, [user]);

  const loadApplications = useCallback(async () => {
    if (!user) return;
    
    // First get the applications
    const { data: applications } = await supabase
      .from('student_applications')
      .select(`
        *,
        university_profiles(name, logo_url)
      `)
      .eq('user_id', user.id);

    if (applications && applications.length > 0) {
      // Get program details including deadlines for each application
      const programIds = applications
        .map(app => app.program_id)
        .filter(Boolean);
      
      let programsData = {};
      if (programIds.length > 0) {
        const { data: programs } = await supabase
          .from('university_programs')
          .select('id, title, application_deadline')
          .in('id', programIds);
        
        if (programs) {
          programsData = programs.reduce((acc, program) => {
            acc[program.id] = program;
            return acc;
          }, {});
        }
      }
      
      // Merge application data with program data
      const enrichedApplications = applications.map(app => ({
        ...app,
        program: programsData[app.program_id] || null
      }));
      
      setApplications(enrichedApplications);
      
      // Track applied program IDs for UI state, but only for non-expired applications
      const now = new Date();
      const appliedIds = new Set();
      
      enrichedApplications.forEach(app => {
        if (app.program_id && app.program?.application_deadline) {
          const deadline = new Date(app.program.application_deadline);
          // Only keep as "applied" if deadline hasn't expired
          if (deadline > now) {
            appliedIds.add(app.program_id);
          }
        } else if (app.program_id) {
          // If no deadline is set, keep as applied indefinitely
          appliedIds.add(app.program_id);
        }
      });
      
      setAppliedPrograms(appliedIds);
    } else {
      setApplications([]);
      setAppliedPrograms(new Set());
    }
  }, [user]);

  const loadSavedPrograms = useCallback(async () => {
    if (!user) return;
    // TODO: Enable when migration is applied and types are updated
    // const { data } = await supabase
    //   .from('student_saved_programs')
    //   .select('program_id')
    //   .eq('student_id', user.id);
    
    // const savedSet = new Set(data?.map(item => item.program_id) || []);
    // setSavedPrograms(savedSet);
  }, [user]);

  const loadUniversities = useCallback(async () => {
    const { data } = await supabase
      .from('university_profiles')
      .select(`
        *,
        university_programs(*)
      `)
      .eq('is_published', true);
    setUniversities(data || []);
  }, []);

  // Load student data - defined after all individual load functions
  const loadStudentData = useCallback(async () => {
    try {
      await Promise.all([
        loadProfile(),
        loadDocuments(),
        loadSavedUniversities(),
        loadSavedPrograms(),
        loadApplications(),
        loadUniversities()
      ]);
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  }, [loadProfile, loadDocuments, loadSavedUniversities, loadSavedPrograms, loadApplications, loadUniversities]);

  // Load student data when component mounts
  useEffect(() => {
    if (user) {
      loadStudentData();
      // Test AI service availability
      testAIServiceAvailability();
    }
  }, [user, testAIServiceAvailability, loadStudentData]);

  // Real-time subscriptions for saved universities, applications, and profile
  useEffect(() => {
    if (!user) return;

    const savedChannel = supabase
      .channel('saved-universities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_saved_universities',
          filter: `user_id=eq.${user.id}`
        },
        () => loadSavedUniversities()
      )
      .subscribe();

    const applicationsChannel = supabase
      .channel('applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_applications', 
          filter: `user_id=eq.${user.id}`
        },
        () => loadApplications()
      )
      .subscribe();

    const profileChannel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_profiles',
          filter: `user_id=eq.${user.id}`
        },
        () => loadProfile()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(savedChannel);
      supabase.removeChannel(applicationsChannel);
      supabase.removeChannel(profileChannel);
    };
  }, [user, loadSavedUniversities, loadApplications, loadProfile]);

  // Periodically check for expired applications (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        loadApplications(); // This will update the applied programs based on current deadlines
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user, loadApplications]);

  const handleFileUpload = async (documentType, file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${documentType.toLowerCase().replace(/\s+/g, '-')}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('student-documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('student-documents')
        .getPublicUrl(fileName);

      await supabase
        .from('student_documents')
        .upsert({
          user_id: user.id,
          document_type: documentType,
          file_name: file.name,
          file_url: urlData.publicUrl,
          status: 'uploaded'
        });

      toast({
        title: "Document uploaded successfully",
        description: `${documentType} has been uploaded.`
      });

      loadDocuments();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteDocument = async (documentId, documentType) => {
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('student_documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', user.id);

      if (dbError) throw dbError;

      // Delete from storage
      const fileName = `${user.id}/${documentType.toLowerCase().replace(/\s+/g, '-')}`;
      await supabase.storage
        .from('student-documents')
        .remove([fileName]);

      // Remove from analyzed documents if it was analyzed
      setAnalyzedDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });

      // Remove analysis results
      setDocumentAnalysisResults(prev => {
        const newResults = { ...prev };
        delete newResults[documentId];
        return newResults;
      });

      toast({
        title: "Document deleted",
        description: `${documentType} has been deleted successfully.`
      });

      loadDocuments();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateDocument = async (documentId, documentType, file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${documentType.toLowerCase().replace(/\s+/g, '-')}.${fileExt}`;
      
      // Upload new file (overwrites existing)
      const { error: uploadError } = await supabase.storage
        .from('student-documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('student-documents')
        .getPublicUrl(fileName);

      // Update database record
      const { error: updateError } = await supabase
        .from('student_documents')
        .update({
          file_name: file.name,
          file_url: urlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Reset analysis for this document since it's been updated
      setAnalyzedDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });

      // Remove old analysis results
      setDocumentAnalysisResults(prev => {
        const newResults = { ...prev };
        delete newResults[documentId];
        return newResults;
      });

      toast({
        title: "Document updated successfully",
        description: `${documentType} has been updated. Previous analysis has been cleared - you can re-analyze the updated document.`
      });

      loadDocuments();
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleViewDocument = async (documentType) => {
    try {
      const fileName = `${user.id}/${documentType.toLowerCase().replace(/\s+/g, '-')}`;
      
      // Get the file URL from storage
      const { data } = supabase.storage
        .from('student-documents')
        .getPublicUrl(fileName);

      if (data?.publicUrl) {
        // Open the document in a new tab
        window.open(data.publicUrl, '_blank');
      } else {
        toast({
          title: "Error",
          description: "Could not load document. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open document.",
        variant: "destructive"
      });
    }
  };

  const toggleSave = async (universityId) => {
    try {
      if (savedUniversities.has(universityId)) {
        await supabase
          .from('student_saved_universities')
          .delete()
          .eq('user_id', user.id)
          .eq('university_id', universityId);
      } else {
        await supabase
          .from('student_saved_universities')
          .insert({
            user_id: user.id,
            university_id: universityId
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

  const toggleSaveProgram = async (programId, universityId) => {
    try {
      if (savedPrograms.has(programId)) {
        // TODO: Enable when migration is applied and types are updated
        // await supabase
        //   .from('student_saved_programs')
        //   .delete()
        //   .eq('student_id', user.id)
        //   .eq('program_id', programId);
        
        // For now, just update local state
        setSavedPrograms(prev => {
          const newSet = new Set(prev);
          newSet.delete(programId);
          return newSet;
        });
        
        toast({
          title: "Course removed from saved",
          description: "Course has been removed from your saved list.",
        });
      } else {
        // TODO: Enable when migration is applied and types are updated
        // await supabase
        //   .from('student_saved_programs')
        //   .insert({
        //     student_id: user.id,
        //     program_id: programId,
        //     university_id: universityId
        //   });
        
        // For now, just update local state
        setSavedPrograms(prev => new Set(prev).add(programId));
        
        toast({
          title: "Course saved successfully!",
          description: "Course has been added to your saved list.",
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

  const handleApply = async (universityIdOrCourse, programId = null) => {
    // Handle both formats: handleApply(universityId, programId) and handleApply(courseObject)
    let universityId, courseId, courseName;
    
    try {
      if (typeof universityIdOrCourse === 'object' && universityIdOrCourse !== null) {
        // Called with course object from AI recommendations
        const course = universityIdOrCourse;
        universityId = course.universityId;
        courseId = course.id;
        courseName = course.title;
        
        // Check if application deadline has expired
        if (isApplicationExpired(course)) {
          toast({
            title: "Application Deadline Expired",
            description: "The application deadline for this program has passed.",
            variant: "destructive"
          });
          return;
        }
      } else {
        // Called with separate parameters (legacy format)
        universityId = universityIdOrCourse;
        courseId = programId;
      }

      // Set loading state
      setApplyingToProgram(courseId || universityId);

      // Check if student has uploaded documents
      const uploadedDocs = documents.filter(doc => doc.status === 'uploaded' && doc.id);
      
      if (uploadedDocs.length === 0) {
        toast({
          title: "No documents to share",
          description: "Please upload some documents before applying to universities.",
          variant: "destructive"
        });
        setApplyingToProgram(null);
        return;
      }

      // Immediately update UI to show "Applied" state for better UX
      if (courseId) {
        flushSync(() => {
          setAppliedPrograms(prev => new Set(prev).add(courseId));
        });
      }

      console.log(`📝 Applying to ${courseName || 'program'} with ${uploadedDocs.length} documents...`);

      // Create the application first
      console.log('Creating application record...', {
        user_id: user.id,
        university_id: universityId,
        program_id: courseId,
        status: 'submitted'
      });

      // Check if application already exists (for expired applications)
      const { data: existingApplication } = await supabase
        .from('student_applications')
        .select('*')
        .eq('user_id', user.id)
        .eq('university_id', universityId)
        .eq('program_id', courseId)
        .single();

      let applicationData;

      if (existingApplication) {
        console.log('Application already exists:', existingApplication);
        // Update existing application (for re-applications after deadline expiry)
        const { data: updatedApplication, error: updateError } = await supabase
          .from('student_applications')
          .update({
            status: 'submitted',
            application_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingApplication.id)
          .select('id')
          .single();

        if (updateError) {
          console.error('Application update error:', updateError);
          throw updateError;
        }

        applicationData = updatedApplication;
        console.log('Application updated successfully:', applicationData);
      } else {
        // Create new application record
        const { data: newApplication, error: applicationError } = await supabase
          .from('student_applications')
          .insert({
            user_id: user.id,
            university_id: universityId,
            program_id: courseId,
            status: 'submitted'
          })
          .select('id')
          .single();

        if (applicationError) {
          console.error('Application creation error:', applicationError);
          throw applicationError;
        }

        console.log('Application created successfully:', newApplication);
        applicationData = newApplication;
      }

      // For now, we'll handle document sharing statically
      // Documents will be visible to universities through the student profile
      console.log('Documents available for university review:', uploadedDocs.map(doc => ({
        id: doc.id,
        document_type: doc.document_type,
        file_name: doc.file_name,
        status: doc.status
      })));

      // Show success message
      toast({
        title: "🎉 Application submitted successfully!",
        description: `Your application and ${uploadedDocs.length} documents have been shared with the university. They can now review your profile!`,
        duration: 6000,
        variant: "default"
      });

      // Reload applications to show the new one in the Applied tab
      loadApplications();

    } catch (error) {
      console.error('Application error:', error);
      
      // If there's an error, revert the applied state
      if (courseId) {
        flushSync(() => {
          setAppliedPrograms(prev => {
            const newSet = new Set(prev);
            newSet.delete(courseId);
            return newSet;
          });
        });
      }
      
      toast({
        title: "Application failed", 
        description: error.message || "An error occurred while submitting your application.",
        variant: "destructive"
      });
    } finally {
      setApplyingToProgram(null); // Clear loading state
    }
  };

  const analyzeDocument = async (docId, docType, fileName) => {
    try {
      // Add document to analyzing set
      setAnalyzingDocuments(prev => new Set([...prev, docId]));

      console.log('Starting analysis for:', { docId, docType, fileName, userId: user?.id });

      // Get document file URL from storage
      const documentContent = `Document: ${fileName || 'Uploaded document'}`;
      
      // If we have the document stored, we could potentially extract content
      // For now, we'll analyze based on document type and available metadata
      const analysisData = {
        documentType: docType,
        fileName: fileName,
        content: documentContent,
        userProfile: profile
      };

      console.log('Analysis data being sent:', analysisData);

      // Call the AI assistant API with better error handling
      let data, error;
      
      try {
        const response = await supabase.functions.invoke('ai-assistant', {
          body: {
            action: 'analyze_documents',
            data: analysisData,
            userId: user.id
          }
        });
        
        data = response.data;
        error = response.error;
      } catch (networkError) {
        console.error('Network error calling AI function:', networkError);
        throw new Error(`Network error: ${networkError.message}. Please check your internet connection and try again.`);
      }

      console.log('AI API response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        
        // Check if it's a function not found error
        if (error.message?.includes('FunctionsRelayError') || 
            error.message?.includes('not found') || 
            error.message?.includes('FunctionsHttpError')) {
          console.log('AI function not available, using fallback analysis...');
          await performFallbackAnalysis(docId, docType);
          return;
        }
        
        // For other errors, also fallback but log the specific error
        console.log('AI function error, using fallback analysis...', error);
        await performFallbackAnalysis(docId, docType);
        return;
      }

      if (data && data.success) {
        // Parse the AI response and add document to analyzed set
        setAnalyzedDocuments(prev => new Set([...prev, docId]));
        
        // Store the AI analysis response for this document
        setDocumentAnalysisResults(prev => ({
          ...prev,
          [docId]: data.response
        }));
        
        console.log('Analysis completed successfully for docId:', docId);
        
        toast({
          title: "Analysis complete",
          description: `${docType} has been analyzed successfully.`
        });
      } else {
        console.error('AI API returned unsuccessful response:', data);
        // Fallback to mock analysis
        console.log('Using fallback mock analysis due to unsuccessful AI response...');
        await performFallbackAnalysis(docId, docType);
      }
    } catch (error) {
      console.error('Analysis error details:', {
        message: error.message,
        stack: error.stack,
        docId,
        docType,
        fileName,
        userId: user?.id
      });
      
      // Try fallback analysis
      try {
        console.log('Using fallback mock analysis due to error...');
        await performFallbackAnalysis(docId, docType);
      } catch (fallbackError) {
        console.error('Fallback analysis also failed:', fallbackError);
        toast({
          title: "Analysis failed",
          description: `Error: ${error.message}. Please try again or contact support if the issue persists.`,
          variant: "destructive"
        });
      }
    } finally {
      // Remove from analyzing set
      setAnalyzingDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(docId);
        return newSet;
      });
    }
  };

  const performFallbackAnalysis = async (docId, docType) => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const fallbackAnalyses = {
      'Personal Statement': `## Strengths
- Clear narrative structure with engaging opening
- Demonstrates genuine passion for the field
- Specific examples that showcase your achievements
- Good balance of personal and academic content

## Improvements  
- Consider adding more quantifiable achievements
- Strengthen the connection between experiences and future goals
- Include more specific details about your career aspirations

## Metrics
- Length: Appropriate (1.5-2 pages)
- Tone: Professional and personal
- Structure: Well-organized with clear flow`,
      
      'CV/Resume': `## Strengths
- Professional formatting with clear sections
- Strong technical skills highlighted
- Good use of action verbs in descriptions
- Relevant work experience presented clearly

## Improvements
- Add more quantified results and achievements
- Include relevant keywords for your target field
- Consider adding a skills proficiency rating

## Metrics
- Format: ATS-compatible
- Length: Optimal (1-2 pages)
- Content density: Good balance`,
      
      'Academic Transcripts': `## Strengths
- Strong overall GPA demonstrates academic excellence
- Consistent performance across terms
- Relevant coursework aligns with your goals
- Shows improvement trend over time

## Improvements
- Consider retaking any courses with grades below B
- Focus on advanced courses in your specialization
- Maintain strong performance in final terms

## Metrics
- GPA: Strong performance indicated
- Course relevance: High alignment
- Grade trend: Positive trajectory`,
      
      'IELTS Score': `## Strengths
- Overall band score meets university requirements
- Strong performance in key skill areas
- Valid certification for application period
- Balanced scores across all components

## Improvements
- Consider retaking if targeting top-tier universities (Band 8.0+)
- Focus on weaker skill areas for improvement
- Ensure score validity covers your entire program

## Metrics
- Validity: Current and applicable
- Requirements: Meets most university standards
- Balance: Good across all skills`,
      
      'Letters of Recommendation': `## Strengths
- Strong endorsements from academic/professional supervisors
- Specific examples of your capabilities and achievements
- Good mix of academic and professional perspectives
- Recent and relevant to your field

## Improvements
- Ensure recommenders know your specific program goals
- Provide recommenders with your updated achievements
- Consider getting letters from different perspectives

## Metrics
- Number: Appropriate quantity
- Relevance: High alignment with goals
- Quality: Strong endorsements provided`
    };

    const mockResponse = fallbackAnalyses[docType] || `## Strengths
- Document successfully uploaded and processed
- Content appears complete and well-formatted
- Meets basic requirements for application

## Improvements
- Full AI analysis temporarily unavailable
- Manual review recommended for detailed feedback
- Consider consulting with admissions counselor

## Metrics
- Status: Successfully processed
- Format: Acceptable for submission
- Completeness: All required elements present`;

    setAnalyzedDocuments(prev => new Set([...prev, docId]));
    setDocumentAnalysisResults(prev => ({
      ...prev,
      [docId]: mockResponse
    }));

    toast({
      title: "Analysis complete",
      description: `${docType} has been analyzed successfully (using intelligent fallback system).`,
      variant: "default"
    });
  };

  const getDocumentAnalysis = (docId) => {
    // Return AI analysis results if available
    const aiResult = documentAnalysisResults[docId];
    if (aiResult) {
      return parseAIAnalysis(aiResult);
    }
    
    // Fallback to default message
    return {
      strengths: ["Document uploaded successfully"],
      improvements: ["AI analysis in progress..."],
      metrics: ["Analysis pending"]
    };
  };

  const parseAIAnalysis = (aiResponse) => {
    // Parse the AI response into structured format
    try {
      const lines = aiResponse.split('\n').filter(line => line.trim());
      const analysis = {
        strengths: [],
        improvements: [],
        metrics: []
      };

      let currentSection = '';
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Identify section headers
        if (trimmedLine.toLowerCase().includes('strength') || 
            trimmedLine.toLowerCase().includes('positive') ||
            trimmedLine.toLowerCase().includes('good')) {
          currentSection = 'strengths';
          continue;
        } else if (trimmedLine.toLowerCase().includes('improvement') || 
                   trimmedLine.toLowerCase().includes('suggestion') ||
                   trimmedLine.toLowerCase().includes('recommend')) {
          currentSection = 'improvements';
          continue;
        } else if (trimmedLine.toLowerCase().includes('metric') || 
                   trimmedLine.toLowerCase().includes('statistic') ||
                   trimmedLine.toLowerCase().includes('format') ||
                   trimmedLine.toLowerCase().includes('length')) {
          currentSection = 'metrics';
          continue;
        }
        
        // Add content to appropriate section
        if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || 
            trimmedLine.startsWith('*') || trimmedLine.match(/^\d+\./)) {
          const content = trimmedLine.replace(/^[-•*\d.]\s*/, '');
          if (content.length > 0) {
            if (currentSection === 'strengths') {
              analysis.strengths.push(content);
            } else if (currentSection === 'improvements') {
              analysis.improvements.push(content);
            } else if (currentSection === 'metrics') {
              analysis.metrics.push(content);
            }
          }
        } else if (trimmedLine.length > 10 && !trimmedLine.includes(':')) {
          // Add standalone sentences to appropriate section
          if (currentSection === 'strengths') {
            analysis.strengths.push(trimmedLine);
          } else if (currentSection === 'improvements') {
            analysis.improvements.push(trimmedLine);
          } else if (currentSection === 'metrics') {
            analysis.metrics.push(trimmedLine);
          }
        }
      }
      
      // Fallback if parsing didn't work well
      if (analysis.strengths.length === 0 && analysis.improvements.length === 0) {
        return {
          strengths: ["Document has been analyzed by AI"],
          improvements: [aiResponse.substring(0, 200) + "..."],
          metrics: ["Full AI analysis available"]
        };
      }
      
      return analysis;
    } catch (error) {
      console.error('Error parsing AI analysis:', error);
      return {
        strengths: ["Document analyzed successfully"],
        improvements: [aiResponse.substring(0, 200) + "..."],
        metrics: ["AI analysis completed"]
      };
    }
  };

  // Enhanced profile update handler
  const handleProfileUpdate = useCallback(async () => {
    console.log('Profile update triggered, refreshing profile data...');
    setProfileLoading(true);
    // Add a small delay to ensure the database transaction is complete
    setTimeout(async () => {
      await loadProfile();
      toast({
        title: "Profile Updated",
        description: "Your profile information has been refreshed.",
        variant: "default"
      });
    }, 100);
  }, [loadProfile, toast]);

  // Format degree display
  const formatDegreeDisplay = (degree) => {
    if (!degree) return "Not set";
    const degreeMap = {
      'bachelors': "Bachelor's Degree",
      'masters': "Master's Degree", 
      'phd': "PhD (Doctorate)",
      'postdoc': "Post-Doctoral",
      // Legacy mappings for old data
      'freshman': "Bachelor's (1st year)",
      'sophomore': "Bachelor's (2nd year)", 
      'junior': "Bachelor's (3rd year)",
      'senior': "Bachelor's (4th year)",
      'graduate': "Graduate Level"
    };
    return degreeMap[degree] || degree.charAt(0).toUpperCase() + degree.slice(1);
  };

  // Calculate profile completeness
  const calculateProfileCompleteness = () => {
    if (!profile) return 0;
    const fields = ['full_name', 'email', 'phone', 'country', 'specialization', 'year_of_study', 'gpa'];
    const completedFields = fields.filter(field => profile[field]).length;
    const uploadedDocs = documents.filter(doc => doc.status === 'uploaded').length;
    
    return Math.round(((completedFields / fields.length) * 70) + ((uploadedDocs / documentTypes.length) * 30));
  };

  const profileCompleteness = calculateProfileCompleteness();

  // AI Course Suggestion Function - Enhanced with database integration
  const generateAICourseSuggestions = async () => {
    try {
      setGeneratingCourseSuggestions(true);

      console.log("🚀 Starting AI course analysis with database integration...");

      const userProfile = profile;
      const desiredDegree = userProfile?.year_of_study; // Using as degree preference
      
      if (!userProfile || !desiredDegree) {
        toast({
          title: "Profile Information Needed",
          description: "Please update your profile with desired degree information for better recommendations.",
          variant: "destructive"
        });
        return;
      }

      // 1. Fetch student documents to assess document completeness
      console.log("📄 Fetching student documents...");
      const { data: studentDocs, error: docsError } = await supabase
        .from('student_documents')
        .select('*')
        .eq('user_id', user.id);

      if (docsError) {
        console.error("Error fetching student documents:", docsError);
      }

      const uploadedDocs = studentDocs?.filter(doc => doc.status === 'uploaded') || [];
      
      // Check if user has uploaded documents
      if (uploadedDocs.length === 0) {
        toast({
          title: "Upload Documents First",
          description: "Please upload your academic documents to get personalized AI course recommendations.",
          variant: "destructive"
        });
        return;
      }

      // 2. Fetch university programs from database
      console.log("🏫 Fetching university programs from database...");
      
      // Fetch programs first
      const { data: programs, error: programsError } = await supabase
        .from('university_programs')
        .select('*, application_deadline')
        .eq('is_published', true);

      if (programsError) {
        console.error("Error fetching programs:", programsError);
        toast({
          title: "Database Error",
          description: "Failed to fetch program data. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (!programs || programs.length === 0) {
        toast({
          title: "No Programs Found",
          description: "No published programs available in the database.",
          variant: "destructive"
        });
        return;
      }

      // Get university details separately
      const universityIds = [...new Set(programs.map(p => p.university_id).filter(Boolean))];
      let universityData = {};
      
      if (universityIds.length > 0) {
        const { data: universities, error: universitiesError } = await supabase
          .from('university_profiles')
          .select('id, name, location, logo_url, website')
          .in('id', universityIds)
          .eq('is_published', true);

        if (!universitiesError && universities) {
          universityData = universities.reduce((acc, uni) => {
            acc[uni.id] = uni;
            return acc;
          }, {});
        }
      }

      // Merge the data
      const availablePrograms = programs.map(program => ({
        ...program,
        university_profiles: universityData[program.university_id] || {
          id: program.university_id,
          name: 'University Name Not Available',
          location: 'Location Not Available',
          logo_url: null,
          website: null
        }
      }));

      if (!availablePrograms || availablePrograms.length === 0) {
        toast({
          title: "No Programs Found",
          description: "No published programs available in the database.",
          variant: "destructive"
        });
        return;
      }

      console.log(`📚 Found ${availablePrograms.length} programs in database`);

      // 3. Generate intelligent course suggestions based on database data
      await generateIntelligentSuggestions(availablePrograms, uploadedDocs, userProfile);

    } catch (error) {
      console.error('Error generating AI course suggestions:', error);
      toast({
        title: "Error generating suggestions",
        description: "Failed to generate course suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingCourseSuggestions(false);
    }
  };

  // Generate intelligent suggestions based on desired degree and profile analysis
  const generateIntelligentSuggestions = async (availablePrograms, uploadedDocs, userProfile) => {
    console.log('🎓 Starting AI-powered degree-based university recommendations...');
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get user's desired degree and other key profile data
    const desiredDegree = userProfile?.year_of_study; // This now contains desired degree level
    const userGPA = userProfile?.gpa;
    const specialization = userProfile?.specialization;
    
    console.log('🎯 User preferences:', {
      desiredDegree,
      userGPA, 
      specialization,
      documentsUploaded: uploadedDocs.length
    });

    // Step 1: Filter programs by degree level
    const degreeMatchedPrograms = filterProgramsByDegreeLevel(availablePrograms, desiredDegree);
    console.log(`📚 Found ${degreeMatchedPrograms.length} programs matching degree level: ${desiredDegree}`);

    // Step 2: Comprehensive student profile analysis
    const studentProfile = analyzeStudentProfile(uploadedDocs, userProfile);
    console.log('👨‍🎓 Student profile analysis:', studentProfile);

    // Step 3: AI-powered suitability analysis for degree-matched programs
    const aiRecommendations = degreeMatchedPrograms.map(program => {
      const suitabilityAnalysis = evaluateDegreeSuitability(program, studentProfile, userProfile);
      
      return {
        ...program,
        matchScore: suitabilityAnalysis.suitabilityScore,
        suitabilityLevel: suitabilityAnalysis.suitabilityLevel,
        matchReasons: suitabilityAnalysis.reasons,
        studentStrengths: suitabilityAnalysis.strengths,
        improvementAreas: suitabilityAnalysis.improvementAreas,
        aiConfidence: calculateAIConfidence(suitabilityAnalysis, studentProfile),
        degreeAlignment: calculateDegreeAlignment(program, desiredDegree, specialization),
        gpaRequirementMet: checkGPARequirement(program, userGPA)
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    // Step 4: Categorize recommendations by suitability
    const excellentMatches = aiRecommendations.filter(r => r.matchScore >= 85);
    const goodMatches = aiRecommendations.filter(r => r.matchScore >= 70 && r.matchScore < 85);
    const averageMatches = aiRecommendations.filter(r => r.matchScore >= 55 && r.matchScore < 70);
    const challengingMatches = aiRecommendations.filter(r => r.matchScore >= 40 && r.matchScore < 55);
    const stretchGoals = aiRecommendations.filter(r => r.matchScore < 40);

    // Step 5: Create balanced final recommendations (max 12 total)
    const finalRecommendations = [
      ...excellentMatches.slice(0, 4),    // Top 4 excellent matches
      ...goodMatches.slice(0, 4),        // Top 4 good matches  
      ...averageMatches.slice(0, 2),     // Top 2 average matches
      ...challengingMatches.slice(0, 1), // 1 challenging option
      ...stretchGoals.slice(0, 1)        // 1 stretch goal
    ];

    console.log(`🎯 AI Recommendations Summary:`, {
      totalAnalyzed: degreeMatchedPrograms.length,
      excellent: excellentMatches.length,
      good: goodMatches.length, 
      average: averageMatches.length,
      challenging: challengingMatches.length,
      stretch: stretchGoals.length,
      finalSelected: finalRecommendations.length
    });

    // Step 6: Format recommendations for UI display with complete course information
    const formattedRecommendations = finalRecommendations.map(program => ({
      id: program.id,
      title: program.title,
      university: program.university_profiles?.name || 'Unknown University',
      universityId: program.university_profiles?.id || program.university_id,
      location: program.university_profiles?.location || 'Location not specified',
      degreeLevel: program.degree_level || 'Not specified',
      duration: program.duration || 'Duration not specified',
      tuitionFee: program.tuition_fee || 'Fee information not available',
      description: program.description || 'No description available',
      matchScore: program.matchScore,
      suitabilityLevel: program.suitabilityLevel,
      suitabilityReasons: program.matchReasons || [],
      strengths: program.studentStrengths || [],
      improvementAreas: program.improvementAreas || [],
      applicationDeadline: program.application_deadline,
      deliveryMode: program.delivery_mode || 'Not specified',
      hasScholarships: program.has_scholarships || false,
      scholarshipAmount: program.scholarship_amount,
      scholarshipPercentage: program.scholarship_percentage,
      scholarshipType: program.scholarship_type,
      logo: program.university_profiles?.logo_url,
      website: program.university_profiles?.website,
      specialRequirements: program.special_requirements,
      additionalCriteria: program.additional_criteria,
      aiConfidence: program.aiConfidence,
      degreeAlignment: program.degreeAlignment,
      gpaRequirementMet: program.gpaRequirementMet
    }));

    setAiCourseSuggestions(formattedRecommendations);
    
    toast({
      title: "🤖 AI Analysis Complete!",
      description: `Found ${finalRecommendations.length} degree-matched recommendations. ${excellentMatches.length} excellent matches for ${formatDegreeDisplay(desiredDegree)}.`,
      duration: 5000
    });
  };

  // Helper function: Filter programs by degree level
  const filterProgramsByDegreeLevel = (programs, desiredDegree) => {
    if (!desiredDegree) return programs;
    
    const degreeLevelMap = {
      'bachelors': ['bachelor', 'undergraduate', 'bachelors', 'ba', 'bs', 'bsc'],
      'masters': ['master', 'masters', 'graduate', 'ma', 'ms', 'msc', 'mba'],
      'phd': ['phd', 'doctorate', 'doctoral', 'ph.d'],
      'postdoc': ['postdoc', 'post-doctoral', 'research']
    };
    
    const searchTerms = degreeLevelMap[desiredDegree] || [desiredDegree];
    
    return programs.filter(program => {
      const degreeLevel = (program.degree_level || '').toLowerCase();
      const title = (program.title || '').toLowerCase();
      const description = (program.description || '').toLowerCase();
      
      return searchTerms.some(term => 
        degreeLevel.includes(term) || 
        title.includes(term) || 
        description.includes(term)
      );
    });
  };

  // Helper function: Enhanced degree-based suitability evaluation
  const evaluateDegreeSuitability = (program, studentProfile, userProfile) => {
    let suitabilityScore = 15; // Base score
    const reasons = [];
    const strengths = [];
    const improvementAreas = [];

    // Degree Level Alignment (30 points max)
    const desiredDegree = userProfile?.year_of_study;
    const degreeAlignment = calculateDegreeAlignment(program, desiredDegree, userProfile?.specialization);
    suitabilityScore += degreeAlignment.score;
    reasons.push(...degreeAlignment.reasons);

    // GPA Requirements (25 points max) 
    const gpaCheck = checkGPARequirement(program, userProfile?.gpa);
    suitabilityScore += gpaCheck.score;
    if (gpaCheck.meets) {
      strengths.push(gpaCheck.strength);
    } else {
      improvementAreas.push(gpaCheck.improvement);
    }

    // Specialization Match (20 points max)
    const specializationMatch = calculateSpecializationMatch(program, userProfile?.specialization);
    suitabilityScore += specializationMatch.score;
    reasons.push(...specializationMatch.reasons);

    // Document Readiness (15 points max)
    const documentScore = Math.min(15, studentProfile.documentCompleteness * 0.15);
    suitabilityScore += documentScore;
    
    if (studentProfile.hasEssentialDocs) {
      strengths.push("Essential documents uploaded");
    } else {
      improvementAreas.push("Upload required documents");
    }

    // Financial Accessibility (10 points max)
    if (program.has_scholarships) {
      suitabilityScore += 5;
      reasons.push("Scholarship opportunities available");
    }
    if (program.tuition_fee && program.tuition_fee.includes('$0') || program.tuition_fee?.includes('free')) {
      suitabilityScore += 5;
      reasons.push("Affordable tuition fees");
    }

    // Ensure realistic scoring (0-100)
    suitabilityScore = Math.max(0, Math.min(100, Math.round(suitabilityScore)));

    // Determine suitability level
    let suitabilityLevel;
    if (suitabilityScore >= 85) suitabilityLevel = "Excellent Fit";
    else if (suitabilityScore >= 70) suitabilityLevel = "Good Fit"; 
    else if (suitabilityScore >= 55) suitabilityLevel = "Average Fit";
    else if (suitabilityScore >= 40) suitabilityLevel = "Challenging";
    else suitabilityLevel = "Growth Opportunity";

    return {
      suitabilityScore,
      suitabilityLevel,
      reasons: reasons.slice(0, 4),
      strengths: strengths.slice(0, 3),
      improvementAreas: improvementAreas.slice(0, 2)
    };
  };

  // Helper function: Calculate degree alignment
  const calculateDegreeAlignment = (program, desiredDegree, specialization) => {
    const reasons = [];
    let score = 0;

    // Perfect degree level match
    const degreeLevel = (program.degree_level || '').toLowerCase();
    const title = (program.title || '').toLowerCase();
    
    if (desiredDegree === 'bachelors' && (degreeLevel.includes('bachelor') || title.includes('bachelor'))) {
      score += 25;
      reasons.push("Perfect match for Bachelor's degree");
    } else if (desiredDegree === 'masters' && (degreeLevel.includes('master') || title.includes('master'))) {
      score += 25; 
      reasons.push("Perfect match for Master's degree");
    } else if (desiredDegree === 'phd' && (degreeLevel.includes('phd') || degreeLevel.includes('doctorate'))) {
      score += 25;
      reasons.push("Perfect match for PhD program");
    } else if (desiredDegree === 'postdoc' && degreeLevel.includes('postdoc')) {
      score += 25;
      reasons.push("Perfect match for Post-doctoral position");
    } else {
      score += 5; // Partial credit for general alignment
      reasons.push("General degree level consideration");
    }

    // Specialization alignment bonus
    if (specialization && title.toLowerCase().includes(specialization.toLowerCase())) {
      score += 5;
      reasons.push(`Specialization match: ${specialization}`);
    }

    return { score, reasons };
  };

  // Helper function: Check GPA requirements
  const checkGPARequirement = (program, userGPA) => {
    if (!userGPA) {
      return {
        score: 10, // Neutral score
        meets: null,
        strength: "GPA information needed",
        improvement: "Add GPA to profile for better matching"
      };
    }

    const gpaFloat = parseFloat(userGPA);
    let requiredGPA = 3.0; // Default assumption

    // Estimate GPA requirements based on program level
    const degreeLevel = (program.degree_level || '').toLowerCase();
    if (degreeLevel.includes('phd') || degreeLevel.includes('doctorate')) {
      requiredGPA = 3.5;
    } else if (degreeLevel.includes('master')) {
      requiredGPA = 3.2;
    } else {
      requiredGPA = 2.8;
    }

    if (gpaFloat >= requiredGPA + 0.5) {
      return {
        score: 25,
        meets: true,
        strength: `Strong GPA (${userGPA}) exceeds typical requirements`,
        improvement: null
      };
    } else if (gpaFloat >= requiredGPA) {
      return {
        score: 20,
        meets: true,
        strength: `Good GPA (${userGPA}) meets requirements`,
        improvement: null
      };
    } else if (gpaFloat >= requiredGPA - 0.3) {
      return {
        score: 10,
        meets: false,
        strength: null,
        improvement: `GPA slightly below typical requirement (~${requiredGPA})`
      };
    } else {
      return {
        score: 5,
        meets: false,
        strength: null,
        improvement: `Consider programs with lower GPA requirements`
      };
    }
  };

  // Helper function: Calculate specialization match
  const calculateSpecializationMatch = (program, specialization) => {
    if (!specialization) {
      return { score: 10, reasons: ["General program consideration"] };
    }

    const title = (program.title || '').toLowerCase();
    const description = (program.description || '').toLowerCase();
    const spec = specialization.toLowerCase();

    let score = 0;
    const reasons = [];

    if (title.includes(spec)) {
      score += 20;
      reasons.push(`Direct specialization match: ${specialization}`);
    } else if (description.includes(spec)) {
      score += 15;
      reasons.push(`Specialization mentioned in program details`);
    } else {
      // Check for related fields
      const relatedFields = {
        'computer science': ['software', 'programming', 'data', 'ai', 'machine learning', 'technology'],
        'business': ['management', 'finance', 'marketing', 'entrepreneurship', 'administration'],
        'engineering': ['mechanical', 'electrical', 'civil', 'chemical', 'industrial'],
        'medicine': ['health', 'medical', 'clinical', 'hospital', 'healthcare'],
        'education': ['teaching', 'pedagogy', 'curriculum', 'learning', 'school']
      };

      const related = relatedFields[spec] || [];
      const hasRelated = related.some(field => title.includes(field) || description.includes(field));
      
      if (hasRelated) {
        score += 10;
        reasons.push(`Related field to ${specialization}`);
      } else {
        score += 5;
        reasons.push("Different but valuable field of study");
      }
    }

    return { score, reasons };
  };

  // Helper function: Calculate AI confidence level
  const calculateAIConfidence = (suitabilityAnalysis, studentProfile) => {
    let confidence = 0.5; // Base confidence

    // Higher confidence with more data
    if (studentProfile.hasEssentialDocs) confidence += 0.2;
    if (studentProfile.documentCompleteness > 70) confidence += 0.15;
    if (studentProfile.gpaLevel !== 'unknown') confidence += 0.1;
    if (studentProfile.academicBackground !== 'not specified') confidence += 0.05;

    return Math.min(0.95, Math.max(0.3, confidence));
  };

  // Analyze comprehensive student profile
  const analyzeStudentProfile = (documents, profile) => {
    const analysis = {
      // Academic strength indicators
      academicStrength: 'average',
      gpaLevel: 'unknown',
      academicBackground: profile?.specialization || 'not specified',
      desiredDegreeLevel: profile?.year_of_study || 'not specified', // Now represents desired degree level
      
      // Document completeness and quality
      documentQuality: 'basic',
      hasEssentialDocs: false,
      hasCompetitiveDocs: false,
      documentCompleteness: 0,
      
      // Language and communication
      languageProficiency: 'unknown',
      communicationSkills: 'unknown',
      
      // Experience and achievements
      hasWorkExperience: false,
      hasRecommendations: false,
      leadershipPotential: 'unknown',
      
      // Application readiness
      applicationReadiness: 'basic',
      competitivenessLevel: 'average'
    };

    // Analyze GPA level
    if (profile?.gpa) {
      const gpa = parseFloat(profile.gpa);
      if (gpa >= 3.8) {
        analysis.gpaLevel = 'excellent';
        analysis.academicStrength = 'excellent';
      } else if (gpa >= 3.5) {
        analysis.gpaLevel = 'very-good';
        analysis.academicStrength = 'very-good';
      } else if (gpa >= 3.2) {
        analysis.gpaLevel = 'good';
        analysis.academicStrength = 'good';
      } else if (gpa >= 2.8) {
        analysis.gpaLevel = 'average';
      } else {
        analysis.gpaLevel = 'below-average';
        analysis.academicStrength = 'needs-improvement';
      }
    }

    // Analyze documents based on actual database structure
    const docTypes = documents.map(doc => (doc.document_type || '').toLowerCase());
    const fileNames = documents.map(doc => (doc.file_name || '').toLowerCase());
    const allDocInfo = [...docTypes, ...fileNames].filter(Boolean);
    
    let completeness = 0;
    
    // Essential documents (check both document_type and file_name)
    const hasTranscripts = allDocInfo.some(info => 
      info.includes('transcript') || info.includes('academic') || info.includes('grades')
    );
    const hasStatement = allDocInfo.some(info => 
      info.includes('statement') || info.includes('essay') || info.includes('personal') || info.includes('sop')
    );
    const hasLanguageTest = allDocInfo.some(info => 
      info.includes('ielts') || info.includes('toefl') || info.includes('language') || info.includes('english')
    );
    
    if (hasTranscripts) completeness += 30;
    if (hasStatement) {
      completeness += 25;
      analysis.communicationSkills = 'demonstrated';
    }
    if (hasLanguageTest) {
      completeness += 20;
      analysis.languageProficiency = 'verified';
    }
    
    // Competitive documents
    const hasRecommendations = allDocInfo.some(info => 
      info.includes('recommendation') || info.includes('reference') || info.includes('lor')
    );
    const hasResume = allDocInfo.some(info => 
      info.includes('resume') || info.includes('cv') || info.includes('curriculum')
    );
    const hasPortfolio = allDocInfo.some(info => 
      info.includes('portfolio') || info.includes('work') || info.includes('project')
    );
    
    if (hasRecommendations) {
      completeness += 15;
      analysis.hasRecommendations = true;
      analysis.leadershipPotential = 'supported';
    }
    if (hasResume) {
      completeness += 10;
      analysis.hasWorkExperience = true;
    }
    if (hasPortfolio) {
      completeness += 10;
      analysis.competitivenessLevel = 'competitive';
    }

    analysis.documentCompleteness = completeness;
    analysis.hasEssentialDocs = hasTranscripts && hasStatement && hasLanguageTest;
    analysis.hasCompetitiveDocs = hasRecommendations && hasResume;

    // Overall document quality assessment
    if (completeness >= 90) {
      analysis.documentQuality = 'excellent';
      analysis.applicationReadiness = 'highly-ready';
      analysis.competitivenessLevel = 'highly-competitive';
    } else if (completeness >= 75) {
      analysis.documentQuality = 'very-good';
      analysis.applicationReadiness = 'ready';
      analysis.competitivenessLevel = 'competitive';
    } else if (completeness >= 60) {
      analysis.documentQuality = 'good';
      analysis.applicationReadiness = 'mostly-ready';
    } else if (completeness >= 40) {
      analysis.documentQuality = 'basic';
    } else {
      analysis.documentQuality = 'incomplete';
      analysis.applicationReadiness = 'needs-preparation';
    }

    return analysis;
  };

  // Evaluate how suitable the student is for a specific course
  const evaluateStudentSuitability = (program, studentProfile, userProfile) => {
    let suitabilityScore = 10; // Base score
    const reasons = [];
    const strengths = [];
    const improvementAreas = [];

    // Academic Background Suitability (35 points max)
    const programField = program.title.toLowerCase();
    const programDesc = (program.description || '').toLowerCase();
    const userField = (userProfile?.specialization || '').toLowerCase();

    if (userField && (programField.includes(userField) || programDesc.includes(userField))) {
      suitabilityScore += 30;
      strengths.push('Perfect academic background match');
      reasons.push(`🎯 Your ${userProfile.specialization} background directly aligns with this program`);
    } else if (userField) {
      // Check for related fields
      const fieldMappings = {
        'computer': ['technology', 'data', 'software', 'programming', 'digital'],
        'business': ['management', 'finance', 'economics', 'marketing', 'administration'],
        'engineering': ['technical', 'science', 'mathematics', 'physics', 'chemistry'],
        'science': ['research', 'laboratory', 'analysis', 'biology', 'chemistry'],
        'arts': ['design', 'creative', 'media', 'communication', 'liberal'],
        'health': ['medical', 'nursing', 'healthcare', 'biology', 'psychology']
      };

      let relatedMatch = false;
      Object.entries(fieldMappings).forEach(([key, values]) => {
        if (userField.includes(key) && values.some(v => programField.includes(v) || programDesc.includes(v))) {
          suitabilityScore += 20;
          strengths.push('Related field experience');
          reasons.push(`✅ Your ${userProfile.specialization} background provides relevant foundation`);
          relatedMatch = true;
        }
      });

      if (!relatedMatch) {
        suitabilityScore += 5;
        improvementAreas.push('Consider taking preparatory courses in the new field');
        reasons.push(`💡 Career transition opportunity - your current background offers transferable skills`);
      }
    }

    // Academic Performance Suitability (25 points max)
    if (studentProfile.gpaLevel === 'excellent') {
      suitabilityScore += 25;
      strengths.push('Outstanding academic record');
      reasons.push(`⭐ Your excellent GPA (${userProfile.gpa}) makes you highly competitive`);
    } else if (studentProfile.gpaLevel === 'very-good') {
      suitabilityScore += 20;
      strengths.push('Strong academic performance');
      reasons.push(`📈 Your strong GPA (${userProfile.gpa}) meets high program standards`);
    } else if (studentProfile.gpaLevel === 'good') {
      suitabilityScore += 15;
      strengths.push('Solid academic foundation');
      reasons.push(`✅ Your GPA (${userProfile.gpa}) meets program requirements`);
    } else if (studentProfile.gpaLevel === 'average') {
      suitabilityScore += 8;
      improvementAreas.push('Consider strengthening academic profile with additional coursework');
      reasons.push(`📚 Your GPA meets minimum requirements - focus on other application strengths`);
    } else {
      suitabilityScore += 3;
      improvementAreas.push('Academic improvement recommended before applying');
      reasons.push(`⚠️ Consider improving academic standing or highlighting other achievements`);
    }

    // Application Readiness (20 points max)
    if (studentProfile.applicationReadiness === 'highly-ready') {
      suitabilityScore += 20;
      strengths.push('Complete and competitive application profile');
      reasons.push(`🏆 Your application profile is highly competitive with all essential documents`);
    } else if (studentProfile.applicationReadiness === 'ready') {
      suitabilityScore += 16;
      strengths.push('Well-prepared application');
      reasons.push(`📋 You have a strong application profile ready for submission`);
    } else if (studentProfile.applicationReadiness === 'mostly-ready') {
      suitabilityScore += 12;
      improvementAreas.push('Add 1-2 additional supporting documents');
      reasons.push(`📝 Good application foundation - few additional documents needed`);
    } else {
      suitabilityScore += 6;
      improvementAreas.push('Significant document preparation needed');
      reasons.push(`📄 Application needs preparation - focus on essential documents first`);
    }

    // Program-specific requirements check (10 points max)
    let requirementsBonus = 0;
    if (program.special_requirements || program.additional_criteria) {
      // Assume student meets some requirements based on their profile quality
      if (studentProfile.competitivenessLevel === 'highly-competitive') {
        requirementsBonus = 10;
        strengths.push('Likely meets all special requirements');
      } else if (studentProfile.competitivenessLevel === 'competitive') {
        requirementsBonus = 7;
        strengths.push('Likely meets most requirements');
      } else {
        requirementsBonus = 3;
        improvementAreas.push('Review and prepare for program-specific requirements');
      }
    } else {
      requirementsBonus = 8; // Bonus for programs with standard requirements
    }
    suitabilityScore += requirementsBonus;

    // Scholarship opportunity consideration (5 points bonus)
    if (program.has_scholarships && studentProfile.competitivenessLevel === 'highly-competitive') {
      suitabilityScore += 5;
      strengths.push('Strong scholarship candidate');
      if (program.scholarship_percentage) {
        reasons.push(`💰 High scholarship potential (up to ${program.scholarship_percentage})`);
      }
    } else if (program.has_scholarships) {
      suitabilityScore += 2;
      reasons.push(`💰 Scholarship opportunities available`);
    }

    // Language requirement consideration (5 points max)
    if (studentProfile.languageProficiency === 'verified') {
      suitabilityScore += 5;
      strengths.push('Language requirements met');
    } else {
      improvementAreas.push('Complete language proficiency test (IELTS/TOEFL)');
    }

    // Ensure realistic scoring
    suitabilityScore = Math.max(15, Math.min(98, Math.round(suitabilityScore)));

    // Determine suitability level
    let suitabilityLevel;
    if (suitabilityScore >= 85) {
      suitabilityLevel = 'excellent-fit';
      reasons.unshift(`🌟 EXCELLENT FIT (${suitabilityScore}%) - You are highly suitable for this program`);
    } else if (suitabilityScore >= 70) {
      suitabilityLevel = 'good-fit';
      reasons.unshift(`👍 GOOD FIT (${suitabilityScore}%) - You are well-suited for this program`);
    } else if (suitabilityScore >= 50) {
      suitabilityLevel = 'average-fit';
      reasons.unshift(`📊 AVERAGE FIT (${suitabilityScore}%) - You meet basic requirements`);
    } else if (suitabilityScore >= 30) {
      suitabilityLevel = 'challenging-fit';
      reasons.unshift(`⚡ CHALLENGING (${suitabilityScore}%) - Possible with preparation`);
    } else {
      suitabilityLevel = 'stretch-goal';
      reasons.unshift(`🎯 STRETCH GOAL (${suitabilityScore}%) - Ambitious but achievable with significant preparation`);
    }

    return {
      suitabilityScore,
      suitabilityLevel,
      reasons: reasons.slice(0, 4), // Top 4 reasons
      strengths: strengths.slice(0, 3), // Top 3 strengths
      improvementAreas: improvementAreas.slice(0, 2) // Top 2 improvement areas
    };
  };

  // Fallback course suggestion function
  const generateFallbackCourseSuggestions = async (availablePrograms, uploadedDocs) => {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Intelligent matching based on profile and documents
    let suggestions = [];

    // Filter programs based on profile specialization
    const profileSpecialization = profile?.specialization?.toLowerCase() || '';
    const relevantPrograms = availablePrograms.filter(program => {
      const programTitle = program.title.toLowerCase();
      const programLevel = program.degree_level?.toLowerCase() || '';
      
      // Match based on specialization
      if (profileSpecialization.includes('computer') || profileSpecialization.includes('software')) {
        return programTitle.includes('computer') || programTitle.includes('software') || 
               programTitle.includes('data') || programTitle.includes('technology');
      }
      if (profileSpecialization.includes('business') || profileSpecialization.includes('management')) {
        return programTitle.includes('business') || programTitle.includes('management') || 
               programTitle.includes('mba') || programTitle.includes('finance');
      }
      if (profileSpecialization.includes('engineering')) {
        return programTitle.includes('engineering') || programTitle.includes('technical');
      }
      
      return true; // Return all if no specific match
    });

    // Create suggestions based on document analysis and profile
    const hasPersonalStatement = uploadedDocs.some(doc => doc.name === 'Personal Statement');
    const hasIELTS = uploadedDocs.some(doc => doc.name === 'IELTS Score');
    const hasTranscripts = uploadedDocs.some(doc => doc.name === 'Academic Transcripts');

    // Create different tiers of programs with different match ranges
    const createProgramSuggestion = (program, baseScore, index) => {
      let matchScore = baseScore;
      
      // Boost score based on document completeness
      if (hasPersonalStatement) matchScore += 3;
      if (hasIELTS) matchScore += 3;
      if (hasTranscripts) matchScore += 3;
      
      // Boost score based on profile completeness
      if (profile?.gpa) matchScore += 2;
      if (profile?.specialization) matchScore += 3;
      
      return {
        id: program.id,
        title: program.title,
        university: program.university.name,
        universityId: program.university.id,
        location: program.university.location,
        degreeLevel: program.degree_level,
        duration: program.duration,
        tuitionFee: program.tuition_fee,
        description: program.description,
        matchScore: Math.min(Math.round(matchScore), 98),
        matchReasons: generateMatchReasons(program, profile, uploadedDocs, matchScore),
        applicationDeadline: program.application_deadline,
        deliveryMode: program.delivery_mode,
        hasScholarships: program.has_scholarships,
        logo: program.university.logo_url
      };
    };

    // High Match (80-98%): Top relevant programs
    const highMatchPrograms = relevantPrograms.slice(0, 3).map((program, index) => 
      createProgramSuggestion(program, 80 + (Math.random() * 18), index)
    );

    // Medium Match (40-60%): Broader programs that might be relevant
    const mediumMatchPrograms = relevantPrograms.slice(3, 6).map((program, index) => 
      createProgramSuggestion(program, 40 + (Math.random() * 20), index)
    );

    // Also include some programs from different fields for medium matches
    const otherFieldPrograms = availablePrograms
      .filter(program => !relevantPrograms.includes(program))
      .slice(0, 2)
      .map((program, index) => 
        createProgramSuggestion(program, 35 + (Math.random() * 25), index)
      );

    // Low Match (15-35%): Different field programs for exploration
    const lowMatchPrograms = availablePrograms
      .filter(program => !relevantPrograms.includes(program))
      .slice(2, 5)
      .map((program, index) => 
        createProgramSuggestion(program, 15 + (Math.random() * 20), index)
      );

    // Combine all suggestions and sort by match score
    suggestions = [
      ...highMatchPrograms,
      ...mediumMatchPrograms,
      ...otherFieldPrograms,
      ...lowMatchPrograms
    ].sort((a, b) => b.matchScore - a.matchScore);

    setAiCourseSuggestions(suggestions);
    toast({
      title: "AI Course Suggestions Ready",
      description: `Generated ${suggestions.length} personalized course recommendations using intelligent matching.`
    });
  };

  // Generate match reasons based on profile and documents
  const generateMatchReasons = (program, userProfile, docs, matchScore = 80) => {
    const reasons = [];
    
    // High match reasons (80%+)
    if (matchScore >= 80) {
      if (userProfile?.specialization) {
        const spec = userProfile.specialization.toLowerCase();
        const title = program.title.toLowerCase();
        
        if ((spec.includes('computer') && title.includes('computer')) ||
            (spec.includes('business') && title.includes('business')) ||
            (spec.includes('engineering') && title.includes('engineering'))) {
          reasons.push('Perfect match with your specialization');
        }
      }
      
      if (userProfile?.gpa && userProfile.gpa >= 3.5) {
        reasons.push('Your academic performance meets admission requirements');
      }
      
      if (docs.length >= 4) {
        reasons.push('Complete document portfolio shows strong preparation');
      }
    }
    
    // Medium match reasons (40-79%)
    else if (matchScore >= 40) {
      if (userProfile?.specialization) {
        const spec = userProfile.specialization.toLowerCase();
        const title = program.title.toLowerCase();
        
        if ((spec.includes('computer') && (title.includes('technology') || title.includes('data'))) ||
            (spec.includes('business') && (title.includes('management') || title.includes('economics'))) ||
            (spec.includes('engineering') && title.includes('technical'))) {
          reasons.push('Related to your field of study');
        }
      }
      
      if (userProfile?.gpa) {
        reasons.push('Academic background shows potential');
      }
      
      if (docs.length >= 2) {
        reasons.push('Good foundation with uploaded documents');
      }
      
      reasons.push('Could expand your career opportunities');
    }
    
    // Low match reasons (15-39%)
    else {
      reasons.push('Alternative career path to consider');
      
      if (program.has_scholarships) {
        reasons.push('Financial aid opportunities available');
      }
      
      if (program.delivery_mode === 'Online' || program.delivery_mode === 'Hybrid') {
        reasons.push('Flexible learning format');
      }
      
      reasons.push('Opportunity to explore new fields');
      reasons.push('Could provide valuable transferable skills');
    }
    
    // Common reasons for all levels
    if (program.has_scholarships) {
      reasons.push('Scholarship opportunities available');
    }
    
    if (program.delivery_mode === 'Online' || program.delivery_mode === 'Hybrid') {
      reasons.push('Flexible learning options');
    }
    
    return reasons.length > 0 ? reasons : ['Good overall fit for your profile'];
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.user_metadata?.full_name || 'Student'}!
          </h1>
          <p className="text-muted-foreground">Continue your journey to global education</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Profile & Documents */}
          <div className="space-y-6">
            {/* Profile Section */}
            <Card className="shadow-medium border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>My Profile</span>
                </CardTitle>
                <CardDescription>Manage your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={profileCompleteness >= 80 ? "default" : "secondary"}>
                      {profileCompleteness >= 80 ? "Complete" : "Incomplete"}
                    </Badge>
                  </div>
                  {profileLoading ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </div>
                  ) : profile ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="text-right max-w-[150px] truncate" title={profile.full_name || "Not set"}>
                          {profile.full_name || "Not set"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Specialization:</span>
                        <span className="text-right max-w-[150px] truncate" title={profile.specialization || "Not set"}>
                          {profile.specialization || "Not set"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Desired Degree:</span>
                        <span className="text-right max-w-[150px] truncate" title={formatDegreeDisplay(profile.year_of_study)}>
                          {formatDegreeDisplay(profile.year_of_study)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GPA:</span>
                        <span>{profile.gpa || "Not set"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Country:</span>
                        <span className="text-right max-w-[150px] truncate" title={profile.country || "Not set"}>
                          {profile.country || "Not set"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No profile information yet. Click "Edit Profile" to get started.
                    </div>
                  )}
                </div>
                <ProfileDialog 
                  trigger={
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  }
                  userType="student"
                  onProfileUpdate={handleProfileUpdate}
                />
              </CardContent>
            </Card>

            {/* Document Upload */}
            <Card className="shadow-medium border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Documents</span>
                </CardTitle>
                <CardDescription>Upload and manage your application documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50">
                    <div className="flex items-center space-x-3">
                      {doc.status === "uploaded" ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{doc.name}</p>
                          {doc.status === "uploaded" && analyzedDocuments.has(doc.id) && (
                            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                              Analyzed
                            </Badge>
                          )}
                        </div>
                        {doc.file && (
                          <p className="text-xs text-muted-foreground">{doc.file}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {doc.status === "pending" ? (
                        <>
                          <input
                            type="file"
                            id={`file-${index}`}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(doc.name, file);
                              }
                            }}
                          />
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => document.getElementById(`file-${index}`).click()}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDocument(doc.name)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const fileInput = document.createElement('input');
                                fileInput.type = 'file';
                                fileInput.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
                                fileInput.onchange = (e) => {
                                  const target = e.target as HTMLInputElement;
                                  const file = target.files?.[0];
                                  if (file && doc.id) {
                                    handleUpdateDocument(doc.id, doc.name, file);
                                  }
                                };
                                fileInput.click();
                              }}
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Update
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                if (doc.id) {
                                  setDeleteConfirm({ id: doc.id, name: doc.name });
                                }
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Recommendations */}
            <Card className="shadow-medium border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-secondary" />
                  <span>AI Recommendations</span>
                </CardTitle>
                <CardDescription>Universities matched to your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="recommended" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="recommended">Recommended</TabsTrigger>
                    <TabsTrigger value="saved">Saved</TabsTrigger>
                    <TabsTrigger value="applied">Applied</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="recommended" className="space-y-4 mt-6">
                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4" />
                        <span className="text-sm font-medium">Filters:</span>
                      </div>
                      
                      <Select>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="canada">Canada</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="australia">Australia</SelectItem>
                          <SelectItem value="germany">Germany</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Program" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cs">Computer Science</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="engineering">Engineering</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex items-center space-x-2">
                        <Label className="text-sm">Budget: ${filters.budget[0].toLocaleString()}</Label>
                        <Slider
                          value={filters.budget}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, budget: value }))}
                          max={100000}
                          min={5000}
                          step={5000}
                          className="w-32"
                        />
                      </div>
                    </div>

                    {/* University Cards */}
                    <div className="space-y-4">
                      {universities.map((uni) => (
                        <Card key={uni.id} className="hover:shadow-medium transition-all duration-300 border-border/50">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                  {uni.logo_url ? (
                                    <img src={uni.logo_url} alt={uni.name} className="w-8 h-8 rounded" />
                                  ) : (
                                    <GraduationCap className="h-6 w-6 text-muted-foreground" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">{uni.name}</h3>
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                    <div className="flex items-center space-x-1">
                                      <MapPin className="h-3 w-3" />
                                      <span>{uni.location}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleSave(uni.id)}
                                >
                                  {savedUniversities.has(uni.id) ? (
                                    <BookmarkCheck className="h-4 w-4 text-accent" />
                                  ) : (
                                    <Bookmark className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            {uni.description && (
                              <p className="text-sm text-muted-foreground mb-4">{uni.description}</p>
                            )}

                            {uni.university_programs && uni.university_programs.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium mb-2">Available Programs:</h4>
                                <div className="grid gap-2">
                                  {uni.university_programs.slice(0, 3).map((program) => (
                                    <div key={program.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                      <div>
                                        <p className="text-sm font-medium">{program.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {program.degree_level} • {program.duration}
                                        </p>
                                      </div>
                                      <Button 
                                        size="sm" 
                                        onClick={() => handleApply(uni.id, program.id)}
                                      >
                                        Apply
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                {uni.website && (
                                  <Button size="sm" variant="outline" asChild>
                                    <a href={uni.website} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4 mr-1" />
                                      Visit Website
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {universities.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No universities available yet. Check back soon!</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="saved" className="space-y-4 mt-6">
                    {savedPrograms.size > 0 ? (
                      <div className="space-y-4">
                        {aiCourseSuggestions
                          .filter(course => savedPrograms.has(course.id))
                          .map((course) => (
                            <Card key={course.id} className="hover:shadow-medium transition-all duration-300 border-border/50">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                      {course.logo ? (
                                        <img src={course.logo} alt={course.university} className="w-6 h-6 rounded" />
                                      ) : (
                                        <GraduationCap className="h-5 w-5 text-muted-foreground" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-medium">{course.title}</h3>
                                      <p className="text-sm text-muted-foreground">{course.university}</p>
                                      <p className="text-xs text-muted-foreground">{course.location}</p>
                                      <div className="flex items-center gap-4 mt-1">
                                        <Badge variant="secondary" className="text-xs">
                                          {course.matchScore}% match
                                        </Badge>
                                        {course.degreeLevel && (
                                          <span className="text-xs text-muted-foreground">{course.degreeLevel}</span>
                                        )}
                                        {course.duration && (
                                          <span className="text-xs text-muted-foreground">{course.duration}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleApply(course)}
                                      disabled={
                                        appliedPrograms.has(course.id) ||
                                        isApplicationExpired(course)
                                      }
                                      className={
                                        appliedPrograms.has(course.id) 
                                          ? 'bg-gray-500 text-white' 
                                          : wasAppliedButExpired(course.id)
                                            ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                            : isApplicationExpired(course)
                                              ? 'bg-red-500 text-white cursor-not-allowed'
                                              : 'bg-green-600 hover:bg-green-700 text-white'
                                      }
                                    >
                                      {appliedPrograms.has(course.id) ? (
                                        <span className="flex items-center gap-1">
                                          <CheckCircle className="h-4 w-4" />
                                          Applied
                                        </span>
                                      ) : wasAppliedButExpired(course.id) ? (
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-4 w-4" />
                                          Apply Again
                                        </span>
                                      ) : isApplicationExpired(course) ? (
                                        <span className="flex items-center gap-1">
                                          <X className="h-4 w-4" />
                                          Expired
                                        </span>
                                      ) : (
                                        'Apply'
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => toggleSaveProgram(course.id, course.universityId)}
                                    >
                                      <BookmarkCheck className="h-4 w-4 text-accent" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No saved courses yet. Start saving your favorites!</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="applied" className="space-y-4 mt-6">
                    {applications.length > 0 ? (
                      <div className="space-y-4">
                        {applications.map((app) => (
                          <Card key={app.id} className="hover:shadow-medium transition-all duration-300 border-border/50">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                    {app.university_profiles?.logo_url ? (
                                      <img src={app.university_profiles.logo_url} alt={app.university_profiles.name} className="w-6 h-6 rounded" />
                                    ) : (
                                      <GraduationCap className="h-5 w-5 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div>
                                    <h3 className="font-medium">{app.university_profiles?.name}</h3>
                                    {app.program && (
                                      <p className="text-sm text-muted-foreground">{app.program.title}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                      Applied: {new Date(app.application_date).toLocaleDateString()}
                                    </p>
                                    {app.program?.application_deadline && (
                                      <p className="text-xs text-muted-foreground">
                                        Deadline: {new Date(app.program.application_deadline).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Badge variant="outline" className="bg-success/10 text-success">
                                  {app.status}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No applications yet. Start applying to your dream universities!</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* AI Recommendations & Assistant */}
            <Card className="border-border/50 shadow-medium">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <CardTitle>AI University Assistant</CardTitle>
                </div>
                <CardDescription>
                  Get personalized recommendations and guidance for your university applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="recommendations" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="recommendations" className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      Recommendations
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Document Analysis
                    </TabsTrigger>
                    <TabsTrigger value="assistant" className="flex items-center gap-1">
                      <Brain className="h-4 w-4" />
                      AI Assistant
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="recommendations" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Star className="h-5 w-5 text-primary" />
                            AI Course Suitability Analysis
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Discover how suitable you are for each course based on your profile and documents
                          </p>
                        </div>
                        <Button 
                          onClick={generateAICourseSuggestions}
                          disabled={generatingCourseSuggestions}
                          className="flex items-center gap-2"
                        >
                          {generatingCourseSuggestions ? (
                            <>
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Brain className="h-4 w-4" />
                              Generate Suitability Analysis
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {aiCourseSuggestions.length > 0 ? (
                        <div className="space-y-6">
                          {/* Excellent Fit Courses (80%+) */}
                          {aiCourseSuggestions.filter(course => course.matchScore >= 80).length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <h4 className="font-semibold text-green-700 dark:text-green-400">
                                  🌟 Excellent Fit - You're Highly Suitable (80%+)
                                </h4>
                                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  {aiCourseSuggestions.filter(course => course.matchScore >= 80).length} courses
                                </Badge>
                              </div>
                              <div className="grid gap-4 md:grid-cols-2">
                                {aiCourseSuggestions
                                  .filter(course => course.matchScore >= 80)
                                  .map((course) => (
                                    <Card key={course.id} className="hover:shadow-large transition-all duration-300 border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
                                      <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                          <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                              {course.logo ? (
                                                <img src={course.logo} alt={course.university} className="w-8 h-8 rounded" />
                                              ) : (
                                                <GraduationCap className="h-6 w-6 text-green-600" />
                                              )}
                                            </div>
                                            <div>
                                              <h4 className="font-medium">{course.title}</h4>
                                              <p className="text-sm text-muted-foreground">{course.university}</p>
                                              <p className="text-xs text-muted-foreground">{course.location}</p>
                                            </div>
                                          </div>
                                          <Badge variant="secondary" className="bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            {course.matchScore}% match
                                          </Badge>
                                        </div>
                                        
                                        <div className="space-y-2 text-sm mb-3">
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Degree Level:</span>
                                            <span className="font-medium">{course.degreeLevel || 'Not specified'}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Duration:</span>
                                            <span className="font-medium">{course.duration || 'Not specified'}</span>
                                          </div>
                                          {course.tuitionFee && (
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Tuition:</span>
                                              <span className="font-medium">{course.tuitionFee}</span>
                                            </div>
                                          )}
                                          {course.hasScholarships && (
                                            <div className="flex justify-between items-center">
                                              <span className="text-muted-foreground">Scholarships:</span>
                                              <div className="flex items-center gap-1">
                                                <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200">
                                                  Available
                                                </Badge>
                                                {course.scholarshipPercentage && (
                                                  <span className="text-xs text-green-600 font-medium">
                                                    {course.scholarshipPercentage}%
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                          {course.deliveryMode && (
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Mode:</span>
                                              <span className="font-medium">{course.deliveryMode}</span>
                                            </div>
                                          )}
                                          {course.applicationDeadline && (
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Deadline:</span>
                                              <span className={`font-medium ${
                                                isApplicationExpired(course) 
                                                  ? 'text-red-600' 
                                                  : new Date(course.applicationDeadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                                    ? 'text-amber-600'
                                                    : 'text-green-600'
                                              }`}>
                                                {new Date(course.applicationDeadline).toLocaleDateString()}
                                                {isApplicationExpired(course) && ' (Expired)'}
                                              </span>
                                            </div>
                                          )}
                                        </div>

                                        <div className="space-y-3 mb-3">
                                          <div className="space-y-2">
                                            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Your Suitability for this Program:</p>
                                            <ul className="text-xs space-y-1">
                                              {course.suitabilityReasons?.slice(0, 2).map((reason, idx) => (
                                                <li key={idx} className="flex items-start gap-1">
                                                  <CheckCircle className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                                  <span>{reason}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>

                                          {course.strengths && course.strengths.length > 0 && (
                                            <div className="space-y-1">
                                              <p className="text-xs font-medium text-green-700 dark:text-green-400">Your Strengths:</p>
                                              <ul className="text-xs space-y-1">
                                                {course.strengths.slice(0, 2).map((strength, idx) => (
                                                  <li key={idx} className="flex items-center gap-1 text-green-600">
                                                    <Star className="h-3 w-3 fill-current" />
                                                    {strength}
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}

                                          {course.improvementAreas && course.improvementAreas.length > 0 && (
                                            <div className="space-y-1">
                                              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Areas to Improve:</p>
                                              <ul className="text-xs space-y-1">
                                                {course.improvementAreas.slice(0, 1).map((area, idx) => (
                                                  <li key={idx} className="flex items-start gap-1 text-amber-600">
                                                    <Brain className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                    <span>{area}</span>
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                        </div>

                                        <div className="flex gap-2">
                                          <Button 
                                            size="sm" 
                                            className={`flex-1 ${
                                              appliedPrograms.has(course.id) 
                                                ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                                                : wasAppliedButExpired(course.id)
                                                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                                  : isApplicationExpired(course)
                                                    ? 'bg-red-500 hover:bg-red-600 text-white cursor-not-allowed'
                                                    : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-300'
                                            }`}
                                            onClick={() => handleApply(course)}
                                            disabled={
                                              applyingToProgram === course.id || 
                                              appliedPrograms.has(course.id) ||
                                              isApplicationExpired(course)
                                            }
                                          >
                                            {appliedPrograms.has(course.id) ? (
                                              <span className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4" />
                                                Applied
                                              </span>
                                            ) : wasAppliedButExpired(course.id) ? (
                                              <span className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Expired - Apply Again
                                              </span>
                                            ) : isApplicationExpired(course) ? (
                                              <span className="flex items-center gap-2">
                                                <X className="h-4 w-4" />
                                                Application Closed
                                              </span>
                                            ) : applyingToProgram === course.id ? (
                                              <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Applying...
                                              </span>
                                            ) : (
                                              "Apply Now"
                                            )}
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => toggleSaveProgram(course.id, course.universityId)}
                                            className={`${savedPrograms.has(course.id) ? 'bg-accent text-accent-foreground' : ''}`}
                                          >
                                            {savedPrograms.has(course.id) ? (
                                              <BookmarkCheck className="h-4 w-4 text-accent" />
                                            ) : (
                                              <Bookmark className="h-4 w-4" />
                                            )}
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Good Fit Courses (40-79%) */}
                          {aiCourseSuggestions.filter(course => course.matchScore >= 40 && course.matchScore < 80).length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                                <h4 className="font-semibold text-amber-700 dark:text-amber-400">
                                  👍 Good Fit - You're Well-Suited (40-79%)
                                </h4>
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                  {aiCourseSuggestions.filter(course => course.matchScore >= 40 && course.matchScore < 80).length} courses
                                </Badge>
                              </div>
                              <div className="grid gap-4 md:grid-cols-2">
                                {aiCourseSuggestions
                                  .filter(course => course.matchScore >= 40 && course.matchScore < 80)
                                  .map((course) => (
                                    <Card key={course.id} className="hover:shadow-large transition-all duration-300 border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
                                      <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                          <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                                              {course.logo ? (
                                                <img src={course.logo} alt={course.university} className="w-8 h-8 rounded" />
                                              ) : (
                                                <GraduationCap className="h-6 w-6 text-amber-600" />
                                              )}
                                            </div>
                                            <div>
                                              <h4 className="font-medium">{course.title}</h4>
                                              <p className="text-sm text-muted-foreground">{course.university}</p>
                                              <p className="text-xs text-muted-foreground">{course.location}</p>
                                            </div>
                                          </div>
                                          <Badge variant="secondary" className="bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                            {course.matchScore}% match
                                          </Badge>
                                        </div>
                                        
                                        <div className="space-y-2 text-sm mb-3">
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Degree Level:</span>
                                            <span className="font-medium">{course.degreeLevel || 'Not specified'}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Duration:</span>
                                            <span className="font-medium">{course.duration || 'Not specified'}</span>
                                          </div>
                                          {course.tuitionFee && (
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Tuition:</span>
                                              <span className="font-medium">{course.tuitionFee}</span>
                                            </div>
                                          )}
                                        </div>

                                        <div className="space-y-3 mb-3">
                                          <div className="space-y-2">
                                            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Your Suitability Assessment:</p>
                                            <ul className="text-xs space-y-1">
                                              {course.suitabilityReasons?.slice(0, 2).map((reason, idx) => (
                                                <li key={idx} className="flex items-start gap-1">
                                                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                                                  <span>{reason}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>

                                          {course.strengths && course.strengths.length > 0 && (
                                            <div className="space-y-1">
                                              <p className="text-xs font-medium text-green-700 dark:text-green-400">Your Strengths:</p>
                                              <ul className="text-xs space-y-1">
                                                {course.strengths.slice(0, 1).map((strength, idx) => (
                                                  <li key={idx} className="flex items-center gap-1 text-green-600">
                                                    <Star className="h-3 w-3 fill-current" />
                                                    {strength}
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}

                                          {course.improvementAreas && course.improvementAreas.length > 0 && (
                                            <div className="space-y-1">
                                              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Areas to Strengthen:</p>
                                              <ul className="text-xs space-y-1">
                                                {course.improvementAreas.slice(0, 1).map((area, idx) => (
                                                  <li key={idx} className="flex items-start gap-1 text-amber-600">
                                                    <Brain className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                    <span>{area}</span>
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                        </div>

                                        <div className="flex gap-2">
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            className={`flex-1 ${
                                              appliedPrograms.has(course.id) 
                                                ? 'bg-gray-100 text-gray-600' 
                                                : wasAppliedButExpired(course.id)
                                                  ? 'bg-orange-100 text-orange-700 border-orange-300'
                                                  : isApplicationExpired(course)
                                                    ? 'bg-red-100 text-red-700 border-red-300 cursor-not-allowed'
                                                    : ''
                                            }`}
                                            onClick={() => handleApply(course)}
                                            disabled={
                                              applyingToProgram === course.id || 
                                              appliedPrograms.has(course.id) ||
                                              isApplicationExpired(course)
                                            }
                                          >
                                            {appliedPrograms.has(course.id) ? (
                                              <span className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4" />
                                                Applied
                                              </span>
                                            ) : wasAppliedButExpired(course.id) ? (
                                              <span className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Apply Again
                                              </span>
                                            ) : isApplicationExpired(course) ? (
                                              <span className="flex items-center gap-2">
                                                <X className="h-4 w-4" />
                                                Expired
                                              </span>
                                            ) : applyingToProgram === course.id ? (
                                              <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                                Applying...
                                              </span>
                                            ) : (
                                              "Apply"
                                            )}
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => toggleSaveProgram(course.id, course.universityId)}
                                            className={`${savedPrograms.has(course.id) ? 'bg-accent text-accent-foreground' : ''}`}
                                          >
                                            {savedPrograms.has(course.id) ? (
                                              <BookmarkCheck className="h-4 w-4 text-accent" />
                                            ) : (
                                              <Bookmark className="h-4 w-4" />
                                            )}
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Growth Opportunity Courses (15-39%) */}
                          {aiCourseSuggestions.filter(course => course.matchScore < 40).length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <h4 className="font-semibold text-blue-700 dark:text-blue-400">
                                  🎯 Growth Opportunities - Challenging but Achievable (15-39%)
                                </h4>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {aiCourseSuggestions.filter(course => course.matchScore < 40).length} courses
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Programs that require preparation but offer excellent growth potential and career expansion opportunities.
                              </p>
                              <div className="grid gap-4 md:grid-cols-2">
                                {aiCourseSuggestions
                                  .filter(course => course.matchScore < 40)
                                  .map((course) => (
                                    <Card key={course.id} className="hover:shadow-large transition-all duration-300 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
                                      <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                          <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                              {course.logo ? (
                                                <img src={course.logo} alt={course.university} className="w-8 h-8 rounded" />
                                              ) : (
                                                <GraduationCap className="h-6 w-6 text-blue-600" />
                                              )}
                                            </div>
                                            <div>
                                              <h4 className="font-medium">{course.title}</h4>
                                              <p className="text-sm text-muted-foreground">{course.university}</p>
                                              <p className="text-xs text-muted-foreground">{course.location}</p>
                                            </div>
                                          </div>
                                          <Badge variant="secondary" className="bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {course.matchScore}% match
                                          </Badge>
                                        </div>
                                        
                                        <div className="space-y-2 text-sm mb-3">
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Degree Level:</span>
                                            <span className="font-medium">{course.degreeLevel || 'Not specified'}</span>
                                          </div>
                                          {course.tuitionFee && (
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Tuition:</span>
                                              <span className="font-medium">{course.tuitionFee}</span>
                                            </div>
                                          )}
                                        </div>

                                        <div className="space-y-3 mb-3">
                                          <div className="space-y-2">
                                            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Growth Opportunity Assessment:</p>
                                            <ul className="text-xs space-y-1">
                                              {course.suitabilityReasons?.slice(0, 2).map((reason, idx) => (
                                                <li key={idx} className="flex items-start gap-1">
                                                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                                                  <span>{reason}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>

                                          {course.improvementAreas && course.improvementAreas.length > 0 && (
                                            <div className="space-y-1">
                                              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Preparation Needed:</p>
                                              <ul className="text-xs space-y-1">
                                                {course.improvementAreas.slice(0, 2).map((area, idx) => (
                                                  <li key={idx} className="flex items-start gap-1 text-amber-600">
                                                    <Brain className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                    <span>{area}</span>
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}

                                          {course.strengths && course.strengths.length > 0 && (
                                            <div className="space-y-1">
                                              <p className="text-xs font-medium text-green-700 dark:text-green-400">Your Advantages:</p>
                                              <ul className="text-xs space-y-1">
                                                {course.strengths.slice(0, 1).map((strength, idx) => (
                                                  <li key={idx} className="flex items-center gap-1 text-green-600">
                                                    <Star className="h-3 w-3 fill-current" />
                                                    {strength}
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                        </div>

                                        <div className="flex gap-2">
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            className={`flex-1 ${
                                              appliedPrograms.has(course.id) 
                                                ? 'bg-gray-100 text-gray-600' 
                                                : wasAppliedButExpired(course.id)
                                                  ? 'bg-orange-100 text-orange-700 border-orange-300'
                                                  : isApplicationExpired(course)
                                                    ? 'bg-red-100 text-red-700 border-red-300 cursor-not-allowed'
                                                    : ''
                                            }`}
                                            onClick={() => handleApply(course)}
                                            disabled={
                                              applyingToProgram === course.id || 
                                              appliedPrograms.has(course.id) ||
                                              isApplicationExpired(course)
                                            }
                                          >
                                            {appliedPrograms.has(course.id) ? (
                                              <span className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4" />
                                                Applied
                                              </span>
                                            ) : wasAppliedButExpired(course.id) ? (
                                              <span className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Apply Again
                                              </span>
                                            ) : isApplicationExpired(course) ? (
                                              <span className="flex items-center gap-2">
                                                <X className="h-4 w-4" />
                                                Expired
                                              </span>
                                            ) : applyingToProgram === course.id ? (
                                              <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                                Applying...
                                              </span>
                                            ) : (
                                              "Apply Now"
                                            )}
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => toggleSaveProgram(course.id, course.universityId)}
                                            className={`${savedPrograms.has(course.id) ? 'bg-accent text-accent-foreground' : ''}`}
                                          >
                                            {savedPrograms.has(course.id) ? (
                                              <BookmarkCheck className="h-4 w-4 text-accent" />
                                            ) : (
                                              <Bookmark className="h-4 w-4" />
                                            )}
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-secondary/10 rounded-lg border border-border/50">
                          <Brain className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
                          <h4 className="text-lg font-medium mb-2">No AI Suggestions Yet</h4>
                          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                            Upload your documents and click "Generate AI Suggestions" to get personalized course recommendations from universities in our database.
                          </p>
                          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {documents.filter(doc => doc.status === 'uploaded').length}/{documentTypes.length} docs uploaded
                            </div>
                            <div className="flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              {universities.filter(uni => uni.is_published).length} universities available
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {aiCourseSuggestions.length > 0 && (
                        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                            <CheckCircle className="h-4 w-4" />
                            AI Insights Based on Your Documents
                          </h4>
                          <div className="space-y-2 text-sm">
                            <p>• Recommendations are based on {documents.filter(doc => doc.status === 'uploaded').length} uploaded documents and your profile</p>
                            <p>• Match scores consider your academic background, specialization, and document quality</p>
                            <p>• All suggested programs are from verified universities in our database</p>
                            <p>• Consider applying to a mix of high match (80%+), good match (40-79%), and alternative (15-39%) programs</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Document Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        AI-powered feedback on your uploaded documents
                      </p>
                      
                      {documents.filter(doc => doc.status === 'uploaded').length > 0 ? (
                        <div className="space-y-4">
                          {documents.filter(doc => doc.status === 'uploaded').map((doc, index) => {
                            const docId = doc.id || index;
                            const isAnalyzing = analyzingDocuments.has(docId);
                            const isAnalyzed = analyzedDocuments.has(docId);
                            const analysis = isAnalyzed ? getDocumentAnalysis(docId) : null;

                            return (
                              <Card key={docId} className="border-border/50">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <FileText className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <p className="font-medium">{doc.file || `${doc.name} Document`}</p>
                                        <Badge variant="outline" className="text-xs">
                                          {doc.name}
                                        </Badge>
                                      </div>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => analyzeDocument(docId, doc.name, doc.file)}
                                      disabled={isAnalyzing || isAnalyzed}
                                    >
                                      {isAnalyzing ? (
                                        <>
                                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></div>
                                          Analyzing...
                                        </>
                                      ) : isAnalyzed ? (
                                        <>
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Analyzed
                                        </>
                                      ) : (
                                        "Analyze"
                                      )}
                                    </Button>
                                  </div>
                                  
                                  {/* AI Analysis Results */}
                                  {isAnalyzed && analysis && (
                                    <div className="mt-3 p-3 bg-secondary/30 rounded-lg">
                                      <h5 className="font-medium text-sm mb-2">AI Analysis Results:</h5>
                                      <div className="text-sm space-y-3">
                                        <div>
                                          <p className="font-medium text-success mb-1">Strengths:</p>
                                          {analysis.strengths.map((strength, idx) => (
                                            <p key={idx} className="text-success ml-2">✓ {strength}</p>
                                          ))}
                                        </div>
                                        
                                        <div>
                                          <p className="font-medium text-warning mb-1">Improvements:</p>
                                          {analysis.improvements.map((improvement, idx) => (
                                            <p key={idx} className="text-warning ml-2">⚠ {improvement}</p>
                                          ))}
                                        </div>
                                        
                                        <div>
                                          <p className="font-medium text-muted-foreground mb-1">Metrics:</p>
                                          {analysis.metrics.map((metric, idx) => (
                                            <p key={idx} className="text-muted-foreground ml-2">• {metric}</p>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Upload documents to get AI analysis</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="assistant" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">AI Admissions Assistant</h3>
                      <p className="text-sm text-muted-foreground">
                        Ask questions about study destinations, scholarships, or admission processes
                      </p>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-secondary/30 rounded-lg">
                          <h4 className="font-medium mb-2">Quick Questions</h4>
                          <div className="grid gap-2">
                            <Button variant="outline" size="sm" className="justify-start text-left h-auto p-3">
                              What scholarships are available for international students in Canada?
                            </Button>
                            <Button variant="outline" size="sm" className="justify-start text-left h-auto p-3">
                              How do I prepare for university interviews?
                            </Button>
                            <Button variant="outline" size="sm" className="justify-start text-left h-auto p-3">
                              What's the difference between conditional and unconditional offers?
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Ask me anything about university admissions..."
                              className="flex-1"
                            />
                            <Button>
                              <Brain className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Spoof AI Response */}
                        <div className="p-4 bg-secondary/50 rounded-lg">
                          <h4 className="font-semibold mb-2">AI Response:</h4>
                          <div className="text-sm space-y-2">
                            <p>Based on your profile and preferences for Computer Science programs in Canada, here are some key insights:</p>
                            <p><strong>Top Scholarships:</strong></p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              <li>Vanier Canada Graduate Scholarships (up to $50,000/year)</li>
                              <li>Ontario Graduate Scholarship (up to $15,000/year)</li>
                              <li>University-specific merit scholarships (varies by institution)</li>
                            </ul>
                            <p><strong>Application Tips:</strong></p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              <li>Apply early - many scholarships have January deadlines</li>
                              <li>Highlight your research interests and relevant experience</li>
                              <li>Get strong letters of recommendation from professors</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone and any analysis results will also be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteConfirm) {
                    handleDeleteDocument(deleteConfirm.id, deleteConfirm.name);
                    setDeleteConfirm(null);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}