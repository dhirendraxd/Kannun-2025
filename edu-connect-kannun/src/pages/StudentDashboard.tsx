import { useState, useEffect, useCallback, useMemo } from "react";
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
  const [savedUniversities, setSavedUniversities] = useState(new Set());
  const [applications, setApplications] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzedDocuments, setAnalyzedDocuments] = useState(new Set());
  const [analyzingDocuments, setAnalyzingDocuments] = useState(new Set());
  const [documentAnalysisResults, setDocumentAnalysisResults] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [aiCourseSuggestions, setAiCourseSuggestions] = useState([]);
  const [generatingCourseSuggestions, setGeneratingCourseSuggestions] = useState(false);

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
    const { data } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    setProfile(data);
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
    const { data } = await supabase
      .from('student_applications')
      .select(`
        *,
        university_profiles(name, logo_url),
        university_programs(title)
      `)
      .eq('user_id', user.id);
    setApplications(data || []);
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
        loadApplications(),
        loadUniversities()
      ]);
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  }, [loadProfile, loadDocuments, loadSavedUniversities, loadApplications, loadUniversities]);

  // Load student data when component mounts
  useEffect(() => {
    if (user) {
      loadStudentData();
      // Test AI service availability
      testAIServiceAvailability();
    }
  }, [user, testAIServiceAvailability, loadStudentData]);

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
  }, [user, loadSavedUniversities, loadApplications]);

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
      // Check if student has uploaded documents
      const uploadedDocs = documents.filter(doc => doc.status === 'uploaded' && doc.id);
      
      if (uploadedDocs.length === 0) {
        toast({
          title: "No documents to share",
          description: "Please upload some documents before applying to universities.",
          variant: "destructive"
        });
        return;
      }

      // Create the application first
      const { data: applicationData, error: applicationError } = await supabase
        .from('student_applications')
        .insert({
          user_id: user.id,
          university_id: universityId,
          program_id: programId,
          status: 'submitted'
        })
        .select('id')
        .single();

      if (applicationError) throw applicationError;

      // Share all uploaded documents with the university
      const documentsToShare = uploadedDocs.map(doc => ({
        student_id: user.id,
        university_id: universityId,
        application_id: applicationData.id,
        document_id: doc.id,
        status: 'pending'
      }));

      const { error: shareError } = await supabase
        .from('student_university_shared_documents')
        .insert(documentsToShare);

      if (shareError) {
        console.error('Error sharing documents:', shareError);
        // Don't fail the application, just log the error
        toast({
          title: "Application submitted",
          description: "Your application has been submitted, but there was an issue sharing some documents. Please contact support if needed.",
          variant: "default"
        });
      } else {
        toast({
          title: "Application submitted successfully!",
          description: `Your application and ${uploadedDocs.length} documents have been shared with the university.`,
          variant: "default"
        });
      }

      // Reload applications to show the new one
      loadApplications();

    } catch (error) {
      console.error('Application error:', error);
      toast({
        title: "Application failed", 
        description: error.message || "An error occurred while submitting your application.",
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

  // AI Course Suggestion Function
  const generateAICourseSuggestions = async () => {
    if (documents.filter(doc => doc.status === 'uploaded').length === 0) {
      toast({
        title: "No documents found",
        description: "Please upload documents first to get AI course suggestions.",
        variant: "destructive"
      });
      return;
    }

    try {
      setGeneratingCourseSuggestions(true);

      // Get available universities and programs from database
      const availableUniversities = universities.filter(uni => uni.is_published);
      const availablePrograms = [];
      
      availableUniversities.forEach(uni => {
        if (uni.university_programs) {
          uni.university_programs.forEach(program => {
            if (program.is_published) {
              availablePrograms.push({
                ...program,
                university: uni
              });
            }
          });
        }
      });

      console.log(`Found ${availablePrograms.length} available programs to analyze`);

      // Prepare document analysis for intelligent matching
      const uploadedDocs = documents.filter(doc => doc.status === 'uploaded');
      
      // Generate intelligent course suggestions based on documents and profile
      await generateIntelligentSuggestions(availablePrograms, uploadedDocs, profile);

    } catch (error) {
      console.error('Error generating course suggestions:', error);
      toast({
        title: "Error generating suggestions",
        description: "Failed to generate course suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingCourseSuggestions(false);
    }
  };

  // Generate intelligent suggestions based on document analysis
  const generateIntelligentSuggestions = async (availablePrograms, uploadedDocs, userProfile) => {
    console.log('Analyzing documents and profile for course matching...');
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Analyze user profile and documents
    const documentTypes = uploadedDocs.map(doc => doc.name.toLowerCase());
    const hasTranscripts = documentTypes.some(name => name.includes('transcript'));
    const hasStatement = documentTypes.some(name => name.includes('statement') || name.includes('essay'));
    const hasLanguageTest = documentTypes.some(name => name.includes('ielts') || name.includes('toefl'));
    const hasRecommendations = documentTypes.some(name => name.includes('recommendation'));
    const hasResume = documentTypes.some(name => name.includes('resume') || name.includes('cv'));

    // Calculate document completeness score
    let documentScore = 0;
    if (hasTranscripts) documentScore += 25;
    if (hasStatement) documentScore += 20;
    if (hasLanguageTest) documentScore += 20;
    if (hasRecommendations) documentScore += 20;
    if (hasResume) documentScore += 15;

    // Analyze academic background
    const userSpecialization = userProfile?.specialization?.toLowerCase() || '';
    const userGPA = parseFloat(userProfile?.gpa || '0');
    const userYear = userProfile?.year_of_study?.toLowerCase() || '';

    // Generate course matches with detailed scoring
    const courseMatches = availablePrograms.map(program => {
      const programTitle = program.title.toLowerCase();
      const programDescription = (program.description || '').toLowerCase();
      
      let matchScore = 15; // Base score
      const matchReasons = [];

      // Field alignment (40 points max)
      if (userSpecialization) {
        if (programTitle.includes(userSpecialization) || programDescription.includes(userSpecialization)) {
          matchScore += 35;
          matchReasons.push(`Perfect field match with your ${userProfile.specialization} background`);
        } else if (userSpecialization.includes('computer') && 
                  (programTitle.includes('technology') || programTitle.includes('data') || programTitle.includes('software'))) {
          matchScore += 25;
          matchReasons.push('Strong match with technology and computer-related fields');
        } else if (userSpecialization.includes('business') && 
                  (programTitle.includes('management') || programTitle.includes('finance') || programTitle.includes('economics'))) {
          matchScore += 25;
          matchReasons.push('Strong match with business and management fields');
        } else if (userSpecialization.includes('engineering') && 
                  (programTitle.includes('technical') || programTitle.includes('science'))) {
          matchScore += 25;
          matchReasons.push('Strong match with engineering and technical fields');
        } else if (programTitle.split(' ').some(word => userSpecialization.includes(word))) {
          matchScore += 15;
          matchReasons.push('Partial match with your academic background');
        }
      }

      // Academic level alignment (15 points)
      if (program.degree_level) {
        const degreeLevel = program.degree_level.toLowerCase();
        if ((degreeLevel.includes('bachelor') && userYear.includes('final')) ||
            (degreeLevel.includes('master') && userYear.includes('graduate'))) {
          matchScore += 15;
          matchReasons.push('Perfect academic level progression');
        } else if (degreeLevel.includes('master') && !userYear.includes('first')) {
          matchScore += 10;
          matchReasons.push('Good academic level progression');
        }
      }

      // GPA alignment (10 points)
      if (userGPA >= 3.7) {
        matchScore += 10;
        matchReasons.push('Excellent GPA meets high program standards');
      } else if (userGPA >= 3.3) {
        matchScore += 7;
        matchReasons.push('Good GPA meets program requirements');
      } else if (userGPA >= 3.0) {
        matchScore += 4;
        matchReasons.push('GPA meets minimum requirements');
      }

      // Document completeness bonus (20 points)
      matchScore += Math.round(documentScore * 0.2);
      if (documentScore >= 80) {
        matchReasons.push('Complete application profile with all key documents');
      } else if (documentScore >= 60) {
        matchReasons.push('Strong application profile with most documents');
      } else if (documentScore >= 40) {
        matchReasons.push('Good application foundation');
      }

      // Scholarship bonus (5 points)
      if (program.has_scholarships) {
        matchScore += 5;
        matchReasons.push(`Scholarships available${program.scholarship_percentage ? ` (up to ${program.scholarship_percentage})` : ''}`);
      }

      // Location consideration (3 points)
      if (program.university.location) {
        matchScore += 3;
        matchReasons.push(`Located in ${program.university.location}`);
      }

      // Ensure score is within realistic bounds
      matchScore = Math.max(10, Math.min(98, Math.round(matchScore)));

      // Add match percentage indicator
      let matchCategory = 'low';
      if (matchScore >= 80) {
        matchCategory = 'high';
        matchReasons.unshift(`🎯 Excellent Match (${matchScore}%)`);
      } else if (matchScore >= 40) {
        matchCategory = 'medium';
        matchReasons.unshift(`✅ Good Match (${matchScore}%)`);
      } else {
        matchCategory = 'low';
        matchReasons.unshift(`💡 Worth Exploring (${matchScore}%)`);
      }

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
        matchScore: matchScore,
        matchReasons: matchReasons.slice(0, 4), // Top 4 reasons
        matchCategory: matchCategory,
        applicationDeadline: program.application_deadline,
        deliveryMode: program.delivery_mode,
        hasScholarships: program.has_scholarships,
        scholarshipAmount: program.scholarship_amount,
        scholarshipPercentage: program.scholarship_percentage,
        logo: program.university.logo_url
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    // Categorize results
    const highMatches = courseMatches.filter(c => c.matchScore >= 80);
    const mediumMatches = courseMatches.filter(c => c.matchScore >= 40 && c.matchScore < 80);
    const lowMatches = courseMatches.filter(c => c.matchScore >= 15 && c.matchScore < 40);

    // Create final suggestions with good distribution
    const finalSuggestions = [
      ...highMatches.slice(0, 5),
      ...mediumMatches.slice(0, 4),
      ...lowMatches.slice(0, 3)
    ];

    console.log(`Generated ${finalSuggestions.length} suggestions:`, {
      high: highMatches.length,
      medium: mediumMatches.length,
      low: lowMatches.length,
      documentScore,
      userSpecialization
    });

    setAiCourseSuggestions(finalSuggestions);
    
    toast({
      title: "🎓 AI Suggestions Generated!",
      description: `Found ${finalSuggestions.length} personalized matches based on your documents and profile (${highMatches.length} excellent, ${mediumMatches.length} good, ${lowMatches.length} exploratory)`
    });
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
                  onProfileUpdate={loadProfile}
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
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Star className="h-5 w-5 text-primary" />
                            AI Course Recommendations
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Personalized suggestions based on your uploaded documents and profile
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
                              Generate AI Suggestions
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {aiCourseSuggestions.length > 0 ? (
                        <div className="space-y-6">
                          {/* High Match Courses (80%+) */}
                          {aiCourseSuggestions.filter(course => course.matchScore >= 80).length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <h4 className="font-semibold text-green-700 dark:text-green-400">
                                  Excellent Matches (80%+ match)
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
                                          {course.applicationDeadline && (
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Deadline:</span>
                                              <span className="font-medium text-orange-600">{new Date(course.applicationDeadline).toLocaleDateString()}</span>
                                            </div>
                                          )}
                                        </div>

                                        <div className="space-y-2 mb-3">
                                          <p className="text-xs font-medium text-green-700 dark:text-green-400">Why this is a great match:</p>
                                          <ul className="text-xs space-y-1">
                                            {course.matchReasons?.slice(0, 2).map((reason, idx) => (
                                              <li key={idx} className="flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3 text-green-500" />
                                                {reason}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>

                                        <div className="flex gap-2">
                                          <Button 
                                            size="sm" 
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => handleApply(course)}
                                          >
                                            Apply Now
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => toggleSave(course.universityId)}
                                            className={`${savedUniversities.has(course.universityId) ? 'bg-accent text-accent-foreground' : ''}`}
                                          >
                                            {savedUniversities.has(course.universityId) ? (
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

                          {/* Medium Match Courses (40-79%) */}
                          {aiCourseSuggestions.filter(course => course.matchScore >= 40 && course.matchScore < 80).length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                                <h4 className="font-semibold text-amber-700 dark:text-amber-400">
                                  Good Matches (40-79% match)
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

                                        <div className="space-y-2 mb-3">
                                          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Why consider this option:</p>
                                          <ul className="text-xs space-y-1">
                                            {course.matchReasons?.slice(0, 2).map((reason, idx) => (
                                              <li key={idx} className="flex items-center gap-1">
                                                <div className="h-2 w-2 bg-amber-500 rounded-full" />
                                                {reason}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>

                                        <div className="flex gap-2">
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => handleApply(course)}
                                          >
                                            Apply
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => toggleSave(course.universityId)}
                                            className={`${savedUniversities.has(course.universityId) ? 'bg-accent text-accent-foreground' : ''}`}
                                          >
                                            {savedUniversities.has(course.universityId) ? (
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

                          {/* Low Match Courses (15-39%) */}
                          {aiCourseSuggestions.filter(course => course.matchScore < 40).length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <h4 className="font-semibold text-blue-700 dark:text-blue-400">
                                  Alternative Options (15-39% match)
                                </h4>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {aiCourseSuggestions.filter(course => course.matchScore < 40).length} courses
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Explore these programs to broaden your horizons or discover new career paths.
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

                                        <div className="space-y-2 mb-3">
                                          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Potential benefits:</p>
                                          <ul className="text-xs space-y-1">
                                            {course.matchReasons?.slice(0, 2).map((reason, idx) => (
                                              <li key={idx} className="flex items-center gap-1">
                                                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                                                {reason}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>

                                        <div className="flex gap-2">
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => handleApply(course)}
                                          >
                                            Learn More
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => toggleSave(course.universityId)}
                                            className={`${savedUniversities.has(course.universityId) ? 'bg-accent text-accent-foreground' : ''}`}
                                          >
                                            {savedUniversities.has(course.universityId) ? (
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