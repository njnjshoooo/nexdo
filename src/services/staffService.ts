import { Staff } from '../types/vendor';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'haolingju_staff';

/** Helper: read all staff from localStorage */
function loadCache(): Staff[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

/** Helper: write all staff to localStorage */
function saveCache(allStaff: Staff[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allStaff));
}

/** Map a Supabase row to a local Staff object */
function mapRowToStaff(row: any): Staff {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    birthDate: row.birth_date,
    gender: row.gender,
    photoUrl: row.photo_url,
    hasPoliceRecord: row.has_police_record,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const staffService = {
  /** Fetch all staff from Supabase and update local cache */
  refresh: async (): Promise<void> => {
    if (!isSupabaseConfigured) return;

    const { data, error } = await supabase.from('staff').select('*');
    if (error) {
      console.error('staffService.refresh error:', error);
      return;
    }
    if (data) {
      const allStaff = data.map(mapRowToStaff);
      saveCache(allStaff);
    }
  },

  getAll: async (vendorId: string): Promise<Staff[]> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('staff').select('*').eq('vendor_id', vendorId);
      if (!error && data) {
        const staff = data.map(mapRowToStaff);
        // Update cache for this vendor
        const cached = loadCache();
        const otherVendorStaff = cached.filter(s => s.vendorId !== vendorId);
        saveCache([...otherVendorStaff, ...staff]);
        return staff;
      }
    }

    // Fallback to cache
    const allStaff = loadCache();
    return allStaff.filter((s: Staff) => s.vendorId === vendorId);
  },

  getById: async (id: string): Promise<Staff | undefined> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('staff').select('*').eq('id', id).single();
      if (!error && data) {
        return mapRowToStaff(data);
      }
    }

    // Fallback to cache
    const allStaff = loadCache();
    return allStaff.find((s: Staff) => s.id === id);
  },

  create: async (staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<Staff> => {
    const newStaff: Staff = {
      ...staff,
      id: `staff-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('staff').insert({
        id: newStaff.id,
        vendor_id: newStaff.vendorId,
        name: newStaff.name,
        phone: newStaff.phone,
        email: newStaff.email,
        birth_date: newStaff.birthDate,
        gender: newStaff.gender,
        photo_url: newStaff.photoUrl || null,
        has_police_record: newStaff.hasPoliceRecord,
        created_at: newStaff.createdAt,
        updated_at: newStaff.updatedAt,
      });
      if (error) throw new Error(error.message);
    }

    // Update cache
    const allStaff = loadCache();
    allStaff.push(newStaff);
    saveCache(allStaff);
    return newStaff;
  },

  update: async (id: string, updates: Partial<Staff>): Promise<Staff | null> => {
    if (isSupabaseConfigured) {
      const dbData: Record<string, any> = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) dbData.name = updates.name;
      if (updates.vendorId !== undefined) dbData.vendor_id = updates.vendorId;
      if (updates.phone !== undefined) dbData.phone = updates.phone;
      if (updates.email !== undefined) dbData.email = updates.email;
      if (updates.birthDate !== undefined) dbData.birth_date = updates.birthDate;
      if (updates.gender !== undefined) dbData.gender = updates.gender;
      if (updates.photoUrl !== undefined) dbData.photo_url = updates.photoUrl;
      if (updates.hasPoliceRecord !== undefined) dbData.has_police_record = updates.hasPoliceRecord;

      const { error } = await supabase.from('staff').update(dbData).eq('id', id);
      if (error) throw new Error(error.message);
    }

    // Update cache
    const allStaff = loadCache();
    const index = allStaff.findIndex((s: Staff) => s.id === id);
    if (index === -1) return null;

    const updatedStaff = {
      ...allStaff[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    allStaff[index] = updatedStaff;
    saveCache(allStaff);
    return updatedStaff;
  },

  delete: async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('staff').delete().eq('id', id);
      if (error) throw new Error(error.message);
    }

    // Update cache
    const allStaff = loadCache();
    const filtered = allStaff.filter((s: Staff) => s.id !== id);

    if (filtered.length === allStaff.length) return false;

    saveCache(filtered);
    return true;
  }
};

// Background refresh on module load
if (isSupabaseConfigured) {
  staffService.refresh().catch(err => console.error('staffService: background refresh failed', err));
}
