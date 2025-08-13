-- Run this SQL in your Supabase Dashboard SQL Editor
-- Go to https://supabase.com/dashboard/project/pkpttvubfkijdmwylopb
-- Navigate to "SQL Editor" and run this script

-- Add additional fields for program requirements and scholarships
ALTER TABLE public.university_programs 
ADD COLUMN IF NOT EXISTS special_requirements TEXT,
ADD COLUMN IF NOT EXISTS additional_criteria TEXT,
ADD COLUMN IF NOT EXISTS has_scholarships BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS scholarship_type TEXT,
ADD COLUMN IF NOT EXISTS scholarship_criteria TEXT,
ADD COLUMN IF NOT EXISTS scholarship_amount TEXT,
ADD COLUMN IF NOT EXISTS scholarship_percentage TEXT;

-- Add comments for clarity
COMMENT ON COLUMN public.university_programs.special_requirements IS 'Special requirements like minimum GPA, test scores, etc.';
COMMENT ON COLUMN public.university_programs.additional_criteria IS 'Additional criteria or prerequisites for the program';
COMMENT ON COLUMN public.university_programs.has_scholarships IS 'Whether scholarships are available for this program';
COMMENT ON COLUMN public.university_programs.scholarship_type IS 'Type of scholarship (Merit-based, Need-based, Sports, etc.)';
COMMENT ON COLUMN public.university_programs.scholarship_criteria IS 'Criteria for scholarship eligibility';
COMMENT ON COLUMN public.university_programs.scholarship_amount IS 'Fixed scholarship amount if applicable';
COMMENT ON COLUMN public.university_programs.scholarship_percentage IS 'Percentage of tuition covered by scholarship';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'university_programs' 
AND table_schema = 'public'
ORDER BY ordinal_position;
