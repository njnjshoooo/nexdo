import { Page, TemplateType, DEFAULT_MAJOR_ITEM_TEMPLATE, DEFAULT_SUB_ITEM_TEMPLATE } from '../types/admin';
import { v4 as uuidv4 } from 'uuid';
import { allInitialPages } from '../data/pages/index';

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
          this.save();
        }
      } else if (this.pages[blogIndex].template !== 'BLOG') {
        // Force the blog page to be a BLOG template if it was created as something else
        this.pages[blogIndex].template = 'BLOG';
        if (!this.pages[blogIndex].content.blog) {
          const defaultBlog = allInitialPages.find(p => p.slug === 'blog');
          this.pages[blogIndex].content.blog = defaultBlog?.content.blog;
        }
        this.save();
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

      this.save();
    }
  }

  private save() {
    localStorage.setItem('admin_pages', JSON.stringify(this.pages));
    localStorage.setItem('admin_pages_version', this.VERSION);
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

  create(title: string, template: TemplateType, parentId?: string): Page {
    const slug = `page-${Date.now()}`;
    const newPage: Page = {
      id: slug, // ID 與 Slug 一致
      slug,
      title,
      template,
      parentId,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: { ...DEFAULT_MAJOR_ITEM_TEMPLATE }
    };
    this.pages.push(newPage);
    this.save();
    return newPage;
  }

  update(id: string, data: Partial<Page>) {
    const index = this.pages.findIndex(p => p.id === id || p.slug === id);
    if (index !== -1) {
      const currentPage = this.pages[index];
      const updatedData = { ...data };
      
      // 如果更新了 slug，且原本 id 與 slug 一致，則同步更新 id
      if (data.slug && currentPage.id === currentPage.slug) {
        updatedData.id = data.slug;
      }

      const newPage = { ...currentPage, ...updatedData, updatedAt: new Date().toISOString() };
      this.pages[index] = newPage;

      this.save();
    }
  }

  delete(id: string): boolean {
    const initialLength = this.pages.length;
    this.pages = this.pages.filter(p => p.id !== id && p.slug !== id);
    
    if (this.pages.length !== initialLength) {
      this.save();
      return true;
    }
    return false;
  }
}

export const pageService = new PageService();