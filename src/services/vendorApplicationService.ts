import { VendorApplication } from '../types/vendor';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'vendor_applications';
const TABLE_NAME = 'vendor_applications';

let cachedApplications: VendorApplication[] = [];

// Load initially from local storage as fallback
function ensureLoaded() {
  if (cachedApplications.length === 0) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        cachedApplications = JSON.parse(stored);
      } catch (e) {
        cachedApplications = [];
      }
    }
  }
}

// Convert DB row to JS Object
function mapRow(row: any): VendorApplication {
  return {
    id: row.id,
    name: row.name,
    taxId: row.tax_id ?? '',
    contactName: row.contact_name ?? '',
    jobTitle: row.job_title ?? '',
    phone: row.phone ?? '',
    extension: row.extension ?? '',
    email: row.email ?? '',
    address: row.address ?? '',
    motivation: row.motivation ?? '',
    status: row.status ?? 'pending',
    createdAt: row.created_at,
  };
}

// Convert JS Object to DB row
function toRow(a: Partial<VendorApplication>): any {
  const row: any = {};
  if (a.id !== undefined) row.id = a.id;
  if (a.name !== undefined) row.name = a.name;
  if (a.taxId !== undefined) row.tax_id = a.taxId;
  if (a.contactName !== undefined) row.contact_name = a.contactName;
  if (a.jobTitle !== undefined) row.job_title = a.jobTitle;
  if (a.phone !== undefined) row.phone = a.phone;
  if (a.extension !== undefined) row.extension = a.extension;
  if (a.email !== undefined) row.email = a.email;
  if (a.address !== undefined) row.address = a.address;
  if (a.motivation !== undefined) row.motivation = a.motivation;
  if (a.status !== undefined) row.status = a.status;
  if (a.createdAt !== undefined) row.created_at = a.createdAt;
  return row;
}

ensureLoaded();

export const vendorApplicationService = {
  getAll: (): VendorApplication[] => {
    ensureLoaded();
    return [...cachedApplications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  syncFromSupabase: async (): Promise<VendorApplication[]> => {
    if (!isSupabaseConfigured) return vendorApplicationService.getAll();

    try {
      const { data, error } = await supabase.from(TABLE_NAME).select('*').order('created_at', { ascending: false });
      if (error) {
        // Table might not exist yet, fallback to localStorage
        console.warn('Vendor applications table might not exist yet', error);
        return vendorApplicationService.getAll();
      }
      
      cachedApplications = data.map(mapRow);
      vendorApplicationService.saveAll(cachedApplications);
      return cachedApplications;
    } catch (err) {
      console.warn('Failed to fetch vendor applications from supabase', err);
      return vendorApplicationService.getAll();
    }
  },

  saveAll: (applications: VendorApplication[]) => {
    cachedApplications = applications;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  },

  create: async (data: Omit<VendorApplication, 'id' | 'createdAt' | 'status'>): Promise<VendorApplication> => {
    const now = new Date().toISOString();
    const newApplication: VendorApplication = {
      ...data,
      id: 'va_' + Date.now().toString(36),
      status: 'pending',
      createdAt: now,
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from(TABLE_NAME).insert(toRow(newApplication));
      if (error) {
        console.warn('Supabase create failed, saving locally', error);
      }
    }

    cachedApplications.push(newApplication);
    vendorApplicationService.saveAll(cachedApplications);
    return newApplication;
  },

  updateStatus: async (id: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> => {
    const index = cachedApplications.findIndex(a => a.id === id);
    if (index === -1) return;

    if (isSupabaseConfigured) {
      const { error } = await supabase.from(TABLE_NAME).update({ status }).eq('id', id);
      if (error) throw new Error(`Supabase更新失敗：${error.message}`);
    }

    cachedApplications[index].status = status;
    vendorApplicationService.saveAll(cachedApplications);
  }
};
