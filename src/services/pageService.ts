import { Page, TemplateType, DEFAULT_MAJOR_ITEM_TEMPLATE, DEFAULT_SUB_ITEM_TEMPLATE } from '../types/admin';
import { v4 as uuidv4 } from 'uuid';
import { allInitialPages } from '../data/pages/index';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'admin_pages';
const VERSION_KEY = 'admin_pages_version';
const TABLE_NAME = 'pages';

class PageService {
  private pages: Page[] = [];
  private readonly VERSION = '1.0.13';

  constructor() {
    this.loadCache();
    if (isSupabaseConfigured) {
      this.refresh().catch((err) => console.warn('[pageService] initial refresh failed', err));
    }
  }

  private mapRow(row: any): Page {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      template: row.template,
      parentId: row.parent_id ?? undefined,
      content: row.content,
      isPublished: !!row.is_published,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private toRow(page: Partial<Page>): any {
    const row: any = {};
    if (page.id !== undefined) row.id = page.id;
    if (page.slug !== undefined) row.slug = page.slug;
    if (page.title !== undefined) row.title = page.title;
    if (page.template !== undefined) row.template = page.template;
    if (page.parentId !== undefined) row.parent_id = page.parentId ?? null;
    if (page.content !== undefined) row.content = page.content;
    if (page.isPublished !== undefined) row.is_published = page.isPublished;
    if (page.createdAt !== undefined) row.created_at = page.createdAt;
    if (page.updatedAt !== undefined) row.updated_at = page.updatedAt;
    return row;
  }

  private loadCache() {
    const storedPages = localStorage.getItem(STORAGE_KEY);
    const storedVersion = localStorage.getItem(VERSION_KEY);

    if (isSupabaseConfigured) {
      // When Supabase is configured, the source of truth is Supabase.
      // Only use localStorage as a temporary cache for instant first render.
      if (storedPages) {
        try {
          this.pages = JSON.parse(storedPages);
        } catch (e) {
          console.error('Failed to parse cached pages', e);
          this.pages = [];
        }
      } else {
        this.pages = [];
      }
      return;
    }

    // localStorage-only fallback path (original migration logic)
    if (storedPages && storedVersion === this.VERSION) {
      this.pages = JSON.parse(storedPages);

      // Ensure blog page exists and has correct template
      const blogIndex = this.pages.findIndex(p => p.slug === 'blog');
      if (blogIndex === -1) {
        const blogPage = allInitialPages.find(p => p.slug === 'blog');
        if (blogPage) {
          this.pages.push(blogPage);
          this.saveCache();
        }
      } else if (this.pages[blogIndex].template !== 'BLOG') {
        // Force the blog page to be a BLOG template if it was created as something else
        this.pages[blogIndex].template = 'BLOG';
        if (!this.pages[blogIndex].content.blog) {
          const defaultBlog = allInitialPages.find(p => p.slug === 'blog');
          this.pages[blogIndex].content.blog = defaultBlog?.content.blog;
        }
        this.saveCache();
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

      this.saveCache();
    }
  }

  private saveCache() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.pages));
      localStorage.setItem(VERSION_KEY, this.VERSION);
    } catch (e) {
      console.warn('[pageService] saveCache failed', e);
    }
  }

  async refresh(): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from(TABLE_NAME).select('*');
    if (error) {
      console.warn('[pageService] refresh failed', error);
      return;
    }
    this.pages = (data ?? []).map((row) => this.mapRow(row));
    this.saveCache();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pages_refreshed'));
    }
  }

  getAll(): Page[] { return [...this.pages]; }

  getById(id: string): Page | undefined {
    // 統一使用 slug 作為唯一識別碼
    return this.getBySlug(id);
  }

  getBySlug(slug: string): Page | undefined {
    if (!slug || typeof slug !== 'string') return undefined;
    // 優先匹配 id，再匹配 slug (在過渡期兩者可能不同)
    return this.pages.find(p =>
      p.id?.toLowerCase() === slug.toLowerCase() ||
      p.slug?.toLowerCase() === slug.toLowerCase()
    );
  }

  /**
   * Create a new page. Returns the new page synchronously from the local cache.
   * The Supabase write happens in the background; if it fails, an error event
   * is dispatched and the cache will be reconciled on next refresh().
   */
  create(title: string, template: TemplateType, parentId?: string): Page {
    const slug = `page-${Date.now()}`;
    const now = new Date().toISOString();
    const newPage: Page = {
      id: slug, // ID 與 Slug 一致
      slug,
      title,
      template,
      parentId,
      isPublished: false,
      createdAt: now,
      updatedAt: now,
      content: { ...DEFAULT_MAJOR_ITEM_TEMPLATE }
    };

    // Optimistically update local cache first
    this.pages.push(newPage);
    this.saveCache();

    // Background write to Supabase — 失敗時 dispatch event 讓 UI 知道
    if (isSupabaseConfigured) {
      supabase
        .from(TABLE_NAME)
        .insert(this.toRow(newPage))
        .then(({ error }) => {
          if (error) {
            console.error('[pageService] create failed in Supabase', error);
            window.dispatchEvent(new CustomEvent('pages_save_error', {
              detail: { op: 'create', message: error.message, pageId: newPage.id, title }
            }));
          }
        });
    }

    return newPage;
  }

  update(id: string, data: Partial<Page>): void {
    const index = this.pages.findIndex(p => p.id === id || p.slug === id);
    if (index === -1) return;

    const currentPage = this.pages[index];
    const updatedData = { ...data };

    // 如果更新了 slug，且原本 id 與 slug 一致，則同步更新 id
    if (data.slug && currentPage.id === currentPage.slug) {
      updatedData.id = data.slug;
    }

    const newPage = { ...currentPage, ...updatedData, updatedAt: new Date().toISOString() };
    const oldId = currentPage.id;

    // Optimistically update local cache
    this.pages[index] = newPage;
    this.saveCache();

    // Background write to Supabase — 用 upsert 確保即便先前 create 失敗，
    // update 仍能把整筆資料補進 DB
    if (isSupabaseConfigured) {
      const idChanged = updatedData.id !== undefined && updatedData.id !== oldId;
      const dispatchErr = (op: string, message: string) => {
        window.dispatchEvent(new CustomEvent('pages_save_error', {
          detail: { op, message, pageId: newPage.id, title: newPage.title }
        }));
      };

      if (idChanged) {
        // PK 變更：先刪舊的，再 upsert 新 row
        (async () => {
          const { error: delErr } = await supabase.from(TABLE_NAME).delete().eq('id', oldId);
          if (delErr) {
            console.error('[pageService] update (delete-old) failed', delErr);
            dispatchErr('update', delErr.message);
            return;
          }
          const { error: insErr } = await supabase.from(TABLE_NAME).upsert(this.toRow(newPage), { onConflict: 'id' });
          if (insErr) {
            console.error('[pageService] update (insert-new) failed', insErr);
            dispatchErr('update', insErr.message);
          }
        })();
      } else {
        // 用 upsert 而非 update + eq，這樣 row 不存在時會自動 insert
        supabase
          .from(TABLE_NAME)
          .upsert(this.toRow(newPage), { onConflict: 'id' })
          .then(({ error }) => {
            if (error) {
              console.error('[pageService] update failed in Supabase', error);
              dispatchErr('update', error.message);
            }
          });
      }
    }
  }

  delete(id: string): boolean {
    const target = this.pages.find(p => p.id === id || p.slug === id);
    if (!target) return false;

    const initialLength = this.pages.length;
    this.pages = this.pages.filter(p => p.id !== id && p.slug !== id);
    if (this.pages.length === initialLength) return false;

    this.saveCache();

    if (isSupabaseConfigured) {
      supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', target.id)
        .then(({ error }) => {
          if (error) {
            console.error('[pageService] delete failed in Supabase', error);
            throw new Error(`刪除失敗：${error.message}`);
          }
        });
    }

    return true;
  }
}

export const pageService = new PageService();
