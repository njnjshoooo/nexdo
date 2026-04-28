import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dmuqabrxzoctalflljcz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtdXFhYnJ4em9jdGFsZmxsamN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNzg4MzAsImV4cCI6MjA5Mjg1NDgzMH0.dGeJn0Z_ATKsrL97_HMbk--gO3kcb70T5lEvT41vgYo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('pages').select('*').eq('slug', 'about');
  console.log(JSON.stringify({ data, error }, null, 2));
}
test();
