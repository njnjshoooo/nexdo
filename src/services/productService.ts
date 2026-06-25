import { Product } from '../types/admin';
import { v4 as uuidv4 } from 'uuid';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'admin_products';
const TABLE_NAME = 'products';

class ProductService {
  private products: Product[] = [];

  constructor() {
    this.loadCache();
    if (isSupabaseConfigured) {
      this.refresh().catch(err => console.error('[productService] init refresh failed', err));
    }
  }

  private mapRow(row: any): Product {
    const getJson = (val: any, fallback: any) => {
      if (!val) return fallback;
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return fallback; }
      }
      return val;
    };

    return {
      id: row.id,
      name: row.name,
      category: row.category,
      description: row.description,
      image: row.image,
      images: getJson(row.images, []),
      checklist: getJson(row.checklist, []),
      orderMode: row.order_mode || 'FIXED',
      orderCode: row.order_code,
      requireDate: !!row.require_date,
      requireTime: !!row.require_time,
      requireNotes: !!row.require_notes,
      variants: getJson(row.variants, []),
      fixedConfig: getJson(row.fixed_config, { price: 0, unit: '次', buttonText: '預約' }),
      quoteConfig: getJson(row.quote_config, undefined),
      internalFormConfig: getJson(row.internal_form_config, undefined),
      externalLinkConfig: getJson(row.external_link_config, undefined),
      createdAt: row.created_at || row.createdAt,
      updatedAt: row.updated_at || row.updatedAt
    };
  }

  private toRow(product: Partial<Product>): any {
    const row: any = {};
    if (product.id !== undefined) row.id = product.id;
    if (product.name !== undefined) row.name = product.name;
    if (product.category !== undefined) row.category = product.category;
    if (product.description !== undefined) row.description = product.description;
    if (product.image !== undefined) row.image = product.image;
    if (product.images !== undefined) row.images = JSON.stringify(product.images);
    if (product.checklist !== undefined) row.checklist = JSON.stringify(product.checklist);
    if (product.orderMode !== undefined) row.order_mode = product.orderMode;
    if (product.orderCode !== undefined) row.order_code = product.orderCode;
    if (product.requireDate !== undefined) row.require_date = product.requireDate;
    if (product.requireTime !== undefined) row.require_time = product.requireTime;
    if (product.requireNotes !== undefined) row.require_notes = product.requireNotes;
    if (product.variants !== undefined) row.variants = JSON.stringify(product.variants);
    if (product.fixedConfig !== undefined) row.fixed_config = JSON.stringify(product.fixedConfig);
    if (product.quoteConfig !== undefined) row.quote_config = JSON.stringify(product.quoteConfig);
    if (product.internalFormConfig !== undefined) row.internal_form_config = JSON.stringify(product.internalFormConfig);
    if (product.externalLinkConfig !== undefined) row.external_link_config = JSON.stringify(product.externalLinkConfig);
    if (product.createdAt !== undefined) row.created_at = product.createdAt;
    if (product.updatedAt !== undefined) row.updated_at = product.updatedAt;
    return row;
  }

  private loadCache() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          this.products = JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse cached products', e);
          this.products = [];
        }
      }
    }
  }

  private saveCache() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.products));
      window.dispatchEvent(new CustomEvent('products_updated'));
    }
  }

  async refresh(): Promise<void> {
    if (!isSupabaseConfigured) {
      this.loadCache();
      return;
    }
    const { data, error } = await supabase.from(TABLE_NAME).select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('❌ [productService] refresh error:', error);
      return;
    }
    console.log('📦 [productService] refresh raw data:', data);
    if (data) {
      this.products = data.map(row => this.mapRow(row));
      console.log('✨ [productService] mapped products:', this.products);
      this.saveCache();
    }
  }

  async getAll(): Promise<Product[]> {
    if (isSupabaseConfigured) {
      await this.refresh();
    }
    return [...this.products];
  }

  async getById(id: string): Promise<Product | undefined> {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from(TABLE_NAME).select('*').eq('id', id).maybeSingle();
      if (data) {
        const prod = this.mapRow(data);
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
          this.products[index] = prod;
        } else {
          this.products.push(prod);
        }
        this.saveCache();
        return prod;
      }
    }
    return this.products.find(p => p.id === id);
  }

  async create(data: Partial<Product>): Promise<Product> {
    const newProduct = {
      id: data.id || uuidv4(),
      name: data.name || '新產品',
      description: data.description || '',
      orderMode: data.orderMode || 'FIXED',
      fixedConfig: data.fixedConfig || { price: 0, unit: '次', buttonText: '預約服務' },
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Product;

    if (isSupabaseConfigured) {
      const { error } = await supabase.from(TABLE_NAME).insert(this.toRow(newProduct));
      if (error) throw new Error(`新增失敗: ${error.message}`);
    }

    this.products.unshift(newProduct);
    this.saveCache();
    return newProduct;
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const updatedData = { ...data, updatedAt: new Date().toISOString() };
    
    if (isSupabaseConfigured) {
      const { error } = await supabase.from(TABLE_NAME).update(this.toRow(updatedData)).eq('id', id);
      if (error) throw new Error(`更新失敗: ${error.message}`);
    }

    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updatedData };
      this.saveCache();
      return this.products[index];
    } else {
      if (isSupabaseConfigured) await this.refresh();
      const p = this.products.find(x => x.id === id);
      if (!p) throw new Error('產品不存在');
      return p;
    }
  }

  async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
      if (error) throw new Error(`刪除失敗: ${error.message}`);
    }

    this.products = this.products.filter(p => p.id !== id);
    this.saveCache();
    return true;
  }
}

export const productService = new ProductService();
