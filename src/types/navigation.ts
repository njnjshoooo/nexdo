export type NavItemTemplateType = 'HOME' | 'MAJOR_ITEM' | 'SUB_ITEM' | 'GENERAL' | 'EXTERNAL';

export interface NavItem {
  id: string;
  label: string;
  url: string;
  subtitle?: string;
  openInNewWindow: boolean;
  templateType?: NavItemTemplateType;
  children?: NavItem[];
  pageSlug?: string;
  parentId?: string;
  isCustomLabel?: boolean;
}

export interface NavigationSettings {
  items: NavItem[];
}
