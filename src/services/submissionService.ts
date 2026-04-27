import { FormSubmission } from '../types/form';
import { v4 as uuidv4 } from 'uuid';
import localforage from 'localforage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'haolingju_submissions';
const TABLE_NAME = 'submissions';

localforage.config({
  name: 'haolingju',
  storeName: 'submissions'
});

function mapRow(row: any): FormSubmission {
  return {
    id: row.id,
    formId: row.form_id,
    userId: row.user_id ?? undefined,
    pageSlug: row.page_slug ?? undefined,
    pageTitle: row.page_title ?? undefined,
    data: row.data ?? {},
    status: row.status,
    bookingId: row.booking_id ?? undefined,
    createdAt: row.created_at,
  } as FormSubmission;
}

function toRow(s: Partial<FormSubmission>): any {
  const row: any = {};
  if (s.id !== undefined) row.id = s.id;
  if (s.formId !== undefined) row.form_id = s.formId;
  if ((s as any).userId !== undefined) row.user_id = (s as any).userId;
  if ((s as any).pageSlug !== undefined) row.page_slug = (s as any).pageSlug;
  if ((s as any).pageTitle !== undefined) row.page_title = (s as any).pageTitle;
  if (s.data !== undefined) row.data = s.data;
  if (s.status !== undefined) row.status = s.status;
  if (s.bookingId !== undefined) row.booking_id = s.bookingId;
  if (s.createdAt !== undefined) row.created_at = s.createdAt;
  return row;
}

async function loadCache(): Promise<FormSubmission[]> {
  try {
    const stored = await localforage.getItem<FormSubmission[]>(STORAGE_KEY);
    if (stored) return stored;
    const oldStored = localStorage.getItem(STORAGE_KEY);
    if (oldStored) {
      try {
        const parsed = JSON.parse(oldStored);
        await localforage.setItem(STORAGE_KEY, parsed);
        localStorage.removeItem(STORAGE_KEY);
        return parsed;
      } catch {}
    }
    return [];
  } catch (e) {
    console.error('[submissionService] loadCache failed', e);
    return [];
  }
}

async function saveCache(items: FormSubmission[]) {
  try { await localforage.setItem(STORAGE_KEY, items); }
  catch (e) { console.warn('[submissionService] saveCache failed', e); }
}

export const submissionService = {
  getAll: async (): Promise<FormSubmission[]> => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(TABLE_NAME)
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          const mapped = data.map(mapRow);
          await saveCache(mapped);
          return mapped;
        }
        if (error) console.warn('[submissionService] Supabase getAll failed', error);
      } catch (e) {
        console.warn('[submissionService] Supabase getAll error', e);
      }
    }
    return loadCache();
  },

  generateBookingId: async (formId: string): Promise<string> => {
    const submissions = await submissionService.getAll();
    const parts = formId.replace(/-form$/, '').split('-');
    const formAbbr = parts.slice(0, 2).map(p => p.toUpperCase()).join('-');
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${yy}${mm}${dd}`;
    const prefix = `BK-${formAbbr}-${datePrefix}-`;
    const todaySubmissions = submissions.filter(s => s.bookingId && s.bookingId.startsWith(prefix));
    let maxSequence = 0;
    todaySubmissions.forEach(s => {
      const seqStr = s.bookingId!.slice(-3);
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSequence) maxSequence = seq;
    });
    const sequence = String(maxSequence + 1).padStart(3, '0');
    return `${prefix}${sequence}`;
  },

  getById: async (id: string): Promise<FormSubmission | null> => {
    const all = await submissionService.getAll();
    return all.find(s => s.id === id) || null;
  },

  create: async (submission: Omit<FormSubmission, 'id' | 'createdAt'>): Promise<FormSubmission> => {
    // 把 File 轉成字串（無法存入 JSONB）
    const processedData: any = { ...submission.data };
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
      status: 'PENDING',
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from(TABLE_NAME).insert(toRow(newSubmission));
      if (error) {
        console.error('[submissionService] create failed in Supabase', error);
        throw new Error(`提交表單失敗：${error.message}`);
      }
    }

    // Update local cache
    const all = await loadCache();
    all.unshift(newSubmission);
    await saveCache(all);
    window.dispatchEvent(new Event('storage'));
    return newSubmission;
  },

  updateStatus: async (id: string, status: FormSubmission['status']): Promise<void> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from(TABLE_NAME).update({ status }).eq('id', id);
      if (error) {
        console.error('[submissionService] updateStatus failed in Supabase', error);
        throw new Error(`更新狀態失敗：${error.message}`);
      }
    }
    const all = await loadCache();
    const idx = all.findIndex(s => s.id === id);
    if (idx !== -1 && status) {
      all[idx].status = status;
      await saveCache(all);
      window.dispatchEvent(new Event('storage'));
    }
  },

  delete: async (id: string): Promise<void> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
      if (error) {
        console.error('[submissionService] delete failed in Supabase', error);
        throw new Error(`刪除失敗：${error.message}`);
      }
    }
    const all = await loadCache();
    await saveCache(all.filter(s => s.id !== id));
    window.dispatchEvent(new Event('storage'));
  }
};
