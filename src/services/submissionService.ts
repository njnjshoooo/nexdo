import { FormSubmission } from '../types/form';
import { v4 as uuidv4 } from 'uuid';
import localforage from 'localforage';

// 這是存在你瀏覽器裡的鑰匙，不用後端，不用 API
const STORAGE_KEY = 'haolingju_submissions';

// Configure localforage
localforage.config({
  name: 'haolingju',
  storeName: 'submissions'
});

export const submissionService = {
  // 讀取：從瀏覽器拿資料
  getAll: async (): Promise<FormSubmission[]> => {
    try {
      const stored = await localforage.getItem<FormSubmission[]>(STORAGE_KEY);
      if (stored) return stored;

      // Migration from localStorage
      const oldStored = localStorage.getItem(STORAGE_KEY);
      if (oldStored) {
        try {
          const parsed = JSON.parse(oldStored);
          await localforage.setItem(STORAGE_KEY, parsed);
          // Clear localStorage to free up space
          localStorage.removeItem(STORAGE_KEY); 
          return parsed;
        } catch (e) {
          console.error('Failed to parse old submissions', e);
        }
      }

      return [];
    } catch (error) {
      console.error('Failed to load submissions:', error);
      return [];
    }
  },

  generateBookingId: async (formId: string): Promise<string> => {
    const submissions = await submissionService.getAll();
    
    // 1. Generate Form Abbreviation
    // e.g., home-organize-booking-form -> HOME-ORG
    const parts = formId.replace(/-form$/, '').split('-');
    const formAbbr = parts.slice(0, 2).map(p => p.toUpperCase()).join('-');
    
    // 2. Generate Date Prefix (YYMMDD)
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${yy}${mm}${dd}`;
    
    // 3. Generate Sequence
    // Format: BK-[FORM]-[YYMMDD]-[SEQ]
    const prefix = `BK-${formAbbr}-${datePrefix}-`;
    
    const todaySubmissions = submissions.filter(s => s.bookingId && s.bookingId.startsWith(prefix));
    
    let maxSequence = 0;
    todaySubmissions.forEach(s => {
      const seqStr = s.bookingId!.slice(-3);
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSequence) {
        maxSequence = seq;
      }
    });
    
    const sequence = String(maxSequence + 1).padStart(3, '0');
    
    return `${prefix}${sequence}`;
  },

  getById: async (id: string): Promise<FormSubmission | null> => {
    const all = await submissionService.getAll();
    return all.find(s => s.id === id) || null;
  },

  // 存檔：把表單內容寫進瀏覽器
  create: async (submission: Omit<FormSubmission, 'id' | 'createdAt'>): Promise<FormSubmission> => {
    console.log('Creating submission for form:', submission.formId);
    
    // Process data to handle Files (JSON.stringify doesn't support them)
    const processedData = { ...submission.data };
    Object.keys(processedData).forEach(key => {
      const value = processedData[key];
      if (value instanceof File) {
        processedData[key] = `[檔案: ${value.name}]`;
      }
    });

    const bookingId = await submissionService.generateBookingId(submission.formId);

    const newSubmission: FormSubmission = {
      ...submission,
      data: processedData,
      id: uuidv4(),
      bookingId,
      createdAt: new Date().toISOString(),
      status: 'PENDING'
    };
    
    try {
      const all = await submissionService.getAll();
      all.push(newSubmission);
      await localforage.setItem(STORAGE_KEY, all);
      console.log('Submission saved successfully. Total count:', all.length);
      
      // Trigger a storage event for other tabs (localforage doesn't trigger this automatically)
      window.dispatchEvent(new Event('storage'));
      
      return newSubmission;
    } catch (error) {
      console.error('Failed to save submission:', error);
      throw error;
    }
  },

  updateStatus: async (id: string, status: FormSubmission['status']): Promise<void> => {
    const all = await submissionService.getAll();
    const index = all.findIndex(s => s.id === id);
    if (index !== -1 && status) {
      all[index].status = status;
      await localforage.setItem(STORAGE_KEY, all);
      window.dispatchEvent(new Event('storage'));
    }
  },

  delete: async (id: string): Promise<void> => {
    const all = await submissionService.getAll();
    await localforage.setItem(STORAGE_KEY, all.filter(s => s.id !== id));
    window.dispatchEvent(new Event('storage'));
  }
};
