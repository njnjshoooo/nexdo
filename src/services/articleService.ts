import { Article } from '../types/article';
import { v4 as uuidv4 } from 'uuid';
import { ALL_ARTICLES } from '../data/articles';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'articles';
const TABLE_NAME = 'articles';

class ArticleService {
  private articles: Article[] = [];

  constructor() {
    this.loadCache();
    if (isSupabaseConfigured) {
      this.refresh().catch((err) => console.warn('[articleService] initial refresh failed', err));
    }
  }

  private mapRow(row: any): Article {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      summary: row.summary ?? undefined,
      content: row.content,
      coverImage: row.cover_image ?? '',
      categoryId: row.category_id ?? '',
      seoKeywords: Array.isArray(row.seo_keywords) ? row.seo_keywords : [],
      relatedServiceIds: Array.isArray(row.related_service_ids) ? row.related_service_ids : undefined,
      showForm: row.show_form ?? undefined,
      formId: row.form_id ?? undefined,
      isPublished: !!row.is_published,
      updatedAt: row.updated_at,
    };
  }

  private toRow(a: Partial<Article>): any {
    const row: any = {};
    if (a.id !== undefined) row.id = a.id;
    if (a.slug !== undefined) row.slug = a.slug;
    if (a.title !== undefined) row.title = a.title;
    if (a.summary !== undefined) row.summary = a.summary;
    if (a.content !== undefined) row.content = a.content;
    if (a.coverImage !== undefined) row.cover_image = a.coverImage;
    if (a.categoryId !== undefined) row.category_id = a.categoryId;
    if (a.seoKeywords !== undefined) row.seo_keywords = a.seoKeywords;
    if (a.relatedServiceIds !== undefined) row.related_service_ids = a.relatedServiceIds;
    if (a.showForm !== undefined) row.show_form = a.showForm;
    if (a.formId !== undefined) row.form_id = a.formId;
    if (a.isPublished !== undefined) row.is_published = a.isPublished;
    if (a.updatedAt !== undefined) row.updated_at = a.updatedAt;
    return row;
  }

  private loadCache() {
    if (isSupabaseConfigured) {
      // Source of truth = Supabase. Use localStorage as a thin cache for instant first render.
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          this.articles = JSON.parse(cached);
        } catch (e) {
          console.error('Failed to parse cached articles', e);
          this.articles = [];
        }
      } else {
        this.articles = [];
      }
      return;
    }

    // localStorage-only fallback path (with static defaults)
    const storedArticles = localStorage.getItem(STORAGE_KEY);
    this.articles = [...ALL_ARTICLES];

    if (storedArticles) {
      try {
        const customArticles: Article[] = JSON.parse(storedArticles);
        customArticles.forEach(ca => {
          const index = this.articles.findIndex(a => a.id === ca.id);
          if (index !== -1) {
            // Overwrite static with stored version (user edits)
            this.articles[index] = ca;
          } else {
            // Add new custom articles
            this.articles.push(ca);
          }
        });
      } catch (e) {
        console.error('Failed to parse stored articles', e);
      }
    }
    this.saveCache();
  }

  private saveCache() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.articles));
    } catch (e) {
      console.warn('[articleService] saveCache failed', e);
    }
  }

  async refresh(): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from(TABLE_NAME).select('*');
    if (error) {
      console.warn('[articleService] refresh failed', error);
      return;
    }
    this.articles = (data ?? []).map((row) => this.mapRow(row));
    this.saveCache();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('articles_refreshed'));
    }
  }

  getAll(): Article[] { return [...this.articles]; }

  getById(id: string): Article | undefined {
    return this.articles.find(a => a.id === id);
  }

  getBySlug(slug: string): Article | undefined {
    if (!slug || typeof slug !== 'string') return undefined;
    return this.articles.find(a => a.slug?.toLowerCase() === slug.toLowerCase());
  }

  create(data: Omit<Article, 'id' | 'updatedAt'>): Article {
    const newArticle: Article = {
      ...data,
      id: data.slug || uuidv4(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic local update
    this.articles.push(newArticle);
    this.saveCache();

    // Background write to Supabase
    if (isSupabaseConfigured) {
      supabase
        .from(TABLE_NAME)
        .insert(this.toRow(newArticle))
        .then(({ error }) => {
          if (error) {
            console.error('[articleService] create failed in Supabase', error);
            throw new Error(`建立失敗：${error.message}`);
          }
        });
    }

    return newArticle;
  }

  update(id: string, data: Partial<Article>): void {
    const index = this.articles.findIndex(a => a.id === id);
    if (index === -1) return;

    const updatedAt = new Date().toISOString();
    const updated = { ...this.articles[index], ...data, updatedAt };
    this.articles[index] = updated;
    this.saveCache();

    if (isSupabaseConfigured) {
      supabase
        .from(TABLE_NAME)
        .update(this.toRow({ ...data, updatedAt }))
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('[articleService] update failed in Supabase', error);
            throw new Error(`更新失敗：${error.message}`);
          }
        });
    }
  }

  delete(id: string): boolean {
    const initialLength = this.articles.length;
    this.articles = this.articles.filter(a => a.id !== id);
    if (this.articles.length === initialLength) return false;

    this.saveCache();

    if (isSupabaseConfigured) {
      supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('[articleService] delete failed in Supabase', error);
            throw new Error(`刪除失敗：${error.message}`);
          }
        });
    }

    return true;
  }
}

export const articleService = new ArticleService();
