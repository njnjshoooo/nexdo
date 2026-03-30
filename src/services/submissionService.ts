import { FormSubmission } from '../types/form';
import { v4 as uuidv4 } from 'uuid';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'haolingju_submissions';

export const submissionService = {
  // Read from Supabase first, fallback to localStorage
  getAll: async (): Promise<FormSubmission[]> => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('submissions').select('*');
        if (!error && data) {
          const submissions = data.map(row => ({
            id: row.id,
            formId: row.form_id,
            userId: row.user_id,
            pageSlug: row.page_slug,
            pageTitle: row.page_title,
            data: row.data || {},
            createdAt: row.created_at,
            status: row.status,
          } as FormSubmission));
          // Update cache
          localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
          return submissions;
        }
      } catch (err) {
        console.error('submissionService.getAll Supabase error:', err);
      }
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load submissions:', error);
      return [];
    }
  },

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

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('submissions').insert({
        id: newSubmission.id,
        form_id: newSubmission.formId,
        user_id: newSubmission.userId || null,
        page_slug: newSubmission.pageSlug,
        page_title: newSubmission.pageTitle,
        data: newSubmission.data,
        status: newSubmission.status,
        created_at: newSubmission.createdAt,
      });
      if (error) throw new Error(error.message);
    }

    // Also update localStorage cache
    try {
      const all = await submissionService.getAll();
      all.push(newSubmission);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      console.log('Submission saved successfully. Total count:', all.length);

      // Trigger a storage event for other tabs
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Failed to save submission to cache:', error);
    }

    return newSubmission;
  },

  updateStatus: async (id: string, status: FormSubmission['status']): Promise<void> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('submissions').update({ status }).eq('id', id);
      if (error) throw new Error(error.message);
    }

    // Update cache
    const all = await submissionService.getAll();
    const index = all.findIndex(s => s.id === id);
    if (index !== -1 && status) {
      all[index].status = status;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      window.dispatchEvent(new Event('storage'));
    }
  },

  delete: async (id: string): Promise<void> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('submissions').delete().eq('id', id);
      if (error) throw new Error(error.message);
    }

    const all = await submissionService.getAll();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all.filter(s => s.id !== id)));
  }
};
