import { Staff } from '../types/vendor';

const STORAGE_KEY = 'haolingju_staff';

export const staffService = {
  getAll: (vendorId: string): Staff[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    const allStaff = data ? JSON.parse(data) : [];
    return allStaff.filter((s: Staff) => s.vendorId === vendorId);
  },

  getById: (id: string): Staff | undefined => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return undefined;
    const allStaff = JSON.parse(data);
    return allStaff.find((s: Staff) => s.id === id);
  },

  create: (staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Staff => {
    const data = localStorage.getItem(STORAGE_KEY);
    const allStaff = data ? JSON.parse(data) : [];
    
    const newStaff: Staff = {
      ...staff,
      id: `staff-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    allStaff.push(newStaff);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allStaff));
    return newStaff;
  },

  update: (id: string, updates: Partial<Staff>): Staff | null => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const allStaff = JSON.parse(data);
    const index = allStaff.findIndex((s: Staff) => s.id === id);
    
    if (index === -1) return null;
    
    const updatedStaff = {
      ...allStaff[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    allStaff[index] = updatedStaff;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allStaff));
    return updatedStaff;
  },

  delete: (id: string): boolean => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return false;
    
    const allStaff = JSON.parse(data);
    const filtered = allStaff.filter((s: Staff) => s.id !== id);
    
    if (filtered.length === allStaff.length) return false;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
};
