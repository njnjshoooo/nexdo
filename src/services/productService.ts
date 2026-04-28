import { Product } from '../types/admin';
import { initialProducts } from '../data/products';
import localforage from 'localforage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'haolingju_products';
const TABLE_NAME = 'products';

// 用 createInstance 避免與其他 service 共享預設 localforage 實例導致 storeName 互相覆蓋
const store = localforage.createInstance({
  name: 'haolingju',
  storeName: 'products',
});

class ProductService {
  private products: Product[] = [];
  private initialized: Promise<void>;

  constructor() {
    this.initialized = this.init();
  }

  private mapRow(row: any): Product {
    return {
      id: row.id,
      name: row.name,
      category: row.category ?? undefined,
      description: row.description ?? '',
      image: row.image ?? undefined,
      images: Array.isArray(row.images) ? row.images : [],
      checklist: Array.isArray(row.checklist) ? row.checklist : [],
      orderMode: row.order_mode,
      orderCode: row.order_code ?? undefined,
      requireDate: !!row.require_date,
      requireTime: !!row.require_time,
      requireNotes: !!row.require_notes,
      variants: Array.isArray(row.variants) ? row.variants : [],
      fixedConfig: row.fixed_config ?? { price: 0, unit: '次', buttonText: '立即下單' },
      quoteConfig: row.quote_config ?? undefined,
      internalFormConfig: row.internal_form_config ?? undefined,
      externalLinkConfig: row.external_link_config ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private toRow(p: Partial<Product>): any {
    const row: any = {};
    if (p.id !== undefined) row.id = p.id;
    if (p.name !== undefined) row.name = p.name;
    if (p.category !== undefined) row.category = p.category;
    if (p.description !== undefined) row.description = p.description;
    if (p.image !== undefined) row.image = p.image;
    if (p.images !== undefined) row.images = p.images;
    if (p.checklist !== undefined) row.checklist = p.checklist;
    if (p.orderMode !== undefined) row.order_mode = p.orderMode;
    if (p.orderCode !== undefined) row.order_code = p.orderCode;
    if (p.requireDate !== undefined) row.require_date = p.requireDate;
    if (p.requireTime !== undefined) row.require_time = p.requireTime;
    if (p.requireNotes !== undefined) row.require_notes = p.requireNotes;
    if (p.variants !== undefined) row.variants = p.variants;
    if (p.fixedConfig !== undefined) row.fixed_config = p.fixedConfig;
    if (p.quoteConfig !== undefined) row.quote_config = p.quoteConfig;
    if (p.internalFormConfig !== undefined) row.internal_form_config = p.internalFormConfig;
    if (p.externalLinkConfig !== undefined) row.external_link_config = p.externalLinkConfig;
    return row;
  }

  private async init() {
    // 1. 先讀本地快取（即時可用）
    await this.loadCache();
    // 2. 背景從 Supabase 拉最新
    if (isSupabaseConfigured) {
      this.refresh().catch(err => console.warn('[productService] initial refresh failed', err));
    }
  }

  private async loadCache() {
    try {
      const stored = await store.getItem<Product[]>(STORAGE_KEY);
      if (stored && stored.length > 0) {
        this.products = stored;
        return;
      }
      // localStorage migration
      const oldStored = localStorage.getItem(STORAGE_KEY);
      if (oldStored) {
        this.products = JSON.parse(oldStored);
        localStorage.removeItem(STORAGE_KEY);
        await store.setItem(STORAGE_KEY, this.products);
        return;
      }
      // 無 cache：用 initialProducts 作預設
      this.products = [...initialProducts];
    } catch (e) {
      console.error('[productService] loadCache failed', e);
      this.products = [...initialProducts];
    }
  }

  /** 從 Supabase 拉最新並更新快取 */
  async refresh(): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      this.products = (data ?? []).map(this.mapRow);
      await this.saveCache();
      window.dispatchEvent(new CustomEvent('products_refreshed'));
    } catch (e) {
      console.warn('[productService] refresh failed', e);
    }
  }

  private async saveCache() {
    try {
      await store.setItem(STORAGE_KEY, this.products);
    } catch (e) {
      console.warn('[productService] saveCache failed', e);
    }
  }

  async getAll(): Promise<Product[]> {
    await this.initialized;
    return [...this.products];
  }

  async getById(id: string): Promise<Product | undefined> {
    await this.initialized;
    return this.products.find(p => p.id === id);
  }

  async create(data: Partial<Product>): Promise<Product> {
    await this.initialized;
    const now = new Date().toISOString();
    const newProduct: Product = {
      id: data.id || `product-${Date.now()}`,
      name: data.name || '新產品',
      description: data.description || '',
      image: data.image || '',
      checklist: data.checklist || [],
      orderMode: data.orderMode || 'EXTERNAL_LINK',
      fixedConfig: data.fixedConfig || { price: 0, unit: '次', buttonText: '立即下單' },
      externalLinkConfig: data.externalLinkConfig || { priceText: '依需求報價', buttonText: 'LINE諮詢報價', url: '' },
      internalFormConfig: data.internalFormConfig || { priceText: '依需求報價', buttonText: '填寫表單', formId: '' },
      createdAt: now,
      updatedAt: now,
      ...data, // overrides
      // ensure required timestamps stay
    } as Product;
    newProduct.createdAt = now;
    newProduct.updatedAt = now;

    // Optimistic local update
    this.products.push(newProduct);
    await this.saveCache();

    if (isSupabaseConfigured) {
      const { error } = await supabase.from(TABLE_NAME).insert(this.toRow(newProduct));
      if (error) {
        console.error('[productService] create failed in Supabase', error);
        // Rollback
        this.products = this.products.filter(p => p.id !== newProduct.id);
        await this.saveCache();
        throw new Error(`新增產品失敗：${error.message}`);
      }
    }

    return newProduct;
  }

  async update(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    await this.initialized;
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    const updatedAt = new Date().toISOString();
    const merged: Product = {
      ...this.products[index],
      ...updates,
      updatedAt,
    };
    const previous = this.products[index];
    this.products[index] = merged;
    await this.saveCache();

    if (isSupabaseConfigured) {
      // .select() 強制 Supabase 回傳更新後的 row，這樣可以驗證真的有改到
      // (RLS 阻擋的情況下會回傳 0 rows 但沒有 error)
      const { data, error } = await supabase.from(TABLE_NAME)
        .update(this.toRow({ ...updates, updatedAt }))
        .eq('id', id)
        .select();
      if (error) {
        console.error('[productService] update failed in Supabase', error);
        this.products[index] = previous;
        await this.saveCache();
        throw new Error(`更新產品失敗：${error.message}`);
      }
      if (!data || data.length === 0) {
        // RLS 阻擋導致 0 rows 被更新
        console.error('[productService] update affected 0 rows (RLS blocked?)', { id });
        this.products[index] = previous;
        await this.saveCache();
        throw new Error('更新失敗：權限不足或產品不存在（請確認您是 admin 並已登入）');
      }
    }

    return merged;
  }

  async delete(id: string): Promise<boolean> {
    await this.initialized;
    const initialLength = this.products.length;
    const removed = this.products.find(p => p.id === id);
    this.products = this.products.filter(p => p.id !== id);

    if (this.products.length === initialLength) return false;
    await this.saveCache();

    if (isSupabaseConfigured) {
      const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
      if (error) {
        console.error('[productService] delete failed in Supabase', error);
        // Rollback
        if (removed) this.products.push(removed);
        await this.saveCache();
        throw new Error(`刪除產品失敗：${error.message}`);
      }
    }

    return true;
  }
}

export const productService = new ProductService();
