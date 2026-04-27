import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client — supports graceful fallback when env vars are missing.
 *
 * 設計原則：
 *   - 若 VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY 未設定，
 *     `supabase` 仍會被建立（但會是 dummy），且 `isSupabaseConfigured` = false
 *   - Service 層應在每個方法開頭檢查 `isSupabaseConfigured`，
 *     未設定時回落到 localStorage
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// 若未設定，建立一個 placeholder client（呼叫會失敗，但不會 crash）
// 這讓 services 可以無條件 import supabase，減少樣板程式碼
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: isSupabaseConfigured,
      autoRefreshToken: isSupabaseConfigured,
    },
  }
);

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 未設定，' +
    'services 將回落至 localStorage 模式。'
  );
}
