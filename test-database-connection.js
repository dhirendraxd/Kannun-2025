// Test database connection and view available programs
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pkpttvubfkijdmwylopb.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrcHR0dnViZmtpamRtd3lsb3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0ODUwMzcsImV4cCI6MjA3MDA2MTAzN30.MF98rZhleYzmndjSPhc0-1WTX6MJLu_KIJxu6v-izXI'
);

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');

  // 1. Check university programs table
  console.log('\n📚 Checking university_programs table...');
  const { data: programs, error: programsError } = await supabase
    .from('university_programs')
    .select(`
      id,
      title,
      degree_level,
      duration,
      tuition_fee,
      has_scholarships,
      scholarship_percentage,
      is_published,
      university:university_profiles!university_programs_university_id_fkey(
        name,
        location
      )
    `)
    .eq('is_published', true)
    .limit(5);

  if (programsError) {
    console.error('❌ Error fetching programs:', programsError.message);
  } else if (programs && programs.length > 0) {
    console.log(`✅ Found ${programs.length} published programs (showing first 5):`);
    programs.forEach((program, index) => {
      console.log(`\n${index + 1}. ${program.title}`);
      console.log(`   University: ${program.university?.name || 'Not specified'}`);
      console.log(`   Degree Level: ${program.degree_level || 'Not specified'}`);
      console.log(`   Duration: ${program.duration || 'Not specified'}`);
      console.log(`   Tuition: ${program.tuition_fee || 'Not specified'}`);
      console.log(`   Scholarships: ${program.has_scholarships ? 'Available' : 'Not available'}`);
      if (program.scholarship_percentage) {
        console.log(`   Scholarship %: ${program.scholarship_percentage}`);
      }
    });
  } else {
    console.log('⚠️ No published programs found in database');
  }

  // 2. Check total count
  const { count: totalPrograms } = await supabase
    .from('university_programs')
    .select('id', { count: 'exact' })
    .eq('is_published', true);
  
  console.log(`\n📊 Total published programs in database: ${totalPrograms || 0}`);

  // 3. Check student documents table structure
  console.log('\n📄 Checking student_documents table structure...');
  const { data: sampleDoc, error: docError } = await supabase
    .from('student_documents')
    .select('*')
    .limit(1);

  if (docError) {
    console.error('❌ Error accessing student_documents:', docError.message);
  } else if (sampleDoc && sampleDoc.length > 0) {
    console.log('✅ Student documents table structure:');
    console.log('   Columns:', Object.keys(sampleDoc[0]).sort());
  } else {
    console.log('ℹ️ Student documents table exists but is empty');
  }

  // 4. Check for degree level variety
  console.log('\n🎓 Checking degree level variety...');
  const { data: degreeLevels, error: degreeError } = await supabase
    .from('university_programs')
    .select('degree_level')
    .eq('is_published', true);

  if (!degreeError && degreeLevels) {
    const uniqueDegreeLevels = [...new Set(degreeLevels.map(d => d.degree_level).filter(Boolean))];
    console.log('✅ Available degree levels:', uniqueDegreeLevels);
  }
}

testDatabaseConnection().catch(console.error);
