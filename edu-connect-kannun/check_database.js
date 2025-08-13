import { createClient } from '@supabase/supabase-js';

// Create supabase client directly for testing
const SUPABASE_URL = "https://pkpttvubfkijdmwylopb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrcHR0dnViZmtpamRtd3lsb3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0ODUwMzcsImV4cCI6MjA3MDA2MTAzN30.MF98rZhleYzmndjSPhc0-1WTX6MJLu_KIJxu6v-izXI";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Test script to check database schema
async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking database connection and schema...');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('university_programs')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Check what columns exist in the first program
    if (testData && testData.length > 0) {
      console.log('📋 Available columns in university_programs table:');
      console.log(Object.keys(testData[0]).sort());
      
      // Check if new columns exist
      const newColumns = [
        'special_requirements',
        'additional_criteria', 
        'has_scholarships',
        'scholarship_type',
        'scholarship_criteria',
        'scholarship_amount',
        'scholarship_percentage'
      ];
      
      const existingNewColumns = newColumns.filter(col => testData[0].hasOwnProperty(col));
      const missingColumns = newColumns.filter(col => !testData[0].hasOwnProperty(col));
      
      if (existingNewColumns.length > 0) {
        console.log('✅ New columns that exist:', existingNewColumns);
      }
      
      if (missingColumns.length > 0) {
        console.log('⚠️ Missing columns that need to be added:', missingColumns);
        console.log('\n📝 To fix this, run the SQL in apply_migration.sql in your Supabase dashboard');
      }
      
      if (missingColumns.length === 0) {
        console.log('🎉 All new columns exist! Your migration has been applied successfully.');
      }
    } else {
      console.log('ℹ️ No programs found in database to check schema');
    }
    
  } catch (error) {
    console.error('❌ Error checking database schema:', error);
  }
}

// Run the check
checkDatabaseSchema();
