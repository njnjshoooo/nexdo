import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client — supports graceful fallback when env vars are missing.
 *
 * 設計原則：
 *   - 若 VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY 未設定，
 *     `supabase` 仍會被建立（但會是 dummy），且 `isSupabaseConfigured` = false
 *   - Service 層應在每個方法開頭檢查 `isSupabaseConfigured`，
 *     未設定時回落到 localStorage
 *
 * 重要修正：
 *   - 用 noop lock 取代預設的 Web Locks，避免在 React StrictMode 下
 *     雙重 mount 造成 auth-token lock 互相搶鎖、所有 query hang 5 秒以上
 *   - 顯式指定 storageKey，確保不同分頁/視窗共享同一個 token
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// noop lock：跳過 Web Locks，直接執行回呼
// 解決 "Lock 'lock:sb-xxx-auth-token' was not released within 5000ms" 警告與 query 卡住問題
const noopLock = async <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => fn();

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: isSupabaseConfigured,
      autoRefreshToken: isSupabaseConfigured,
      detectSessionInUrl: false,
      lock: noopLock,
    },
  }
);

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 未設定，' +
    'services 將回落至 localStorage 模式。'
  );
}
