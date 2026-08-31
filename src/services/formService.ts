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
      formId: row.form_id || row.formId,
      name: row.name,
      description: row.description ?? '',
      purpose: row.purpose,
      fields: Array.isArray(row.fields) ? row.fields : [],
      createdAt: row.created_at || row.createdAt || new Date().toISOString(),
      updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
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
    if (form.createdAt !== undefined) row.created_at = form.createdAt;
    if (form.updatedAt !== undefined) row.updated_at = form.updatedAt;
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

  private refreshPromise: Promise<void> | null = null;
  private lastFetchTime = 0;

  /** 從 Supabase / API 拉最新並更新快取 */
  async refresh(force = false): Promise<void> {
    if (!isSupabaseConfigured && !window.location) return;

    if (!force && Date.now() - this.lastFetchTime < 300000) {
      if (this.refreshPromise) return this.refreshPromise;
      if (this.forms.length > 0) return;
    }

    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      try {
        let loadedForms: Form[] | null = null;

        // 優先嘗試透過後端 API 取得
        try {
          const res = await fetch('/api/forms');
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
              loadedForms = json.data.map((row: any) => this.mapRow(row));
            }
          }
        } catch (apiErr) {
          console.warn('[formService] API fetch failed, fallback to client Supabase', apiErr);
        }

        // 若 API 未回應或非 fullstack，直接使用 Supabase Client 讀取
        if (!loadedForms && isSupabaseConfigured) {
          const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .order('updated_at', { ascending: false });

          if (error) throw error;
          loadedForms = (data ?? []).map(row => this.mapRow(row));
        }

        if (loadedForms && loadedForms.length > 0) {
          this.forms = loadedForms;
          this.saveCache();
        } else if (this.forms.length === 0) {
          this.forms = this.getDefaultForms();
          this.saveCache();
        }

        this.lastFetchTime = Date.now();
        window.dispatchEvent(new CustomEvent('forms_refreshed'));
      } catch (e) {
        console.warn('[formService] refresh failed', e);
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
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
    if (!formId) return undefined;
    const normalizedId = formId.toLowerCase();
    return this.forms.find(f => f.formId?.toLowerCase() === normalizedId);
  }

  async create(form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>): Promise<Form> {
    const formId = form.formId || `form_${Math.random().toString(36).substr(2, 9)}`;
    if (this.forms.some(f => f.formId === formId)) {
      throw new Error('表單 ID (formId) 已存在，請使用其他代碼');
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

    // 2. Persist to Backend API / Supabase
    let persisted = false;
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', form: newForm }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) persisted = true;
      }
    } catch (e) {
      console.warn('[formService] API create failed, trying client Supabase', e);
    }

    if (!persisted && isSupabaseConfigured) {
      const { error } = await supabase.from(TABLE_NAME).insert(this.toRow(newForm));
      if (error) {
        console.error('[formService] create failed in Supabase', error);
        throw new Error(`表單建立失敗：${error.message}`);
      }
    }

    return newForm;
  }

  async update(id: string, updates: Partial<Omit<Form, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Form> {
    const index = this.forms.findIndex(f => f.id === id || f.formId === id);
    if (index === -1) {
      throw new Error('找不到欲更新的表單');
    }

    const currentForm = this.forms[index];
    const actualId = currentForm.id;

    if (updates.formId && this.forms.some(f => f.formId === updates.formId && f.id !== actualId)) {
      throw new Error('表單 ID (formId) 已被其他表單使用');
    }

    const updated: Form = {
      ...currentForm,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.forms[index] = updated;
    this.saveCache();

    // Persist to Backend API / Supabase
    let persisted = false;
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: actualId,
          updates: {
            ...updates,
            updatedAt: updated.updatedAt,
          },
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) persisted = true;
      }
    } catch (e) {
      console.warn('[formService] API update failed, trying client Supabase', e);
    }

    if (!persisted && isSupabaseConfigured) {
      const { error } = await supabase
        .from(TABLE_NAME)
        .update(this.toRow({ ...updates, updatedAt: updated.updatedAt }))
        .eq('id', actualId);

      if (error) {
        console.error('[formService] update failed in Supabase', error);
        throw new Error(`表單更新失敗：${error.message}`);
      }
    }

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const target = this.forms.find(f => f.id === id || f.formId === id);
    if (!target) return false;

    const actualId = target.id;
    this.forms = this.forms.filter(f => f.id !== actualId);
    this.saveCache();

    let deleted = false;
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: actualId }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) deleted = true;
      }
    } catch (e) {
      console.warn('[formService] API delete failed, trying client Supabase', e);
    }

    if (!deleted && isSupabaseConfigured) {
      const { error } = await supabase.from(TABLE_NAME).delete().eq('id', actualId);
      if (error) {
        console.error('[formService] delete failed in Supabase', error);
        throw new Error(`表單刪除失敗：${error.message}`);
      }
    }

    return true;
  }
}

export const formService = new FormService();
