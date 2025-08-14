import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Brain, FileText, GraduationCap, CheckSquare, MessageCircle, Loader2 } from 'lucide-react';

interface AIAssistantProps {
  userId: string;
  documents: Array<{ id: string; document_type: string; file_name: string; status: string }>;
}

export function AIAssistant({ userId, documents }: AIAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [question, setQuestion] = useState('');
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    budget: '',
    location: '',
    field: '',
    level: 'Bachelor',
    targetCountry: '',
    program: ''
  });

  const callAIAssistant = async (action: string, data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-assistant', {
        body: { action, data, userId }
      });

      if (error) throw error;

      if (result.success) {
        setResponses(prev => ({ ...prev, [action]: result.response }));
        toast({
          title: "Success",
          description: "AI analysis completed!",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: Error | unknown) {
      console.error('AI Assistant error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response: " + (error instanceof Error ? error.message : 'Unknown error'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeDocument = async (doc: { document_type: string; file_name: string }) => {
    setLoading(true);
    console.log('Analyzing document:', doc);
    
    try {
      await callAIAssistant('analyze_documents', {
        documentType: doc.document_type,
        content: `Document: ${doc.file_name}`
      });
      console.log('Document analysis completed successfully');
    } catch (error) {
      console.error('Error analyzing document:', error);
      // Provide fallback document analysis
      const fallbackAnalysis = `Document Analysis for ${doc.file_name} (${doc.document_type}):

**Document Type:** ${doc.document_type}
**File:** ${doc.file_name}

I'm currently experiencing technical difficulties analyzing your document, but here's some general guidance:

**For ${doc.document_type} documents:**
• Ensure the document is clear and readable
• Verify all information is accurate and up-to-date
• Check that the document meets university requirements
• Consider having it officially translated if in another language

**General Document Tips:**
• Keep original copies safe
• Make multiple copies for applications
• Ensure documents are properly certified/attested if required
• Check expiration dates on official documents

**Next Steps:**
1. Review the document manually for completeness
2. Compare against university-specific requirements
3. Consult with an admissions counselor for detailed feedback
4. Consider professional document review services if needed

For detailed analysis, please try again later or seek professional assistance.`;

      setResponses(prev => ({ 
        ...prev, 
        analyze_documents: fallbackAnalysis
      }));
      
      toast({
        title: "Analysis Generated",
        description: "Generated general document guidance (with limited AI functionality).",
      });
    } finally {
      setLoading(false);
    }
  };

  const suggestUniversities = async () => {
    if (!preferences.budget || !preferences.location || !preferences.field || !preferences.level) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields (budget, location, field, and level) to get personalized university recommendations.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log('Getting university suggestions with preferences:', preferences);
    
    try {
      // First, fetch all published universities
      const { data: universities, error: uniError } = await supabase
        .from('university_profiles')
        .select('*')
        .eq('is_published', true);

      if (uniError) throw uniError;

      // Then, fetch all published programs
      const { data: programs, error: progError } = await supabase
        .from('university_programs')
        .select('*')
        .eq('is_published', true);

      if (progError) throw progError;

      // Group programs by university
      const programsByUniversity = programs?.reduce((acc, program) => {
        if (!acc[program.university_id]) {
          acc[program.university_id] = [];
        }
        acc[program.university_id].push(program);
        return acc;
      }, {} as Record<string, typeof programs>) || {};

      // Filter and match universities based on user preferences
      let matchedUniversities = universities?.filter(uni => {
        const uniPrograms = programsByUniversity[uni.id] || [];
        
        // Location matching (case insensitive, partial match)
        const locationMatch = !preferences.location || 
          uni.location?.toLowerCase().includes(preferences.location.toLowerCase());
        
        // Field matching (check program titles)
        const fieldMatch = !preferences.field ||
          uniPrograms.some(program => 
            program.title?.toLowerCase().includes(preferences.field.toLowerCase()) ||
            program.description?.toLowerCase().includes(preferences.field.toLowerCase())
          );

        // Level matching (check degree levels)
        const levelMatch = !preferences.level ||
          uniPrograms.some(program => 
            program.degree_level?.toLowerCase().includes(preferences.level.toLowerCase())
          );

        return locationMatch && fieldMatch && levelMatch;
      }).map(uni => ({
        ...uni,
        programs: programsByUniversity[uni.id] || []
      })) || [];

      // If budget is specified, filter programs by tuition fees
      if (preferences.budget) {
        const budgetNumber = parseInt(preferences.budget.replace(/[^0-9]/g, ''));
        if (budgetNumber > 0) {
          matchedUniversities = matchedUniversities.map(uni => ({
            ...uni,
            programs: uni.programs.filter(program => {
              if (!program.tuition_fee) return true; // Include if no fee specified
              const tuitionNumber = parseInt(program.tuition_fee.replace(/[^0-9]/g, ''));
              return tuitionNumber <= budgetNumber * 1.2; // 20% buffer
            })
          })).filter(uni => uni.programs.length > 0);
        }
      }

      // Generate recommendations text
      let recommendationsText = `🎓 **University Recommendations Based on Your Preferences:**\n\n`;
      recommendationsText += `**Your Criteria:**\n`;
      recommendationsText += `• Budget: ${preferences.budget}\n`;
      recommendationsText += `• Location: ${preferences.location}\n`;
      recommendationsText += `• Field of Study: ${preferences.field}\n`;
      recommendationsText += `• Academic Level: ${preferences.level}\n\n`;

      if (matchedUniversities.length === 0) {
        recommendationsText += `❌ **No exact matches found** in our database for your specific criteria.\n\n`;
        recommendationsText += `**Suggestions:**\n`;
        recommendationsText += `• Try broadening your location preference\n`;
        recommendationsText += `• Consider related fields to ${preferences.field}\n`;
        recommendationsText += `• Explore different degree levels\n`;
        recommendationsText += `• Adjust your budget range\n\n`;
        
        // Show some general universities from the database
        const generalUnis = universities?.slice(0, 3) || [];
        if (generalUnis.length > 0) {
          recommendationsText += `**Other Universities Available on Our Platform:**\n`;
          generalUnis.forEach((uni, index) => {
            const uniPrograms = programsByUniversity[uni.id] || [];
            recommendationsText += `\n**${index + 1}. ${uni.name}**\n`;
            recommendationsText += `📍 Location: ${uni.location || 'Not specified'}\n`;
            if (uni.description) {
              recommendationsText += `📝 ${uni.description.substring(0, 150)}...\n`;
            }
            if (uniPrograms.length > 0) {
              recommendationsText += `🎓 Available Programs: ${uniPrograms.length} programs\n`;
            }
            if (uni.website) {
              recommendationsText += `🌐 Website: ${uni.website}\n`;
            }
          });
        }
      } else {
        recommendationsText += `✅ **Found ${matchedUniversities.length} matching ${matchedUniversities.length === 1 ? 'university' : 'universities'}:**\n\n`;
        
        matchedUniversities.forEach((uni, index) => {
          recommendationsText += `**${index + 1}. ${uni.name}**\n`;
          recommendationsText += `📍 Location: ${uni.location || 'Not specified'}\n`;
          
          if (uni.description) {
            recommendationsText += `📝 About: ${uni.description.substring(0, 200)}...\n`;
          }
          
          // Show matching programs
          if (uni.programs.length > 0) {
            recommendationsText += `\n🎓 **Matching Programs:**\n`;
            uni.programs.slice(0, 3).forEach(program => {
              recommendationsText += `   • **${program.title}**\n`;
              recommendationsText += `     - Level: ${program.degree_level || 'Not specified'}\n`;
              if (program.tuition_fee) {
                recommendationsText += `     - Tuition: ${program.tuition_fee}\n`;
              }
              if (program.duration) {
                recommendationsText += `     - Duration: ${program.duration}\n`;
              }
              if (program.has_scholarships) {
                recommendationsText += `     - 💰 Scholarships Available`;
                if (program.scholarship_percentage) {
                  recommendationsText += ` (${program.scholarship_percentage})`;
                }
                recommendationsText += `\n`;
              }
            });
            
            if (uni.programs.length > 3) {
              recommendationsText += `   ... and ${uni.programs.length - 3} more programs\n`;
            }
          }
          
          if (uni.website) {
            recommendationsText += `🌐 Website: ${uni.website}\n`;
          }
          if (uni.contact_email) {
            recommendationsText += `📧 Contact: ${uni.contact_email}\n`;
          }
          
          recommendationsText += `\n---\n\n`;
        });
        
        recommendationsText += `**💡 Next Steps:**\n`;
        recommendationsText += `• Visit the university websites for detailed information\n`;
        recommendationsText += `• Contact admissions offices directly\n`;
        recommendationsText += `• Apply to programs that match your profile\n`;
        recommendationsText += `• Look into scholarship opportunities\n`;
      }

      recommendationsText += `\n*All recommendations are based on universities and programs available on our platform.*`;

      setResponses(prev => ({ 
        ...prev, 
        suggest_universities: recommendationsText
      }));
      
      toast({
        title: "Success",
        description: `Found ${matchedUniversities.length} matching ${matchedUniversities.length === 1 ? 'university' : 'universities'} from our database.`,
      });
      
      console.log('University suggestions completed successfully');
    } catch (error) {
      console.error('Error getting university suggestions:', error);
      
      // Fallback: still try to show some universities from database
      try {
        const { data: fallbackUnis } = await supabase
          .from('university_profiles')
          .select('id, name, location, description, website')
          .eq('is_published', true)
          .limit(5);

        const fallbackResponse = `⚠️ **Technical Issue Occurred**

I encountered an error while processing your specific criteria, but here are some universities available on our platform:

${fallbackUnis?.map((uni, index) => `
**${index + 1}. ${uni.name}**
📍 Location: ${uni.location || 'Not specified'}
${uni.description ? `📝 ${uni.description.substring(0, 150)}...` : ''}
${uni.website ? `🌐 ${uni.website}` : ''}
`).join('\n') || 'No universities found in database.'}

**To get better recommendations:**
1. Make sure all fields are filled correctly
2. Try adjusting your criteria slightly
3. Contact our support team for assistance

*Please try again or browse our universities directly.*`;

        setResponses(prev => ({ 
          ...prev, 
          suggest_universities: fallbackResponse
        }));
        
        toast({
          title: "Partial Results",
          description: "Showing available universities due to technical issues.",
        });
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        
        const errorResponse = `❌ **Unable to Load Recommendations**

I'm experiencing technical difficulties connecting to our university database.

**What you can do:**
1. Check your internet connection
2. Try refreshing the page
3. Browse universities manually from our homepage
4. Contact support if the issue persists

**Your Preferences:**
• Budget: ${preferences.budget}
• Location: ${preferences.location}
• Field: ${preferences.field}
• Level: ${preferences.level}

Please try again in a moment or contact our support team.`;

        setResponses(prev => ({ 
          ...prev, 
          suggest_universities: errorResponse
        }));
        
        toast({
          title: "Error",
          description: "Failed to connect to university database. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const generateChecklist = async () => {
    if (!preferences.targetCountry || !preferences.program) {
      toast({
        title: "Missing Information",
        description: "Please fill in both target country and program to generate a personalized checklist.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log('Generating checklist for:', { targetCountry: preferences.targetCountry, program: preferences.program });
    
    try {
      await callAIAssistant('generate_checklist', {
        targetCountry: preferences.targetCountry,
        program: preferences.program
      });
      console.log('Checklist generated successfully');
    } catch (error) {
      console.error('Error generating checklist:', error);
      // Provide fallback checklist
      const fallbackChecklist = `Application Checklist for ${preferences.program} in ${preferences.targetCountry}:

**Academic Documents:**
✓ Official transcripts from all institutions
✓ Degree certificates/diplomas
✓ Grade conversion (if applicable)
✓ Course descriptions/syllabi

**Test Scores:**
✓ Standardized test scores (SAT, GRE, GMAT as required)
✓ English proficiency test (TOEFL, IELTS, PTE)
✓ Subject-specific tests if required

**Application Materials:**
✓ Completed application forms
✓ Personal statement/statement of purpose
✓ Letters of recommendation (2-3)
✓ Resume/CV
✓ Portfolio (if applicable)

**Financial Documentation:**
✓ Bank statements
✓ Scholarship applications
✓ Financial aid forms
✓ Sponsor letters (if applicable)

**Additional Requirements:**
✓ Passport (valid for at least 6 months)
✓ Student visa application
✓ Medical examinations
✓ Background checks (if required)

**Important Notes:**
- Start preparing documents 6-12 months in advance
- Check specific requirements for each university
- Verify document translation and attestation needs
- Keep multiple copies of all documents

This is a general checklist. Please verify specific requirements with your target universities and consult with an education counselor for personalized guidance.`;

      setResponses(prev => ({ 
        ...prev, 
        generate_checklist: fallbackChecklist
      }));
      
      toast({
        title: "Checklist Generated",
        description: "Generated a general checklist based on your inputs (with limited AI functionality).",
      });
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    
    console.log('Asking AI question:', question);
    setAssistantLoading(true);
    
    try {
      await callAIAssistant('admissions_assistant', { question });
      console.log('Question sent successfully');
    } catch (error) {
      console.error('Error asking question:', error);
      // Show a fallback response if AI fails
      setResponses(prev => ({ 
        ...prev, 
        admissions_assistant: `Thank you for your question: "${question}"\n\nI'm here to help with university admissions, but I'm currently experiencing some technical difficulties. Here are some general tips:\n\n• Research universities that match your academic background and interests\n• Check admission requirements and deadlines early\n• Prepare required documents (transcripts, test scores, personal statements)\n• Look into scholarship opportunities\n• Consider reaching out to university admissions offices directly\n\nFor specific guidance, I recommend consulting with an education counselor or visiting university websites directly.`
      }));
    } finally {
      setAssistantLoading(false);
    }
    
    setQuestion('');
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-lg shadow-shadow/25">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Assistant</CardTitle>
          </div>
          <CardDescription>
            Get personalized guidance for your university applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="documents" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="universities" className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                Universities
              </TabsTrigger>
              <TabsTrigger value="checklist" className="flex items-center gap-1">
                <CheckSquare className="h-4 w-4" />
                Checklist
              </TabsTrigger>
              <TabsTrigger value="assistant" className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                Assistant
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Document Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered feedback on your uploaded documents
                </p>
                {documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.file_name}</p>
                            <Badge variant="outline" className="text-xs">
                              {doc.document_type}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          onClick={() => analyzeDocument(doc)}
                          disabled={loading}
                          size="sm"
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Analyze'}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    Upload documents to get AI analysis
                  </p>
                )}
                {responses.analyze_documents && (
                  <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Analysis Results:</h4>
                    <div className="whitespace-pre-wrap text-sm">
                      {responses.analyze_documents}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="universities" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">University Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Budget Range</Label>
                    <Input
                      id="budget"
                      placeholder="e.g., $20,000-30,000"
                      value={preferences.budget}
                      onChange={(e) => setPreferences(prev => ({ ...prev, budget: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Preferred Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., USA, Canada, UK"
                      value={preferences.location}
                      onChange={(e) => setPreferences(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="field">Field of Study</Label>
                    <Input
                      id="field"
                      placeholder="e.g., Computer Science"
                      value={preferences.field}
                      onChange={(e) => setPreferences(prev => ({ ...prev, field: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="level">Academic Level</Label>
                    <Input
                      id="level"
                      placeholder="e.g., Bachelor, Master"
                      value={preferences.level}
                      onChange={(e) => setPreferences(prev => ({ ...prev, level: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={suggestUniversities} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Get University Recommendations
                </Button>
                {responses.suggest_universities && (
                  <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Recommended Universities:</h4>
                    <div className="whitespace-pre-wrap text-sm">
                      {responses.suggest_universities}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="checklist" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Application Checklist</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetCountry">Target Country</Label>
                    <Input
                      id="targetCountry"
                      placeholder="e.g., United States"
                      value={preferences.targetCountry}
                      onChange={(e) => setPreferences(prev => ({ ...prev, targetCountry: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="program">Program Type</Label>
                    <Input
                      id="program"
                      placeholder="e.g., Master's in CS"
                      value={preferences.program}
                      onChange={(e) => setPreferences(prev => ({ ...prev, program: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={generateChecklist} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Generate Personalized Checklist
                </Button>
                {responses.generate_checklist && (
                  <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Your Application Checklist:</h4>
                    <div className="whitespace-pre-wrap text-sm">
                      {responses.generate_checklist}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="assistant" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Admissions Assistant</h3>
                <p className="text-sm text-muted-foreground">
                  Ask questions about study destinations, scholarships, or admission processes
                </p>
                
                {/* Sample Questions */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setQuestion("What are the best scholarships for international students?")}
                      disabled={assistantLoading}
                    >
                      Scholarships
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setQuestion("What documents do I need for university applications?")}
                      disabled={assistantLoading}
                    >
                      Documents
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setQuestion("How do I write a good personal statement?")}
                      disabled={assistantLoading}
                    >
                      Personal Statement
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Textarea
                    placeholder="Ask me anything about university admissions, scholarships, study destinations..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={askQuestion} disabled={assistantLoading || !question.trim()} className="w-full">
                    {assistantLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {assistantLoading ? 'Getting Response...' : 'Ask Assistant'}
                  </Button>
                </div>
                {responses.admissions_assistant && (
                  <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Assistant Response:</h4>
                    <div className="whitespace-pre-wrap text-sm">
                      {responses.admissions_assistant}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}