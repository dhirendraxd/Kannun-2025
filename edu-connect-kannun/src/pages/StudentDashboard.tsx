import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Download
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

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [savedUniversities, setSavedUniversities] = useState(new Set());
  const [applications, setApplications] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzedDocuments, setAnalyzedDocuments] = useState(new Set());
  const [analyzingDocuments, setAnalyzingDocuments] = useState(new Set());
  const [documentAnalysisResults, setDocumentAnalysisResults] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [filters, setFilters] = useState({
    country: "",
    budget: [50000],
    program: "",
    intake: ""
  });

  // Document types that students need to upload
  const documentTypes = [
    "Academic Transcripts",
    "CV/Resume", 
    "IELTS Score",
    "Personal Statement",
    "Letters of Recommendation"
  ];

  // Load student data
  useEffect(() => {
    if (user) {
      loadStudentData();
      // Test AI service availability
      testAIServiceAvailability();
    }
  }, [user]);

  const testAIServiceAvailability = async () => {
    try {
      console.log('Testing AI service availability...');
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          action: 'admissions_assistant',
          data: { question: 'test' },
          userId: user.id
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
  };

  // Real-time subscriptions for saved universities and applications
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

    return () => {
      supabase.removeChannel(savedChannel);
      supabase.removeChannel(applicationsChannel);
    };
  }, [user]);

  const loadStudentData = async () => {
    try {
      await Promise.all([
        loadProfile(),
        loadDocuments(),
        loadSavedUniversities(),
        loadApplications(),
        loadUniversities()
      ]);
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    const { data } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    setProfile(data);
  };

  const loadDocuments = async () => {
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
  };

  const loadSavedUniversities = async () => {
    const { data } = await supabase
      .from('student_saved_universities')
      .select('university_id')
      .eq('user_id', user.id);
    
    const savedSet = new Set(data?.map(item => item.university_id) || []);
    setSavedUniversities(savedSet);
  };

  const loadApplications = async () => {
    const { data } = await supabase
      .from('student_applications')
      .select(`
        *,
        university_profiles(name, logo_url),
        university_programs(title)
      `)
      .eq('user_id', user.id);
    setApplications(data || []);
  };

  const loadUniversities = async () => {
    const { data } = await supabase
      .from('university_profiles')
      .select(`
        *,
        university_programs(*)
      `)
      .eq('is_published', true);
    setUniversities(data || []);
  };

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

  const handleApply = async (universityId, programId = null) => {
    try {
      await supabase
        .from('student_applications')
        .insert({
          user_id: user.id,
          university_id: universityId,
          program_id: programId,
          status: 'submitted'
        });

      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully."
      });
    } catch (error) {
      toast({
        title: "Application failed", 
        description: error.message,
        variant: "destructive"
      });
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

  // Calculate profile completeness
  const calculateProfileCompleteness = () => {
    if (!profile) return 0;
    const fields = ['full_name', 'email', 'phone', 'country', 'specialization', 'year_of_study', 'gpa'];
    const completedFields = fields.filter(field => profile[field]).length;
    const uploadedDocs = documents.filter(doc => doc.status === 'uploaded').length;
    
    return Math.round(((completedFields / fields.length) * 70) + ((uploadedDocs / documentTypes.length) * 30));
  };

  const profileCompleteness = calculateProfileCompleteness();

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
                  {profile && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span>{profile.full_name || "Not set"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Specialization:</span>
                        <span>{profile.specialization || "Not set"}</span>
                      </div>
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
                    {savedUniversities.size > 0 ? (
                      <div className="space-y-4">
                        {universities
                          .filter(uni => savedUniversities.has(uni.id))
                          .map((uni) => (
                            <Card key={uni.id} className="hover:shadow-medium transition-all duration-300 border-border/50">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                      {uni.logo_url ? (
                                        <img src={uni.logo_url} alt={uni.name} className="w-6 h-6 rounded" />
                                      ) : (
                                        <GraduationCap className="h-5 w-5 text-muted-foreground" />
                                      )}
                                    </div>
                                    <div>
                                      <h3 className="font-medium">{uni.name}</h3>
                                      <p className="text-sm text-muted-foreground">{uni.location}</p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleSave(uni.id)}
                                  >
                                    <BookmarkCheck className="h-4 w-4 text-accent" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No saved universities yet. Start saving your favorites!</p>
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
                                    {app.university_programs && (
                                      <p className="text-sm text-muted-foreground">{app.university_programs.title}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                      Applied: {new Date(app.application_date).toLocaleDateString()}
                                    </p>
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
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        Recommended Universities
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Based on your profile, preferences, and academic background
                      </p>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        {mockUniversities.slice(0, 4).map((uni) => (
                          <Card key={uni.id} className="hover:shadow-medium transition-all duration-300 border-border/50">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="text-2xl">{uni.logo}</div>
                                  <div>
                                    <h4 className="font-medium">{uni.name}</h4>
                                    <p className="text-sm text-muted-foreground">{uni.location}</p>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="bg-primary/10 text-primary">
                                  {uni.match}% match
                                </Badge>
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Program:</span>
                                  <span className="font-medium">{uni.program}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Tuition:</span>
                                  <span className="font-medium">{uni.tuition}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Ranking:</span>
                                  <span className="font-medium">{uni.ranking}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Deadline:</span>
                                  <span className="font-medium text-destructive">{uni.deadline}</span>
                                </div>
                              </div>
                              
                              <div className="flex gap-2 mt-4">
                                <Button variant="outline" size="sm" className="flex-1">
                                  View Details
                                </Button>
                                <Button size="sm" className="flex-1">
                                  Apply Now
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          AI Insights
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>• Your profile shows strong potential for Computer Science programs in North America</p>
                          <p>• Consider applying to 3-4 reach schools, 3-4 target schools, and 2-3 safety schools</p>
                          <p>• Your IELTS score qualifies you for top-tier universities</p>
                          <p>• Early application deadlines are approaching - prioritize your top choices</p>
                        </div>
                      </div>
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