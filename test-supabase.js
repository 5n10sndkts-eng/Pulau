import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test 1: Connection
console.log('Test 1: Checking connection...');
try {
  const { data, error } = await supabase.from('experiences').select('count');
  if (error) {
    console.log('❌ Connection failed:', error.message);
  } else {
    console.log('✅ Connected to Supabase!');
  }
} catch (err) {
  console.log('❌ Error:', err.message);
}

// Test 2: Fetch experiences
console.log('\nTest 2: Fetching experiences...');
try {
  const { data, error } = await supabase
    .from('experiences')
    .select('id, title')
    .limit(5);
  
  if (error) {
    console.log('❌ Fetch failed:', error.message);
  } else if (data && data.length > 0) {
    console.log(`✅ Found ${data.length} experiences:`);
    data.forEach(exp => console.log(`  - ${exp.title}`));
  } else {
    console.log('⚠️  No experiences found (table might be empty)');
  }
} catch (err) {
  console.log('❌ Error:', err.message);
}

// Test 3: Check auth
console.log('\nTest 3: Checking auth configuration...');
try {
  const { data: { session } } = await supabase.auth.getSession();
  console.log('✅ Auth configured:', session ? 'Logged in' : 'Anonymous');
} catch (err) {
  console.log('❌ Auth error:', err.message);
}

console.log('\n✅ Supabase test complete!');
