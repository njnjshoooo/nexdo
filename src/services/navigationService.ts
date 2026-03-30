import { NavigationSettings, NavItem } from '../types/navigation';
import { v4 as uuidv4 } from 'uuid';
import { HEADER_ITEMS } from '../data/header';

const DEFAULT_NAVIGATION: NavigationSettings = {
  items: HEADER_ITEMS
};

class NavigationService {
  private settings: NavigationSettings;

  constructor() {
    const stored = localStorage.getItem('admin_navigation');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.items)) {
          this.settings = parsed;
        } else {
          this.settings = DEFAULT_NAVIGATION;
        }
      } catch (e) {
        this.settings = DEFAULT_NAVIGATION;
      }
    } else {
      this.settings = DEFAULT_NAVIGATION;
      this.save();
    }
  }

  private save() {
    localStorage.setItem('admin_navigation', JSON.stringify(this.settings));
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

  updateSettings(settings: NavigationSettings) {
    this.settings = settings;
    this.save();
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
    if (hasChanges) this.save();
  }
}

export const navigationService = new NavigationService();
