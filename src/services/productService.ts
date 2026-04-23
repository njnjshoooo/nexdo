import { Product } from '../types/admin';
import { initialProducts } from '../data/products';
import localforage from 'localforage';

const STORAGE_KEY = 'haolingju_products';

// Configure localforage
localforage.config({
  name: 'haolingju',
  storeName: 'products'
});

class ProductService {
  private products: Product[] = [];
  private initialized: Promise<void>;

  constructor() {
    this.initialized = this.loadFromStorage();
  }

  private async loadFromStorage() {
    try {
      const stored = await localforage.getItem<Product[]>(STORAGE_KEY);
      if (stored) {
        this.products = stored;
      } else {
        // Migration from localStorage
        const oldStored = localStorage.getItem(STORAGE_KEY);
        if (oldStored) {
          this.products = JSON.parse(oldStored);
          await localforage.setItem(STORAGE_KEY, this.products);
          localStorage.removeItem(STORAGE_KEY);
        } else {
          this.products = [...initialProducts];
          await localforage.setItem(STORAGE_KEY, this.products);
        }
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

        // Force update home-reorganization to use INTERNAL_FORM and set deposit
        if (updated.id === 'home-reorganization') {
          if (updated.orderMode !== 'INTERNAL_FORM' || !updated.internalFormConfig?.enableDeposit) {
            changed = true;
            updated.orderMode = 'INTERNAL_FORM';
            updated.internalFormConfig = {
              priceText: '依需求報價',
              buttonText: '立即填寫表單',
              formId: 'home-organize-booking-form',
              enableDeposit: true,
              depositRatio: 30,
              balanceRatio: 70
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

      if (changed) {
        await this.saveToStorage();
      }
    } catch (e) {
      console.error('Failed to load products', e);
      this.products = [...initialProducts];
    }
  }

  private async saveToStorage() {
    try {
      await localforage.setItem(STORAGE_KEY, this.products);
    } catch (e) {
      console.error('Failed to save products', e);
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

    this.products.push(newProduct);
    await this.saveToStorage();
    return newProduct;
  }

  async update(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    await this.initialized;
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    this.products[index] = {
      ...this.products[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.saveToStorage();
    return this.products[index];
  }

  async delete(id: string): Promise<boolean> {
    await this.initialized;
    const initialLength = this.products.length;
    this.products = this.products.filter(p => p.id !== id);
    
    if (this.products.length !== initialLength) {
      await this.saveToStorage();
      return true;
    }
    return false;
  }
}

export const productService = new ProductService();
