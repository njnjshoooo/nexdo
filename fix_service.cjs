const fs = require('fs');
let code = fs.readFileSync('src/services/siteSettingsService.ts', 'utf8');

const target = `  /** 同步寫入 Supabase + localStorage。Supabase 失敗不會 throw，僅警告 */
  async save(settings: any): Promise<{ supabaseOk: boolean; warning?: string }> {
    // 先寫 localStorage 快取（一定成功）
    try { 
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      window.dispatchEvent(new Event('siteSettingsUpdated'));
    } catch {}

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
            warning: '⚠️ Supabase 尚未建立 site_settings 表，目前僅儲存到本地瀏覽器。請至 Supabase SQL Editor 執行建表指令。'
          };
        }
        return { supabaseOk: false, warning: \`Supabase 儲存失敗：\${error.message}（已存到本地快取）\` };
      }
    }

    return { supabaseOk: true };
  },`;

const replacement = `  /** 同步寫入 Supabase + localStorage。Supabase 失敗不會 throw，僅警告 */
  async save(settings: any): Promise<{ supabaseOk: boolean; warning?: string }> {
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
            warning: '⚠️ Supabase 尚未建立 site_settings 表，無法儲存。請至 Supabase SQL Editor 執行建表指令。'
          };
        }
        return { supabaseOk: false, warning: \`Supabase 儲存失敗：\${error.message}\` };
      }
    }

    // 只有當 Supabase 儲存成功（或未配置 Supabase）時，才更新本地快取
    try { 
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      window.dispatchEvent(new Event('siteSettingsUpdated'));
    } catch {}

    return { supabaseOk: true };
  },`;

if (code.includes('try { \n      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));')) {
    // try replacing with regex
}
code = code.replace(target, replacement);
fs.writeFileSync('src/services/siteSettingsService.ts', code);
