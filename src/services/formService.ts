import { Form } from '../types/form';
import { v4 as uuidv4 } from 'uuid';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'haolingju_forms';

class FormService {
  private forms: Form[] = [];

  constructor() {
    this.load();

    // Background refresh from Supabase
    if (isSupabaseConfigured) {
      this.refresh().catch(err => console.error('FormService: background refresh failed', err));
    }
  }

  public load() {
    const stored = localStorage.getItem(STORAGE_KEY);
    const defaults = this.getDefaultForms();

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Ensure all default forms exist in the stored list and have latest fields
        const merged = [...parsed];
        let updated = false;
        defaults.forEach(def => {
          const existingIndex = merged.findIndex((f: Form) => f.formId === def.formId);
          if (existingIndex === -1) {
            merged.push(def);
            updated = true;
          } else {
            const existingForm = merged[existingIndex];
            const existingFieldIds = new Set(existingForm.fields.map((f: any) => f.id));
            const missingFields = def.fields.filter(f => !existingFieldIds.has(f.id));

            if (missingFields.length > 0) {
              existingForm.fields = [...existingForm.fields, ...missingFields];
              existingForm.updatedAt = new Date().toISOString();
              updated = true;
            }
          }
        });
        this.forms = merged;
        if (updated) {
          this.saveToCache();
        }
      } catch (e) {
        console.error('Failed to parse forms from local storage', e);
        this.forms = defaults;
      }
    } else {
      this.forms = defaults;
    }
  }

  private getDefaultForms(): Form[] {
    const now = new Date().toISOString();
    return [
      {
        id: '0',
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
        id: '1',
        formId: 'home-organize-booking-form',
        name: '居家整聊預約表單',
        description: '「居家整聊」服務預約用',
        purpose: 'BOOKING',
        fields: [
          { id: 'name', label: '姓名', type: 'text', required: true },
          { id: 'phone', label: '聯絡電話', type: 'text', required: true },
          { id: 'email', label: '電子郵件', type: 'text', required: true },
          { id: 'address', label: '服務地址', type: 'text', required: true },
          { id: 'lineId', label: 'LINE ID (選填)', type: 'text', required: false },
          { id: 'preferredDate1', label: '期望日期 1', type: 'date', required: true },
          { id: 'preferredDate2', label: '期望日期 2', type: 'date', required: true },
          { id: 'preferredDate3', label: '期望日期 3', type: 'date', required: true },
          {
            id: 'preferredTimeSlot',
            label: '期望時段',
            type: 'radio',
            required: true,
            options: [
              { id: 'slot-morning', label: '9:00~12:00', value: '9:00~12:00' },
              { id: 'slot-afternoon', label: '13:00~18:00', value: '13:00~18:00' }
            ]
          },
          {
            id: 'area',
            label: '想要進行整聊的區域',
            type: 'checkbox',
            required: true,
            options: [
              { id: 'opt-living', label: '客廳', value: '客廳' },
              { id: 'opt-dining', label: '餐廳', value: '餐廳' },
              { id: 'opt-kitchen', label: '廚房', value: '廚房' },
              { id: 'opt-bedroom', label: '臥房', value: '臥房' },
              { id: 'opt-kids', label: '小孩房', value: '小孩房' },
              { id: 'opt-bathroom', label: '浴室', value: '浴室' },
              { id: 'opt-storage', label: '儲藏室', value: '儲藏室' },
              { id: 'opt-study', label: '書房', value: '書房' },
              { id: 'opt-balcony', label: '陽台', value: '陽台' }
            ]
          },
          { id: 'photos', label: '上傳環境照片', type: 'file', required: false }
        ],
        createdAt: now,
        updatedAt: now
      }
    ];
  }

  private saveToCache() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.forms));
  }

  /** Fetch all forms from Supabase and update local cache */
  async refresh(): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { data, error } = await supabase.from('forms').select('*');
    if (error) {
      console.error('FormService.refresh error:', error);
      return;
    }
    if (data && data.length > 0) {
      const supabaseForms = data.map(row => ({
        id: row.id,
        formId: row.form_id,
        name: row.name,
        description: row.description,
        purpose: row.purpose,
        fields: row.fields || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      } as Form));

      // Merge with defaults (ensure defaults always exist)
      const defaults = this.getDefaultForms();
      const merged = [...supabaseForms];
      defaults.forEach(def => {
        if (!merged.some(f => f.formId === def.formId)) {
          merged.push(def);
        }
      });
      this.forms = merged;
      this.saveToCache();
    }
  }

  getAll(): Form[] {
    this.load();
    return [...this.forms].sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  getById(id: string): Form | undefined {
    this.load();
    return this.forms.find(f => f.id === id);
  }

  getByFormId(formId: string): Form | undefined {
    this.load();
    const normalizedId = formId.toLowerCase();
    return this.forms.find(f => f.formId.toLowerCase() === normalizedId);
  }

  async create(form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>): Promise<Form> {
    const formId = form.formId || `form_${Math.random().toString(36).substr(2, 9)}`;
    if (this.forms.some(f => f.formId === formId)) {
      throw new Error('Form ID already exists');
    }
    const newForm: Form = {
      ...form,
      id: uuidv4(),
      formId: formId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('forms').insert({
        id: newForm.id,
        form_id: newForm.formId,
        name: newForm.name,
        description: newForm.description,
        purpose: newForm.purpose || null,
        fields: newForm.fields,
        created_at: newForm.createdAt,
        updated_at: newForm.updatedAt,
      });
      if (error) throw new Error(error.message);
    }

    this.forms.push(newForm);
    this.saveToCache();
    return newForm;
  }

  async update(id: string, updates: Partial<Omit<Form, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Form | undefined> {
    const index = this.forms.findIndex(f => f.id === id);
    if (index === -1) return undefined;

    // Check for formId uniqueness if it's being updated
    if (updates.formId && this.forms.some(f => f.formId === updates.formId && f.id !== id)) {
      throw new Error('Form ID already exists');
    }

    const updatedForm = {
      ...this.forms[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const dbData: Record<string, any> = { updated_at: updatedForm.updatedAt };
      if (updates.formId !== undefined) dbData.form_id = updates.formId;
      if (updates.name !== undefined) dbData.name = updates.name;
      if (updates.description !== undefined) dbData.description = updates.description;
      if (updates.purpose !== undefined) dbData.purpose = updates.purpose;
      if (updates.fields !== undefined) dbData.fields = updates.fields;

      const { error } = await supabase.from('forms').update(dbData).eq('id', id);
      if (error) throw new Error(error.message);
    }

    this.forms[index] = updatedForm;
    this.saveToCache();
    return this.forms[index];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.forms.length;

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('forms').delete().eq('id', id);
      if (error) throw new Error(error.message);
    }

    this.forms = this.forms.filter(f => f.id !== id);
    if (this.forms.length !== initialLength) {
      this.saveToCache();
      return true;
    }
    return false;
  }
}

export const formService = new FormService();
