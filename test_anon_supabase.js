import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);
async function run() {
  const { data: pages, error: err1 } = await supabase.from('pages').select('slug, updated_at, is_published').eq('is_published', true);
  console.log("Pages:", pages ? pages.length : err1);
}
run();
