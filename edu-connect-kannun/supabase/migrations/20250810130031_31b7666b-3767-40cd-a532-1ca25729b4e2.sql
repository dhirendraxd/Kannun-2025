-- Create student_profiles table for storing student profile information
CREATE TABLE public.student_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  email text,
  phone text,
  country text,
  specialization text,
  year_of_study text,
  gpa text,
  bio text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for student profiles
CREATE POLICY "Users can view their own student profile" 
ON public.student_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own student profile" 
ON public.student_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own student profile" 
ON public.student_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create student_documents table for document uploads
CREATE TABLE public.student_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  document_type text NOT NULL,
  file_name text,
  file_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for student documents
CREATE POLICY "Users can view their own documents" 
ON public.student_documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" 
ON public.student_documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
ON public.student_documents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
ON public.student_documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create student_saved_universities table for saved universities
CREATE TABLE public.student_saved_universities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  university_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, university_id)
);

-- Enable RLS
ALTER TABLE public.student_saved_universities ENABLE ROW LEVEL SECURITY;

-- Create policies for saved universities
CREATE POLICY "Users can view their own saved universities" 
ON public.student_saved_universities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved universities" 
ON public.student_saved_universities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved universities" 
ON public.student_saved_universities 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create student_applications table for university applications
CREATE TABLE public.student_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  university_id uuid NOT NULL,
  program_id uuid,
  status text NOT NULL DEFAULT 'submitted',
  application_date timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, university_id, program_id)
);

-- Enable RLS
ALTER TABLE public.student_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for applications
CREATE POLICY "Users can view their own applications" 
ON public.student_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications" 
ON public.student_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" 
ON public.student_applications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_student_profiles_updated_at
BEFORE UPDATE ON public.student_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_documents_updated_at
BEFORE UPDATE ON public.student_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_applications_updated_at
BEFORE UPDATE ON public.student_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER TABLE public.student_profiles REPLICA IDENTITY FULL;
ALTER TABLE public.student_documents REPLICA IDENTITY FULL;
ALTER TABLE public.student_saved_universities REPLICA IDENTITY FULL;
ALTER TABLE public.student_applications REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_saved_universities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_applications;