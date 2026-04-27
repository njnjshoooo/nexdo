import { NavigationSettings, NavItem } from '../types/navigation';
import { v4 as uuidv4 } from 'uuid';
import { HEADER_ITEMS } from '../data/header';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'admin_navigation';
const TABLE_NAME = 'navigation';
const SINGLETON_ID = 1;

const DEFAULT_NAVIGATION: NavigationSettings = {
  items: HEADER_ITEMS
};

class NavigationService {
  private settings: NavigationSettings;

  constructor() {
    this.settings = DEFAULT_NAVIGATION;
    this.loadCache();
    if (isSupabaseConfigured) {
      this.refresh().catch((err) => console.warn('[navigationService] initial refresh failed', err));
    }
  }

  private mapRow(row: any): NavigationSettings {
    return { items: Array.isArray(row?.items) ? row.items : [] };
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
    if (isSupabaseConfigured) {
      // Don't seed defaults when Supabase is configured; wait for refresh()
      this.settings = { items: [] };
    } else {
      this.settings = DEFAULT_NAVIGATION;
      this.saveCache();
    }
  }

  private saveCache() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('[navigationService] saveCache failed', e);
    }
  }

  async refresh(): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', SINGLETON_ID)
      .maybeSingle();
    if (error) {
      console.warn('[navigationService] refresh failed', error);
      return;
    }
    if (data) {
      this.settings = this.mapRow(data);
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

  /**
   * Update navigation settings. Updates local cache synchronously,
   * then upserts to Supabase in the background.
   */
  updateSettings(settings: NavigationSettings): void {
    this.settings = settings;
    this.saveCache();

    if (isSupabaseConfigured) {
      supabase
        .from(TABLE_NAME)
        .upsert({
          id: SINGLETON_ID,
          items: settings.items,
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) {
            console.error('[navigationService] updateSettings failed in Supabase', error);
            throw new Error(`更新失敗：${error.message}`);
          }
        });
    }
  }

  syncSubItemToNavigation(slug: string, parentSlug: string, pageTitle: string, pageUrl: string) {
    let hasChanges = false;
    const removeItem = (items: NavItem[]): NavItem[] => {
      return items.filter(item => {
        if (item.pageSlug === slug) {
          hasChanges = true;
          return false;
        }
        if (item.children) {
          const newChildren = removeItem(item.children);
          if (newChildren.length !== item.children.length) {
            item.children = newChildren;
            hasChanges = true;
          }
        }
        return true;
      });
    };
    this.settings.items = removeItem(this.settings.items);

    const addItemToParent = (items: NavItem[]): boolean => {
      for (const item of items) {
        if (item.pageSlug === parentSlug) {
          if (!item.children) item.children = [];
          item.children.push({
            id: uuidv4(), label: pageTitle, url: pageUrl, openInNewWindow: false,
            templateType: 'SUB_ITEM', pageSlug: slug, isCustomLabel: false,
            parentId: parentSlug
          });
          hasChanges = true;
          return true;
        }
        if (item.children && addItemToParent(item.children)) return true;
      }
      return false;
    };

    if (parentSlug) addItemToParent(this.settings.items);
    if (hasChanges) {
      // Persist via the standard updateSettings path so Supabase gets updated too
      this.updateSettings({ items: this.settings.items });
    }
  }
}

export const navigationService = new NavigationService();
