import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dmuqabrxzoctalflljcz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtdXFhYnJ4em9jdGFsZmxsamN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNzg4MzAsImV4cCI6MjA5Mjg1NDgzMH0.dGeJn0Z_ATKsrL97_HMbk--gO3kcb70T5lEvT41vgYo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('pages').select().limit(1);
  console.log('Pages table query test:', error, data);

  // You can also try taking a look at information schema or throwing custom SQL but postgrest doesn't allow raw sql easily.
  // Instead let's just insert a dummy with all columns and see which one fails, or if it succeeds.
}
test();
