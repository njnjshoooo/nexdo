import { Vendor } from '../types/vendor';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import bcrypt from 'bcryptjs';

const STORAGE_KEY = 'vendors';
const TABLE_NAME = 'vendors';

const defaultVendors: Vendor[] = [
  {
    id: 'tidyman',
    name: '居家整聊室',
    taxId: '88888888',
    type: '居家整聊',
    contactName: '賴芝芝',
    jobTitle: '課程顧問',
    phone: '02-8888-8888',
    extension: '888',
    address: '台北市信義區松德路',
    account: 'tidyman@tidyman.com',
    password: '888888',
    status: 'active',
    certifications: [],
    commissionRate: 80,
    settlementCycle: 'Monthly',
    bankInfo: {
      bankCode: '808',
      bank: '玉山銀行',
      bankName: '信義分行',
      accountName: '居家整聊有限公司',
      accountNumber: '1234567890123'
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'hobbystudio',
    name: '習慣健康國際',
    taxId: '82977822',
    type: '樂齡健康',
    contactName: '林阿茹',
    jobTitle: '課程顧問',
    phone: '02-2222-2222',
    extension: '222',
    address: '台北市大同區長安西路',
    account: 'hobbystudio@hobbystudio.com',
    password: '222222',
    status: 'active',
    certifications: [],
    commissionRate: 70,
    settlementCycle: 'Monthly',
    bankInfo: {
      bankCode: '808',
      bank: '玉山銀行',
      bankName: '信義分行',
      accountName: '好習慣運動有限公司',
      accountNumber: '1234567890135'
    },
    createdAt: '2026-03-24T00:00:00Z',
    updatedAt: '2026-03-24T00:00:00Z',
  }
];

function mapRow(row: any): Vendor {
  return {
    id: row.id,
    name: row.name,
    taxId: row.tax_id ?? '',
    type: row.type ?? '',
    contactName: row.contact_name ?? '',
    jobTitle: row.job_title ?? '',
    phone: row.phone ?? '',
    extension: row.extension ?? '',
    address: row.address ?? '',
    account: row.account,
    password: '', // Password is hashed in DB; never returned to UI
    status: row.status,
    certifications: Array.isArray(row.certifications) ? row.certifications : [],
    commissionRate: row.commission_rate ? Math.round(row.commission_rate * 100) : 0,
    settlementCycle: row.settlement_cycle ?? 'monthly',
    bankInfo: row.bank_info ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as Vendor;
}

let cachedVendors: Vendor[] = [];
let initialized = false;

async function ensureLoaded(): Promise<void> {
  if (initialized) return;
  initialized = true;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from(TABLE_NAME).select('*').order('created_at');
      if (!error && data) {
        cachedVendors = data.map(mapRow);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedVendors)); } catch {}
        return;
      }
    } catch (e) {
      console.warn('[vendorService] load from Supabase failed', e);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try { cachedVendors = JSON.parse(stored); return; } catch {}
  }
  cachedVendors = [...defaultVendors];
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedVendors)); } catch {}
}

// Kick off initial load
ensureLoaded();

function toRow(v: Partial<Vendor>): any {
  const row: any = {};
  if (v.id !== undefined) row.id = v.id;
  if (v.name !== undefined) row.name = v.name;
  if (v.taxId !== undefined) row.tax_id = v.taxId;
  if (v.type !== undefined) row.type = v.type;
  if (v.contactName !== undefined) row.contact_name = v.contactName;
  if (v.jobTitle !== undefined) row.job_title = v.jobTitle;
  if (v.phone !== undefined) row.phone = v.phone;
  if (v.extension !== undefined) row.extension = v.extension;
  if (v.address !== undefined) row.address = v.address;
  if (v.account !== undefined) row.account = v.account;
  if (v.password !== undefined && v.password.trim() !== '') {
    // If it's not already a bcrypt hash, hash it
    if (v.password.startsWith('$2a$') || v.password.startsWith('$2b$')) {
       row.password_hash = v.password;
    } else {
       row.password_hash = bcrypt.hashSync(v.password, 10);
    }
  }
  if (v.status !== undefined) row.status = v.status;
  if (v.certifications !== undefined) row.certifications = v.certifications;
  if (v.commissionRate !== undefined) row.commission_rate = v.commissionRate / 100;
  if (v.settlementCycle !== undefined) row.settlement_cycle = v.settlementCycle;
  if (v.bankInfo !== undefined) row.bank_info = v.bankInfo;
  if (v.createdAt !== undefined) row.created_at = v.createdAt;
  if (v.updatedAt !== undefined) row.updated_at = v.updatedAt;
  return row;
}

