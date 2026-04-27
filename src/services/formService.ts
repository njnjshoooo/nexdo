import { Form } from '../types/form';
import { v4 as uuidv4 } from 'uuid';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'haolingju_forms';
const TABLE_NAME = 'forms';

class FormService {
  private forms: Form[] = [];

  constructor() {
    this.loadCache();
    if (isSupabaseConfigured) {
      this.refresh().catch(err => console.warn('[formService] initial refresh failed', err));
    }
  }

  private mapRow(row: any): Form {
    return {
      id: row.id,
      formId: row.form_id,
      name: row.name,
      description: row.description ?? '',
      purpose: row.purpose,
      fields: Array.isArray(row.fields) ? row.fields : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private toRow(form: Partial<Form>): any {
    const row: any = {};
    if (form.id !== undefined) row.id = form.id;
    if (form.formId !== undefined) row.form_id = form.formId;
    if (form.name !== undefined) row.name = form.name;
    if (form.description !== undefined) row.description = form.description;
    if (form.purpose !== undefined) row.purpose = form.purpose;
    if (form.fields !== undefined) row.fields = form.fields;
    return row;
  }

  /** 從 localStorage 同步載入快取 */
  private loadCache() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        this.forms = JSON.parse(stored);
        return;
      } catch (e) {
        console.error('[formService] Failed to parse cache', e);
      }
    }
    // 無快取 → 用預設表單（無 Supabase 時的 fallback）
    if (!isSupabaseConfigured) {
      this.forms = this.getDefaultForms();
    }
  }

  /** 從 Supabase 拉最新並更新快取 */
  async refresh(): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      this.forms = (data ?? []).map(this.mapRow);
      this.saveCache();
      window.dispatchEvent(new CustomEvent('forms_refreshed'));
    } catch (e) {
      console.warn('[formService] refresh failed', e);
    }
  }

  /** 已棄用：保留以維持外部相容（無實際呼叫差異） */
  public load() {
    this.loadCache();
  }

  private getDefaultForms(): Form[] {
    const now = new Date().toISOString();
    return [
      {
        id: '00000000-0000-0000-0000-000000000001',
        formId: 'default-contact',
        name: '預設聯絡表單',
        description: '預設的聯絡表單',
        purpose: 'CONSULTATION',
        fields: [
          { id: 'name', label: '姓名', type: 'text', required: true },
          { id: 'phone', label: '聯絡電話', type: 'text', required: true },
          { id: 'message', label: '需求說明', type: 'textarea', required: false }
        ],
        createdAt: now,
        updatedAt: now
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        formId: 'home-organize-booking-form',
        name: '居家整聊預約表單',
        description: '「居家整聊」服務預約用',
        purpose: 'BOOKING',
        fields: [
          { id: 'name', label: '姓名', type: 'text', required: true },
          { id: 'phone', label: '聯絡電話', type: 'text', required: true },
          { id: 'email', label: '電子郵件', type: 'text', required: true },
          { id: 'address', label: '服務地址', type: 'text', required: true },
        ],
        createdAt: now,
        updatedAt: now
      }
    ];
  }

  private saveCache() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.forms));
    } catch (e) {
      console.warn('[formService] saveCache failed', e);
    }
  }

  getAll(): Form[] {
    return [...this.forms].sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  getById(id: string): Form | undefined {
    return this.forms.find(f => f.id === id);
  }

  getByFormId(formId: string): Form | undefined {
    const normalizedId = formId.toLowerCase();
    return this.forms.find(f => f.formId.toLowerCase() === normalizedId);
  }

  create(form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>): Form {
    const formId = form.formId || `form_${Math.random().toString(36).substr(2, 9)}`;
    if (this.forms.some(f => f.formId === formId)) {
      throw new Error('Form ID already exists');
    }
    const now = new Date().toISOString();
    const newForm: Form = {
      ...form,
      id: uuidv4(),
      formId,
      createdAt: now,
      updatedAt: now,
    };

    // 1. Optimistic in-memory update
    this.forms.push(newForm);
    this.saveCache();

    // 2. Background Supabase write
    if (isSupabaseConfigured) {
      supabase.from(TABLE_NAME).insert(this.toRow(newForm))
        .then(({ error }) => {
          if (error) console.error('[formService] create failed in Supabase', error);
        });
    }

    return newForm;
  }

  update(id: string, updates: Partial<Omit<Form, 'id' | 'createdAt' | 'updatedAt'>>): Form | undefined {
    const index = this.forms.findIndex(f => f.id === id);
    if (index === -1) return undefined;

    if (updates.formId && this.forms.some(f => f.formId === updates.formId && f.id !== id)) {
      throw new Error('Form ID already exists');
    }

    const updated: Form = {
      ...this.forms[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.forms[index] = updated;
    this.saveCache();

    if (isSupabaseConfigured) {
      supabase.from(TABLE_NAME).update(this.toRow({ ...updates, updatedAt: updated.updatedAt }))
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('[formService] update failed in Supabase', error);
        });
    }

    return updated;
  }

  delete(id: string): boolean {
    const initialLength = this.forms.length;
    this.forms = this.forms.filter(f => f.id !== id);
    if (this.forms.length === initialLength) return false;
    this.saveCache();

    if (isSupabaseConfigured) {
      supabase.from(TABLE_NAME).delete().eq('id', id)
        .then(({ error }) => {
          if (error) console.error('[formService] delete failed in Supabase', error);
        });
    }

    return true;
  }
}

export const formService = new FormService();
