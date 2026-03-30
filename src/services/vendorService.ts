import { Vendor } from '../types/vendor';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const vendorService = {
  async login(account: string, password: string): Promise<Vendor | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('verify_vendor_password', {
        p_account: account,
        p_password: password,
      });
      if (error || !data?.success) return null;
      return data.vendor;
    }
    // localStorage fallback
    const stored = localStorage.getItem('haolingju_vendors');
    const vendors = stored ? JSON.parse(stored) : [];
    return vendors.find((v: any) => v.account === account && v.password === password) || null;
  },

  async getAll(): Promise<Vendor[]> {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('vendors').select('*');
      return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        taxId: row.tax_id,
        type: row.type,
        contactName: row.contact_name,
        jobTitle: row.job_title,
        phone: row.phone,
        extension: row.extension,
        address: row.address,
        account: row.account,
        status: row.status,
        certifications: row.certifications || [],
        billingCycle: row.billing_cycle,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    }
    const stored = localStorage.getItem('haolingju_vendors');
    return stored ? JSON.parse(stored) : [];
  },

  async getById(id: string): Promise<Vendor | null> {
    const all = await vendorService.getAll();
    return all.find(v => v.id === id) || null;
  },

  async create(
    data: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'> & { password: string }
  ): Promise<Vendor> {
    const newVendor = {
      ...data,
      id: `vendor-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('vendors').insert({
        id: newVendor.id,
        name: newVendor.name,
        tax_id: newVendor.taxId,
        type: newVendor.type,
        contact_name: newVendor.contactName,
        job_title: newVendor.jobTitle,
        phone: newVendor.phone,
        extension: newVendor.extension,
        address: newVendor.address,
        account: newVendor.account,
        password_hash: data.password, // Note: in production, hash on server
        status: newVendor.status,
        certifications: newVendor.certifications,
        billing_cycle: newVendor.billingCycle,
      });
      if (error) throw new Error(error.message);
    }

    const { password: _, ...vendorWithoutPw } = newVendor;
    return vendorWithoutPw as Vendor;
  },

  async update(id: string, updates: Partial<Vendor>): Promise<void> {
    if (isSupabaseConfigured) {
      const dbData: Record<string, any> = {};
      if (updates.name !== undefined) dbData.name = updates.name;
      if (updates.taxId !== undefined) dbData.tax_id = updates.taxId;
      if (updates.type !== undefined) dbData.type = updates.type;
      if (updates.contactName !== undefined) dbData.contact_name = updates.contactName;
      if (updates.jobTitle !== undefined) dbData.job_title = updates.jobTitle;
      if (updates.phone !== undefined) dbData.phone = updates.phone;
      if (updates.extension !== undefined) dbData.extension = updates.extension;
      if (updates.address !== undefined) dbData.address = updates.address;
      if (updates.status !== undefined) dbData.status = updates.status;
      if (updates.certifications !== undefined) dbData.certifications = updates.certifications;
      if (updates.billingCycle !== undefined) dbData.billing_cycle = updates.billingCycle;
      const { error } = await supabase.from('vendors').update(dbData).eq('id', id);
      if (error) throw new Error(error.message);
    }
  },

  async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('vendors').delete().eq('id', id);
      if (error) throw new Error(error.message);
    }
    return true;
  },
};