let lastVendorFetchTime = 0;
let isVendorFetching = false;

export const vendorService = {
  getAll: (): Vendor[] => {
    if (cachedVendors.length === 0) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try { cachedVendors = JSON.parse(stored); } catch { cachedVendors = [...defaultVendors]; }
      } else {
        cachedVendors = [...defaultVendors];
      }
    }
    // Background refresh with deduplication
    if (isSupabaseConfigured && !isVendorFetching && Date.now() - lastVendorFetchTime > 5000) {
      isVendorFetching = true;
      supabase.from(TABLE_NAME).select('*').order('created_at').then(({ data, error }) => {
        isVendorFetching = false;
        if (!error && data) {
          cachedVendors = data.map(mapRow);
          lastVendorFetchTime = Date.now();
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedVendors)); } catch {}
          window.dispatchEvent(new Event('vendors_refreshed'));
        }
      }).catch(() => {
        isVendorFetching = false;
      });
    }
    return [...cachedVendors];
  },

  getById: (id: string): Vendor | null => {
    return vendorService.getAll().find(v => v.id === id) || null;
  },

  saveAll: (vendors: Vendor[]): void => {
    cachedVendors = vendors;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Failed to save vendors locally:', error);
    }
  },

  create: async (data: Omit<Vendor, 'createdAt' | 'updatedAt'>): Promise<Vendor> => {
    const now = new Date().toISOString();
    const newVendor: Vendor = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from(TABLE_NAME).insert(toRow(newVendor));
      if (error) throw new Error(`Supabase建立失敗：${error.message}`);
    }

    cachedVendors.push(newVendor);
    vendorService.saveAll(cachedVendors);
    return newVendor;
  },

  update: async (id: string, data: Partial<Vendor>): Promise<void> => {
    const index = cachedVendors.findIndex(v => v.id === id);
    if (index === -1) return;

    const updatedAt = new Date().toISOString();
    const updated = { ...cachedVendors[index], ...data, updatedAt };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from(TABLE_NAME).update(toRow({ ...data, updatedAt })).eq('id', id);
      if (error) throw new Error(`Supabase更新失敗：${error.message}`);
    }

    cachedVendors[index] = updated;
    vendorService.saveAll(cachedVendors);
  },

  delete: async (id: string): Promise<void> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
      if (error) throw new Error(`Supabase刪除失敗：${error.message}`);
    }
    cachedVendors = cachedVendors.filter(v => v.id !== id);
    vendorService.saveAll(cachedVendors);
  },

  /** Verify vendor login via Supabase RPC (bcrypt) with localStorage fallback */
  login: async (account: string, password: string): Promise<Vendor | null> => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('verify_vendor_password', {
          p_account: account,
          p_password: password,
        });
        if (!error && Array.isArray(data) && data.length > 0) {
          return mapRow(data[0]);
        }
        if (error) console.warn('[vendorService] verify_vendor_password failed', error);
        return null;
      } catch (e) {
        console.warn('[vendorService] login RPC error', e);
        return null;
      }
    }
    
    // Fallback：本地比對明碼（不安全，只在無 Supabase 時才用）
    const all = vendorService.getAll();
    const found = all.find(v => v.account === account && v.password === password && v.status === 'active');
    return found || null;
  },
};