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

  /** 同步寫入 Supabase + localStorage */
  async save(settings: any): Promise<void> {
    // 先寫 localStorage 快取
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
        console.error('[siteSettingsService] save failed in Supabase', error);
        throw new Error(`儲存失敗：${error.message}`);
      }
    }
  },
};
