-- Create table for students to save/bookmark programs/courses
CREATE TABLE IF NOT EXISTS student_saved_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES university_programs(id) ON DELETE CASCADE,
    university_id UUID NOT NULL REFERENCES university_profiles(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, program_id) -- Prevent duplicate saves
);

-- Add RLS policies
ALTER TABLE student_saved_programs ENABLE ROW LEVEL SECURITY;

-- Students can view their own saved programs
CREATE POLICY "Students can view own saved programs" ON student_saved_programs
    FOR SELECT USING (student_id = auth.uid());

-- Students can save programs
CREATE POLICY "Students can save programs" ON student_saved_programs
    FOR INSERT WITH CHECK (student_id = auth.uid());

-- Students can unsave programs
CREATE POLICY "Students can delete own saved programs" ON student_saved_programs
    FOR DELETE USING (student_id = auth.uid());

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_programs_student ON student_saved_programs(student_id);
CREATE INDEX IF NOT EXISTS idx_saved_programs_program ON student_saved_programs(program_id);
CREATE INDEX IF NOT EXISTS idx_saved_programs_university ON student_saved_programs(university_id);

-- Update function for updated_at
CREATE TRIGGER update_saved_programs_updated_at
    BEFORE UPDATE ON student_saved_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime
ALTER TABLE student_saved_programs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE student_saved_programs;
