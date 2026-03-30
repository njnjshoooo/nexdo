import { FormSubmission } from '../types/form';
import { v4 as uuidv4 } from 'uuid';

// 這是存在你瀏覽器裡的鑰匙，不用後端，不用 API
const STORAGE_KEY = 'haolingju_submissions';

export const submissionService = {
  // 讀取：從瀏覽器拿資料
  getAll: async (): Promise<FormSubmission[]> => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load submissions:', error);
      return [];
    }
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

    const newSubmission: FormSubmission = {
      ...submission,
      data: processedData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      status: 'PENDING'
    };
    
    try {
      const all = await submissionService.getAll();
      all.push(newSubmission);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      console.log('Submission saved successfully. Total count:', all.length);
      
      // Trigger a storage event for other tabs
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      window.dispatchEvent(new Event('storage'));
    }
  },

  delete: async (id: string): Promise<void> => {
    const all = await submissionService.getAll();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all.filter(s => s.id !== id)));
  }
};