import { Article } from '../types/article';
import { v4 as uuidv4 } from 'uuid';
import { ALL_ARTICLES } from '../data/articles';

class ArticleService {
  private articles: Article[] = [];

  constructor() {
    const storedArticles = localStorage.getItem('articles');
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
    this.save();
  }

  private save() {
    localStorage.setItem('articles', JSON.stringify(this.articles));
  }

  getAll(): Article[] { return this.articles; }

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
    this.articles.push(newArticle);
    this.save();
    return newArticle;
  }

  update(id: string, data: Partial<Article>) {
    const index = this.articles.findIndex(a => a.id === id);
    if (index !== -1) {
      this.articles[index] = { ...this.articles[index], ...data, updatedAt: new Date().toISOString() };
      this.save();
    }
  }

  delete(id: string): boolean {
    const index = this.articles.findIndex(a => a.id === id);
    if (index === -1) return false;

    this.articles.splice(index, 1);
    this.save();
    return true;
  }
}

export const articleService = new ArticleService();
