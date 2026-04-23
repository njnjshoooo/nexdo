import { Vendor } from '../types/vendor';

const STORAGE_KEY = 'vendors';

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

export const vendorService = {
  getAll: (): Vendor[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Initialize if not exists
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultVendors));
      return defaultVendors;
    } catch (error) {
      console.error('Failed to load vendors:', error);
      return defaultVendors;
    }
  },

  getById: (id: string): Vendor | null => {
    const all = vendorService.getAll();
    return all.find(v => v.id === id) || null;
  },

  saveAll: (vendors: Vendor[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Failed to save vendors:', error);
    }
  }
};
