import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dmuqabrxzoctalflljcz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtdXFhYnJ4em9jdGFsZmxsamN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNzg4MzAsImV4cCI6MjA5Mjg1NDgzMH0.dGeJn0Z_ATKsrL97_HMbk--gO3kcb70T5lEvT41vgYo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  let { data: products } = await supabase.from('products').select('id');
  let { data: pages } = await supabase.from('pages').select('id');
  let { data: sub_items } = await supabase.from('sub_item_pages').select('id');
  
  console.log('Products count:', products?.length, products);
  console.log('Pages count:', pages?.length, pages);
  console.log('Sub_items count:', sub_items?.length, sub_items);
}
test();
