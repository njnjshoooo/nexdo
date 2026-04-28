/**
 * 修補 Supabase navigation：用 src/data/header.ts 的完整 HEADER_ITEMS 蓋過去
 * 這修正前台「我們的服務」下拉選單沒出現的問題
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://dmuqabrxzoctalflljcz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtdXFhYnJ4em9jdGFsZmxsamN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNzg4MzAsImV4cCI6MjA5Mjg1NDgzMH0.dGeJn0Z_ATKsrL97_HMbk--gO3kcb70T5lEvT41vgYo'
);

await supabase.auth.signInWithPassword({ email: 'admin@nexdo.com', password: 'Admin123456' });

const { HEADER_ITEMS } = await import('./src/data/header.ts');

console.log(`Updating navigation with ${HEADER_ITEMS.length} top-level items…`);
HEADER_ITEMS.forEach(it => console.log(`  - ${it.label} (${it.children?.length || 0} children)`));

const { error } = await supabase.from('navigation').upsert({
  id: 1,
  items: HEADER_ITEMS,
  updated_at: new Date().toISOString(),
}, { onConflict: 'id' });

if (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}
console.log('\n✅ Navigation updated successfully!');
