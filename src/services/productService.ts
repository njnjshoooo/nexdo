import { Product } from '../types/admin';
import { initialProducts } from '../data/products';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'haolingju_products';

class ProductService {
  private products: Product[] = [];

  constructor() {
    this.loadFromStorage();

    // Background refresh from Supabase
    if (isSupabaseConfigured) {
      this.refresh().catch(err => console.error('ProductService: background refresh failed', err));
    }
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      this.products = JSON.parse(stored);
    } else {
      this.products = [...initialProducts];
    }

    // Migration: Add default categories and orderCodes if missing
    let changed = false;
    const categoryMap: Record<string, string> = {
      'safety-assessment': '居住安全',
      'old-house-diagnosis': '居住安全',
      'bathroom-renovation': '居住安全',
      'home-reorganization': '收納清潔',
      'organization-planning': '收納清潔',
      'regular-cleaning': '收納清潔',
      'home-clearance': '收納清潔',
      'health-fitness': '樂齡健康',
      'short-term-care': '樂齡健康',
      'home-dentist': '樂齡健康',
      'medical-companion': '樂齡健康',
      'nutrition-consulting': '樂齡健康',
      'elderly-housing-exchange': '租房搬家',
      'rental-management': '租房搬家',
      'safe-moving': '租房搬家',
      'real-estate': '租房搬家',
      'decor-design': '居家裝潢',
      'light-renovation': '居家裝潢',
      'rental-customization': '居家裝潢',
    };

    const orderCodeMap: Record<string, string> = {
      'bathroom-renovation': 'BRR',
      'decor-design': 'DCD',
      'elderly-housing-exchange': 'EHE',
      'home-reorganization': 'HRZ',
      'old-house-diagnosis': 'OHD',
      'organization-planning': 'OZP',
      'real-estate': 'RET',
      'rental-management': 'RMM',
      'safe-moving': 'SFM',
      'safety-assessment': 'SAM',
      'short-term-care': 'STC',
      'light-renovation': 'LRV',
      'home-dentist': 'HDT',
      'medical-companion': 'MDC',
      'regular-cleaning': 'RGC',
      'home-clearance': 'HCR',
      'nutrition-consulting': 'NTC',
      'rental-customization': 'RCZ',
      'health-fitness': 'HTF',
      'assistive-devices': 'ASD',
      'accessible-transport': 'ACT'
    };

    this.products = this.products.map(p => {
      let updated = { ...p };
      if (!p.category && categoryMap[p.id]) {
        changed = true;
        updated.category = categoryMap[p.id];
      }
      if (!p.orderCode && orderCodeMap[p.id]) {
        changed = true;
        updated.orderCode = orderCodeMap[p.id];
      }
      // Migrate QUOTE to EXTERNAL_LINK and ensure new configs exist
      if (updated.orderMode === 'QUOTE' as any) {
        changed = true;
        updated.orderMode = 'EXTERNAL_LINK';
        if (updated.quoteConfig) {
          updated.externalLinkConfig = {
            priceText: updated.quoteConfig.priceText,
            buttonText: updated.quoteConfig.buttonText,
            url: updated.quoteConfig.link || ''
          };
        }
      }

      // Ensure new configs exist for all products
      if (!updated.internalFormConfig) {
        changed = true;
        updated.internalFormConfig = { priceText: '依需求報價', buttonText: '填寫表單', formId: '' };
      }
      if (!updated.externalLinkConfig) {
        changed = true;
        updated.externalLinkConfig = { priceText: '依需求報價', buttonText: 'LINE諮詢報價', url: '' };
      }
      if (!updated.fixedConfig) {
        changed = true;
        updated.fixedConfig = { price: 0, unit: '次', buttonText: '立即下單' };
      }

      return updated;
    });

    if (changed || !stored) {
      this.saveToCache();
    }
  }

  private saveToCache() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.products));
  }

  /** Fetch all products from Supabase and update local cache */
  async refresh(): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('ProductService.refresh error:', error);
      return;
    }
    if (data && data.length > 0) {
      this.products = data.map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
        description: row.description,
        image: row.image,
        checklist: row.checklist || [],
        orderMode: row.order_mode,
        orderCode: row.order_code,
        requireDate: row.require_date,
        requireTime: row.require_time,
        requireNotes: row.require_notes,
        variants: row.variants || [],
        fixedConfig: row.fixed_config || { price: 0, unit: '次', buttonText: '立即下單' },
        quoteConfig: row.quote_config,
        internalFormConfig: row.internal_form_config || { priceText: '依需求報價', buttonText: '填寫表單', formId: '' },
        externalLinkConfig: row.external_link_config || { priceText: '依需求報價', buttonText: 'LINE諮詢報價', url: '' },
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      } as Product));
      this.saveToCache();
    }
  }

  getAll(): Product[] {
    return [...this.products];
  }

  getById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  async create(data: Partial<Product>): Promise<Product> {
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('products').insert({
        id: newProduct.id,
        name: newProduct.name,
        category: data.category || null,
        description: newProduct.description,
        image: newProduct.image || null,
        checklist: newProduct.checklist,
        order_mode: newProduct.orderMode,
        order_code: data.orderCode || null,
        require_date: data.requireDate || false,
        require_time: data.requireTime || false,
        require_notes: data.requireNotes || false,
        variants: data.variants || [],
        fixed_config: newProduct.fixedConfig,
        quote_config: data.quoteConfig || null,
        internal_form_config: newProduct.internalFormConfig,
        external_link_config: newProduct.externalLinkConfig,
        created_at: newProduct.createdAt,
        updated_at: newProduct.updatedAt,
      });
      if (error) throw new Error(error.message);
    }

    this.products.push(newProduct);
    this.saveToCache();
    return newProduct;
  }

  async update(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    const updatedProduct = {
      ...this.products[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const dbData: Record<string, any> = { updated_at: updatedProduct.updatedAt };
      if (updates.name !== undefined) dbData.name = updates.name;
      if (updates.category !== undefined) dbData.category = updates.category;
      if (updates.description !== undefined) dbData.description = updates.description;
      if (updates.image !== undefined) dbData.image = updates.image;
      if (updates.checklist !== undefined) dbData.checklist = updates.checklist;
      if (updates.orderMode !== undefined) dbData.order_mode = updates.orderMode;
      if (updates.orderCode !== undefined) dbData.order_code = updates.orderCode;
      if (updates.requireDate !== undefined) dbData.require_date = updates.requireDate;
      if (updates.requireTime !== undefined) dbData.require_time = updates.requireTime;
      if (updates.requireNotes !== undefined) dbData.require_notes = updates.requireNotes;
      if (updates.variants !== undefined) dbData.variants = updates.variants;
      if (updates.fixedConfig !== undefined) dbData.fixed_config = updates.fixedConfig;
      if (updates.quoteConfig !== undefined) dbData.quote_config = updates.quoteConfig;
      if (updates.internalFormConfig !== undefined) dbData.internal_form_config = updates.internalFormConfig;
      if (updates.externalLinkConfig !== undefined) dbData.external_link_config = updates.externalLinkConfig;

      const { error } = await supabase.from('products').update(dbData).eq('id', id);
      if (error) throw new Error(error.message);
    }

    this.products[index] = updatedProduct;
    this.saveToCache();
    return this.products[index];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.products.length;

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw new Error(error.message);
    }

    this.products = this.products.filter(p => p.id !== id);

    if (this.products.length !== initialLength) {
      this.saveToCache();
      return true;
    }
    return false;
  }
}

export const productService = new ProductService();
