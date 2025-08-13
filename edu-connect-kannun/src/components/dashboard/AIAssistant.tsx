import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Brain, FileText, GraduationCap, CheckSquare, MessageCircle, Loader2 } from 'lucide-react';

interface AIAssistantProps {
  userId: string;
  documents: any[];
}

export function AIAssistant({ userId, documents }: AIAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [question, setQuestion] = useState('');
  const [preferences, setPreferences] = useState({
    budget: '',
    location: '',
    field: '',
    level: 'Bachelor',
    targetCountry: '',
    program: ''
  });

  const callAIAssistant = async (action: string, data: any) => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-assistant', {
        body: { action, data, userId }
      });

      if (error) throw error;

      if (result.success) {
        setResponses(prev => ({ ...prev, [action]: result.response }));
        toast.success('AI analysis completed!');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('AI Assistant error:', error);
      toast.error('Failed to get AI response: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeDocument = async (doc: any) => {
    await callAIAssistant('analyze_documents', {
      documentType: doc.document_type,
      content: `Document: ${doc.file_name}`
    });
  };

  const suggestUniversities = async () => {
    await callAIAssistant('suggest_universities', preferences);
  };

  const generateChecklist = async () => {
    await callAIAssistant('generate_checklist', {
      targetCountry: preferences.targetCountry,
      program: preferences.program
    });
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    await callAIAssistant('admissions_assistant', { question });
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
                <div className="space-y-3">
                  <Textarea
                    placeholder="Ask me anything about university admissions, scholarships, study destinations..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={askQuestion} disabled={loading || !question.trim()} className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Ask Assistant
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