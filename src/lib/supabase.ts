import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * isSupabaseConfigured:
 * - true  → 環境變數已設定，使用 Supabase
 * - false → 沒有設定環境變數，fallback 到 localStorage
 */
export const isSupabaseConfigured =
  !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== '';

// 建立 Supabase client（即使沒設定，也給一個 dummy 避免 import 報錯）
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : (null as unknown as SupabaseClient);

/**
 * 安全地呼叫 Supabase — 如果沒設定則回傳 null
 */
export function getSupabase(): SupabaseClient | null {
  return isSupabaseConfigured ? supabase : null;
}
