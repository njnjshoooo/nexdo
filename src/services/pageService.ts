import { Page, TemplateType, DEFAULT_MAJOR_ITEM_TEMPLATE, DEFAULT_SUB_ITEM_TEMPLATE } from '../types/admin';
import { v4 as uuidv4 } from 'uuid';
import { allInitialPages } from '../data/pages/index';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

class PageService {
  private pages: Page[] = [];
  private readonly VERSION = '1.0.13';

  constructor() {
    const storedPages = localStorage.getItem('admin_pages');
    const storedVersion = localStorage.getItem('admin_pages_version');
    if (storedPages && storedVersion === this.VERSION) {
      this.pages = JSON.parse(storedPages);

      // Ensure blog page exists and has correct template
      const blogIndex = this.pages.findIndex(p => p.slug === 'blog');
      if (blogIndex === -1) {
        const blogPage = allInitialPages.find(p => p.slug === 'blog');
        if (blogPage) {
          this.pages.push(blogPage);
          this.saveToCache();
        }
      } else if (this.pages[blogIndex].template !== 'BLOG') {
        // Force the blog page to be a BLOG template if it was created as something else
        this.pages[blogIndex].template = 'BLOG';
        if (!this.pages[blogIndex].content.blog) {
          const defaultBlog = allInitialPages.find(p => p.slug === 'blog');
          this.pages[blogIndex].content.blog = defaultBlog?.content.blog;
        }
        this.saveToCache();
      }
    } else {
      // If version mismatch or no stored pages, we should try to preserve existing pages
      // and add new ones from allInitialPages
      let existingPages: Page[] = [];
      if (storedPages) {
        try {
          existingPages = JSON.parse(storedPages);
        } catch (e) {
          console.error('Failed to parse stored pages', e);
        }
      }

      this.pages = [...allInitialPages];

      // Overwrite initial pages with existing ones if they have the same ID
      existingPages.forEach(ep => {
        const index = this.pages.findIndex(ip => ip.id === ep.id);
        if (index !== -1) {
          // Force overwrite consultant page for this version bump
          if (ep.id === 'consultant') {
            return; // Skip preserving the old consultant page
          }
          // Migration: preserve productId if missing in existing page
          if (ep.template === 'SUB_ITEM' && ep.content?.subItem && !ep.content.subItem.productId) {
            ep.content.subItem.productId = this.pages[index].content?.subItem?.productId || ep.id;
          }
          this.pages[index] = ep;
        } else {
          // Migration: set productId for custom sub-item pages if missing
          if (ep.template === 'SUB_ITEM' && ep.content?.subItem && !ep.content.subItem.productId) {
             ep.content.subItem.productId = ep.id;
          }
          this.pages.push(ep);
        }
      });

      this.saveToCache();
    }

    // Background refresh from Supabase
    if (isSupabaseConfigured) {
      this.refresh().catch(err => console.error('PageService: background refresh failed', err));
    }
  }

  /** Save to localStorage cache */
  private saveToCache() {
    localStorage.setItem('admin_pages', JSON.stringify(this.pages));
    localStorage.setItem('admin_pages_version', this.VERSION);
  }

  /** Fetch all pages from Supabase and update local cache */
  async refresh(): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { data, error } = await supabase.from('pages').select('*');
    if (error) {
      console.error('PageService.refresh error:', error);
      return;
    }
    if (data && data.length > 0) {
      this.pages = data.map(row => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        template: row.template,
        parentId: row.parent_id,
        content: row.content || {},
        isPublished: row.is_published,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      } as Page));
      this.saveToCache();
    }
  }

  getAll(): Page[] { return this.pages; }

  getById(id: string): Page | undefined {
    return this.getBySlug(id);
  }

  getBySlug(slug: string): Page | undefined {
    if (!slug || typeof slug !== 'string') return undefined;
    return this.pages.find(p =>
      p.id?.toLowerCase() === slug.toLowerCase() ||
      p.slug?.toLowerCase() === slug.toLowerCase()
    );
  }

  async create(title: string, template: TemplateType, parentId?: string): Promise<Page> {
    const slug = `page-${Date.now()}`;
    const newPage: Page = {
      id: slug,
      slug,
      title,
      template,
      parentId,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: { ...DEFAULT_MAJOR_ITEM_TEMPLATE }
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('pages').insert({
        id: newPage.id,
        slug: newPage.slug,
        title: newPage.title,
        template: newPage.template,
        parent_id: newPage.parentId || null,
        content: newPage.content,
        is_published: newPage.isPublished,
        created_at: newPage.createdAt,
        updated_at: newPage.updatedAt,
      });
      if (error) throw new Error(error.message);
    }

    this.pages.push(newPage);
    this.saveToCache();
    return newPage;
  }

  async update(id: string, data: Partial<Page>): Promise<void> {
    const index = this.pages.findIndex(p => p.id === id || p.slug === id);
    if (index === -1) return;

    const currentPage = this.pages[index];
    const updatedData = { ...data };

    // If slug is updated and id matches slug, sync id too
    if (data.slug && currentPage.id === currentPage.slug) {
      updatedData.id = data.slug;
    }

    const newPage = { ...currentPage, ...updatedData, updatedAt: new Date().toISOString() };

    if (isSupabaseConfigured) {
      const dbData: Record<string, any> = { updated_at: newPage.updatedAt };
      if (updatedData.slug !== undefined) dbData.slug = updatedData.slug;
      if (updatedData.id !== undefined) dbData.id = updatedData.id;
      if (updatedData.title !== undefined) dbData.title = updatedData.title;
      if (updatedData.template !== undefined) dbData.template = updatedData.template;
      if (updatedData.parentId !== undefined) dbData.parent_id = updatedData.parentId;
      if (updatedData.content !== undefined) dbData.content = updatedData.content;
      if (updatedData.isPublished !== undefined) dbData.is_published = updatedData.isPublished;

      const { error } = await supabase.from('pages').update(dbData).eq('id', currentPage.id);
      if (error) throw new Error(error.message);
    }

    this.pages[index] = newPage;
    this.saveToCache();
  }

  async delete(id: string): Promise<boolean> {
    const index = this.pages.findIndex(p => p.id === id || p.slug === id);
    if (index === -1) return false;

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('pages').delete().eq('id', this.pages[index].id);
      if (error) throw new Error(error.message);
    }

    this.pages.splice(index, 1);
    this.saveToCache();
    return true;
  }
}

export const pageService = new PageService();
