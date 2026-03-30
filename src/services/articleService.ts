import { Article } from '../types/article';
import { v4 as uuidv4 } from 'uuid';
import { ALL_ARTICLES } from '../data/articles';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

class ArticleService {
  private articles: Article[] = [];

  constructor() {
    // 初始化：從 localStorage 載入（快取 + fallback）
    this.articles = [...ALL_ARTICLES];
    const storedArticles = localStorage.getItem('articles');
    if (storedArticles) {
      try {
        const customArticles: Article[] = JSON.parse(storedArticles);
        customArticles.forEach(ca => {
          const index = this.articles.findIndex(a => a.id === ca.id);
          if (index !== -1) {
            this.articles[index] = ca;
          } else {
            this.articles.push(ca);
          }
        });
      } catch (e) {
        console.error('Failed to parse stored articles', e);
      }
    }
    this.saveLocal();
    // 背景從 Supabase 刷新
    this.refresh();
  }

  private saveLocal() {
    localStorage.setItem('articles', JSON.stringify(this.articles));
  }

  /** 從 Supabase 拉取最新資料到快取 */
  async refresh(): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch articles from Supabase', error);
      return;
    }

    if (data && data.length > 0) {
      this.articles = data.map(row => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        summary: row.summary,
        content: row.content,
        coverImage: row.cover_image,
        categoryId: row.category_id,
        seoKeywords: row.seo_keywords || [],
        relatedServiceIds: row.related_service_ids || [],
        showForm: row.show_form,
        formId: row.form_id,
        isPublished: row.is_published,
        updatedAt: row.updated_at,
      }));
      this.saveLocal();
    }
  }

  getAll(): Article[] { return this.articles; }

  getById(id: string): Article | undefined {
    return this.articles.find(a => a.id === id);
  }

  getBySlug(slug: string): Article | undefined {
    if (!slug || typeof slug !== 'string') return undefined;
    return this.articles.find(a => a.slug?.toLowerCase() === slug.toLowerCase());
  }

  async create(data: Omit<Article, 'id' | 'updatedAt'>): Promise<Article> {
    const newArticle: Article = {
      ...data,
      id: data.slug || uuidv4(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('articles').insert({
        id: newArticle.id,
        title: newArticle.title,
        slug: newArticle.slug,
        summary: newArticle.summary || null,
        content: newArticle.content,
        cover_image: newArticle.coverImage,
        category_id: newArticle.categoryId,
        seo_keywords: newArticle.seoKeywords || [],
        related_service_ids: newArticle.relatedServiceIds || [],
        show_form: newArticle.showForm || false,
        form_id: newArticle.formId || null,
        is_published: newArticle.isPublished,
      });
      if (error) throw new Error(error.message);
    }

    this.articles.push(newArticle);
    this.saveLocal();
    return newArticle;
  }

  async update(id: string, data: Partial<Article>): Promise<void> {
    const index = this.articles.findIndex(a => a.id === id);
    if (index === -1) return;

    if (isSupabaseConfigured) {
      const dbData: Record<string, any> = {};
      if (data.title !== undefined) dbData.title = data.title;
      if (data.slug !== undefined) dbData.slug = data.slug;
      if (data.summary !== undefined) dbData.summary = data.summary;
      if (data.content !== undefined) dbData.content = data.content;
      if (data.coverImage !== undefined) dbData.cover_image = data.coverImage;
      if (data.categoryId !== undefined) dbData.category_id = data.categoryId;
      if (data.seoKeywords !== undefined) dbData.seo_keywords = data.seoKeywords;
      if (data.relatedServiceIds !== undefined) dbData.related_service_ids = data.relatedServiceIds;
      if (data.showForm !== undefined) dbData.show_form = data.showForm;
      if (data.formId !== undefined) dbData.form_id = data.formId;
      if (data.isPublished !== undefined) dbData.is_published = data.isPublished;

      const { error } = await supabase.from('articles').update(dbData).eq('id', id);
      if (error) throw new Error(error.message);
    }

    this.articles[index] = { ...this.articles[index], ...data, updatedAt: new Date().toISOString() };
    this.saveLocal();
  }

  async delete(id: string): Promise<boolean> {
    const index = this.articles.findIndex(a => a.id === id);
    if (index === -1) return false;

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw new Error(error.message);
    }

    this.articles.splice(index, 1);
    this.saveLocal();
    return true;
  }
}

export const articleService = new ArticleService();
