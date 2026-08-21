import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('submissions').select('id').limit(1);
  console.log("Submissions Data:", data);
  console.log("Error:", error);
}
run();
