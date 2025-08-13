-- Create storage bucket for student documents
INSERT INTO storage.buckets (id, name, public) VALUES ('student-documents', 'student-documents', false);

-- Create policies for student document uploads
CREATE POLICY "Students can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'student-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'student-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'student-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'student-documents' AND auth.uid()::text = (storage.foldername(name))[1]);