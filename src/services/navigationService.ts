import { NavigationSettings, NavItem } from '../types/navigation';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'admin_navigation';
const TABLE_NAME = 'navigation';

// 💡 輔助函式：在 Service 內部將資料庫撈出來的 Flat Rows 還原成前端需要的樹狀 items 結構
function unflattenService(flattenedItems: any[]): NavItem[] {
  const root: NavItem[] = [];
  const map: Record<string, NavItem> = {};
  
  flattenedItems.forEach(item => {
    map[item.id] = { 
      id: item.id,
      label: item.label,
      url: item.url,
      templateType: item.template_type,
      pageSlug: item.page_slug,
      openInNewWindow: item.open_in_new_window ?? false,
      children: [] 
    };
  });
  
  // 依資料庫的 sort_order 排序
  const sortedItems = [...flattenedItems].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  sortedItems.forEach(item => {
    const node = map[item.id];
    if (!node) return;
    
    if (!item.parent_id) {
      root.push(node);
    } else {
      if (map[item.parent_id]) {
        map[item.parent_id].children!.push(node);
      } else {
        root.push(node);
      }
    }
  });
  return root;
}

class NavigationService {
  private settings: NavigationSettings;

  constructor() {
    this.settings = { items: [] };
    this.loadCache();
    if (isSupabaseConfigured) {
      this.refresh().catch((err) => console.warn('[navigationService] initial refresh failed', err));
    }
  }

  private loadCache() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.items)) {
          this.settings = parsed;
          return;
        }
      } catch (e) {
        // fall through
      }
    }
    this.settings = { items: [] };
  }

  private saveCache() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('[navigationService] saveCache failed', e);
    }
  }

  // 💡 修正 1：改為撈取「整張資料表的所有資料」，排序後重組成樹狀結構
  async refresh(): Promise<void> {
    if (!isSupabaseConfigured) return;
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('sort_order', { ascending: true }); // 依順序抓取

    if (error) {
      console.warn('[navigationService] refresh failed', error);
      return;
    }

    if (data && data.length > 0) {
      // 將資料庫的扁平 Rows 轉回前端巢狀樹狀結構
      const treeItems = unflattenService(data);
      this.settings = { items: treeItems };
      this.saveCache();
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('navigation_refreshed'));
      }
    }
  }

  getSettings(): NavigationSettings {
    return this.settings;
  }

  getResolvedSettings(pages: any[]): NavigationSettings {
    const resolveItems = (items: NavItem[]): NavItem[] => {
      if (!Array.isArray(items)) return [];
      return items.map(item => {
        let resolvedLabel = item.label;
        if (item.pageSlug && !item.isCustomLabel) {
          const page = pages.find(p => p.id === item.pageSlug || p.slug === item.pageSlug);
          if (page) {
            resolvedLabel = page.title;
          }
        }
        return {
          ...item,
          label: resolvedLabel,
          children: item.children ? resolveItems(item.children) : undefined
        };
      });
    };
    return { items: resolveItems(this.settings.items) };
  }

  // 💡 修正 2：更新時，接收打平好的 dbItems 陣列，直接對資料表進行「全刪、全插」
  async updateSettings(dbItems: any): Promise<void> {
    // 為了安全相容：檢查傳進來的是否為陣列。
    // 如果是舊的物件格式 { items: [...] }，就報錯提示；我們在 Editor 裡已經改成傳陣列了。
    if (!Array.isArray(dbItems)) {
      console.error('[navigationService] updateSettings 預期收到扁平陣列，請確保 Editor 傳入的是 dbItems');
      return;
    }

    // 同步更新記憶體與本機快取（需要先把陣列還原回樹狀，這樣前台重新整理前才看得到最新狀態）
    this.settings = { items: unflattenService(dbItems) };
    this.saveCache();

    if (isSupabaseConfigured) {
      // 1. 刪除資料表裡面的舊 Rows
      const { error: deleteError } = await supabase
        .from(TABLE_NAME)
        .delete()
        .not('id', 'is', null);

      if (deleteError) {
        console.error('[navigationService] 清空舊導覽列失敗', deleteError);
        throw new Error(`更新失敗：${deleteError.message}`);
      }

      // 2. 寫入全新的新排序 Rows
      if (dbItems.length > 0) {
        const { error: insertError } = await supabase
          .from(TABLE_NAME)
          .insert(dbItems);

        if (insertError) {
          console.error('[navigationService] 寫入新導覽列失敗', insertError);
          throw new Error(`更新失敗：${insertError.message}`);
        }
      }
    }
  }
}

export const navigationService = new NavigationService();