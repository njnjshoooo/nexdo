import { Staff } from '../types/vendor';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'haolingju_staff';
const TABLE_NAME = 'staff';

function mapRow(row: any): Staff {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    name: row.name,
    phone: row.phone ?? '',
    email: row.email ?? '',
    birthDate: row.birth_date ?? '',
    gender: row.gender ?? '',
    photoUrl: row.photo_url ?? '',
    hasPoliceRecord: !!row.has_police_record,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as Staff;
}

function toRow(s: Partial<Staff>): any {
  const row: any = {};
  if (s.id !== undefined) row.id = s.id;
  if (s.vendorId !== undefined) row.vendor_id = s.vendorId;
  if (s.name !== undefined) row.name = s.name;
  if (s.phone !== undefined) row.phone = s.phone;
  if (s.email !== undefined) row.email = s.email;
  if (s.birthDate !== undefined) row.birth_date = s.birthDate;
  if (s.gender !== undefined) row.gender = s.gender;
  if (s.photoUrl !== undefined) row.photo_url = s.photoUrl;
  if (s.hasPoliceRecord !== undefined) row.has_police_record = s.hasPoliceRecord;
  return row;
}

function loadCache(): Staff[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveCache(allStaff: Staff[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(allStaff)); } catch {}
}

// Background refresh from Supabase
let refreshing = false;
async function backgroundRefresh() {
  if (!isSupabaseConfigured || refreshing) return;
  refreshing = true;
  try {
    const { data, error } = await supabase.from(TABLE_NAME).select('*');
    if (!error && data) {
      saveCache(data.map(mapRow));
      window.dispatchEvent(new Event('staff_refreshed'));
    }
  } catch (e) {
    console.warn('[staffService] refresh failed', e);
  } finally {
    refreshing = false;
  }
}

if (isSupabaseConfigured) {
  backgroundRefresh();
}

export const staffService = {
  getAll: (vendorId: string): Staff[] => {
    backgroundRefresh();
    return loadCache().filter(s => s.vendorId === vendorId);
  },

  getById: (id: string): Staff | undefined => {
    return loadCache().find(s => s.id === id);
  },

  create: (staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Staff => {
    const now = new Date().toISOString();
    const newStaff: Staff = {
      ...staff,
      id: `staff-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    const all = loadCache();
    all.push(newStaff);
    saveCache(all);

    if (isSupabaseConfigured) {
      supabase.from(TABLE_NAME).insert(toRow(newStaff)).then(({ error }) => {
        if (error) console.error('[staffService] create failed in Supabase', error);
      });
    }
    return newStaff;
  },

  update: (id: string, updates: Partial<Staff>): Staff | null => {
    const all = loadCache();
    const index = all.findIndex(s => s.id === id);
    if (index === -1) return null;
    const updated = { ...all[index], ...updates, updatedAt: new Date().toISOString() };
    all[index] = updated;
    saveCache(all);

    if (isSupabaseConfigured) {
      supabase.from(TABLE_NAME).update(toRow(updates)).eq('id', id).then(({ error }) => {
        if (error) console.error('[staffService] update failed in Supabase', error);
      });
    }
    return updated;
  },

  delete: (id: string): boolean => {
    const all = loadCache();
    const filtered = all.filter(s => s.id !== id);
    if (filtered.length === all.length) return false;
    saveCache(filtered);

    if (isSupabaseConfigured) {
      supabase.from(TABLE_NAME).delete().eq('id', id).then(({ error }) => {
        if (error) console.error('[staffService] delete failed in Supabase', error);
      });
    }
    return true;
  }
};
