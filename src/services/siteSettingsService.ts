import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'siteSettings';
const TABLE_NAME = 'site_settings';
const SINGLETON_ID = 1;

export const siteSettingsService = {
  /** 從 Supabase 載入設定（fallback 至 localStorage） */
  async load<T = any>(): Promise<T | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(TABLE_NAME)
          .select('data')
          .eq('id', SINGLETON_ID)
          .maybeSingle();
        if (!error && data?.data) {
          // 寫回 localStorage 作為快取
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data.data)); } catch {}
          return data.data as T;
        }
      } catch (e) {
        console.warn('[siteSettingsService] load from Supabase failed', e);
      }
    }
    // Fallback：localStorage
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  },

  /** 同步寫入 Supabase + localStorage。Supabase 失敗不會 throw，僅警告 */
  async save(settings: any): Promise<{ supabaseOk: boolean; warning?: string }> {
    // 先寫 localStorage 快取（一定成功）
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch {}

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from(TABLE_NAME)
        .upsert({
          id: SINGLETON_ID,
          data: settings,
          updated_at: new Date().toISOString(),
        });
      if (error) {
        console.warn('[siteSettingsService] save to Supabase failed', error);
        // 若 table 不存在，給友善提示
        if (error.message.includes('relation') || error.message.includes('site_settings') || error.code === '42P01') {
          return {
            supabaseOk: false,
            warning: '⚠️ Supabase 尚未建立 site_settings 表，目前僅儲存到本地瀏覽器。請聯繫管理員執行 SQL 建表。'
          };
        }
        return { supabaseOk: false, warning: `Supabase 儲存失敗：${error.message}（已存到本地快取）` };
      }
    }
    return { supabaseOk: true };
  },
};
