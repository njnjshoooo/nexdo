import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('submissions').insert({
    id: 'test-123',
    form_id: 'test-form',
    data: { name: 'test' },
    status: 'PENDING',
    created_at: new Date().toISOString()
  }).select();
  console.log("Error:", error);
  console.log("Data:", data);
}
test();
