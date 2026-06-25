import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let cached: SupabaseClient | null = null;

// 用 service role 繞過 RLS，serverless 函式專用，前端絕不可拿到
export function getSupabaseAdmin(): SupabaseClient {
  if (!url) throw new Error('Missing SUPABASE_URL / VITE_SUPABASE_URL');
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  if (cached) return cached;
  cached = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
