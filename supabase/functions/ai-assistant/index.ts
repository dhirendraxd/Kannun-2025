import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyCzxr8szb8KZhBdcu3b1QsBth566xY5xB8';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data, userId } = await req.json();
    
    let prompt = '';
    let context = '';
    
    // Get user profile for context
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: profile } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profile) {
      context = `Student Profile Context:
      Name: ${profile.full_name || 'Not provided'}
      Email: ${profile.email || 'Not provided'}
      Country: ${profile.country || 'Not provided'}
      Year of Study: ${profile.year_of_study || 'Not provided'}
      Specialization: ${profile.specialization || 'Not provided'}
      GPA: ${profile.gpa || 'Not provided'}
      Bio: ${profile.bio || 'Not provided'}`;
    }

    switch (action) {
      case 'analyze_documents':
        prompt = `${context}

As an expert admissions consultant, analyze the following document content and provide specific improvement tips:

Document Type: ${data.documentType}
Content Summary: ${data.content || 'Document uploaded but content not extractable'}

Provide:
1. Strengths of the document
2. Areas for improvement
3. Specific actionable recommendations
4. Format and structure suggestions
5. Content suggestions to make it more compelling

Be specific and actionable in your advice.`;
        break;

      case 'suggest_universities':
        prompt = `${context}

Based on the student's profile above and these preferences:
Budget Range: ${data.budget || 'Not specified'}
Preferred Location: ${data.location || 'Not specified'}
Field of Study: ${data.field || profile?.specialization || 'Not specified'}
Academic Level: ${data.level || 'Not specified'}

As an expert education consultant, suggest 5-7 universities that would be the best fit. For each university, provide:
1. University name and location
2. Why it's a good fit for this student
3. Estimated tuition and living costs
4. Key programs/specializations
5. Admission requirements
6. Application deadlines
7. Scholarships available

Focus on realistic options based on the student's profile.`;
        break;

      case 'generate_checklist':
        prompt = `${context}

Create a personalized application checklist for this student applying to universities in ${data.targetCountry || 'their preferred destination'} for ${data.program || 'their chosen program'}.

Include:
1. Pre-application tasks (3-6 months before)
2. Application materials needed
3. Important deadlines and timelines
4. Required documents and their preparation
5. Test requirements (IELTS, TOEFL, GRE, etc.)
6. Financial documentation needed
7. Post-application follow-ups

Make it specific to their profile and target destination. Include approximate timelines and priority levels.`;
        break;

      case 'admissions_assistant':
        prompt = `${context}

Student Question: ${data.question}

As a knowledgeable admissions assistant, provide a comprehensive answer about:
- Study destinations and their benefits
- Scholarship opportunities
- Admission processes and requirements
- Tips for international students
- Visa and immigration guidance
- Academic and career advice

Be helpful, accurate, and encouraging. If the question is outside your scope, suggest where they can find more specific information.`;
        break;

      default:
        throw new Error('Invalid action specified');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${await response.text()}`);
    }

    const result = await response.json();
    const generatedText = result.candidates[0]?.content?.parts[0]?.text || 'No response generated';

    return new Response(JSON.stringify({ 
      success: true, 
      response: generatedText,
      action: action 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI assistant:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});