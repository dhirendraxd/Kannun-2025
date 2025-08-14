-- Create table for tracking documents shared with universities during applications
CREATE TABLE IF NOT EXISTS student_university_shared_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    university_id UUID NOT NULL REFERENCES university_profiles(id) ON DELETE CASCADE,
    application_id UUID REFERENCES student_applications(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES student_documents(id) ON DELETE CASCADE,
    shared_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'approved', 'rejected')),
    university_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE student_university_shared_documents ENABLE ROW LEVEL SECURITY;

-- Students can view their own shared documents
CREATE POLICY "Students can view own shared documents" ON student_university_shared_documents
    FOR SELECT USING (student_id = auth.uid());

-- Students can insert their own shared documents (when applying)
CREATE POLICY "Students can share own documents" ON student_university_shared_documents
    FOR INSERT WITH CHECK (student_id = auth.uid());

-- Universities can view documents shared with them
CREATE POLICY "Universities can view shared documents" ON student_university_shared_documents
    FOR SELECT USING (
        university_id IN (
            SELECT id FROM university_profiles WHERE user_id = auth.uid()
        )
    );

-- Universities can update status and add notes for documents shared with them
CREATE POLICY "Universities can update shared document status" ON student_university_shared_documents
    FOR UPDATE USING (
        university_id IN (
            SELECT id FROM university_profiles WHERE user_id = auth.uid()
        )
    );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_shared_docs_student ON student_university_shared_documents(student_id);
CREATE INDEX IF NOT EXISTS idx_shared_docs_university ON student_university_shared_documents(university_id);
CREATE INDEX IF NOT EXISTS idx_shared_docs_application ON student_university_shared_documents(application_id);

-- Update function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_shared_documents_updated_at
    BEFORE UPDATE ON student_university_shared_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
