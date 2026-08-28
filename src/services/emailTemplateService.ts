import { supabase } from '../lib/supabase';
import { EmailTemplate } from '../types/emailTemplate';

export const emailTemplateService = {
  async getAll(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching email templates:', error);
      return [];
    }

    return data || [];
  },

  async getByKey(key: string): Promise<EmailTemplate | null> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('key', key)
      .single();

    if (error) {
      console.error('Error fetching email template by key:', error);
      return null;
    }

    return data;
  },

  async create(template: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    const { data, error } = await supabase
      .from('email_templates')
      .insert([{ ...template, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      console.error('Error creating email template:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: Partial<EmailTemplate>): Promise<boolean> {
    const { error } = await supabase
      .from('email_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating email template:', error);
      return false;
    }
    return true;
  },

  async updateStatus(id: string, status: 'active' | 'inactive'): Promise<boolean> {
    const { error } = await supabase
      .from('email_templates')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating email template status:', error);
      return false;
    }
    return true;
  }
};
