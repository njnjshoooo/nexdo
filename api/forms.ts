import { Request, Response } from 'express';
import { getSupabaseAdmin } from './_lib/supabase-admin.js';

export default async function formsHandler(req: Request, res: Response) {
  const adminClient = getSupabaseAdmin();

  try {
    if (req.method === 'GET') {
      const { data, error } = await adminClient
        .from('forms')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json({ success: true, data });
    }

    if (req.method === 'POST') {
      const { action, form, id, updates } = req.body;

      if (action === 'create') {
        const row = {
          id: form.id,
          form_id: form.formId || form.form_id,
          name: form.name,
          description: form.description || '',
          purpose: form.purpose || 'CONSULTATION',
          fields: Array.isArray(form.fields) ? form.fields : [],
          created_at: form.createdAt || form.created_at || new Date().toISOString(),
          updated_at: form.updatedAt || form.updated_at || new Date().toISOString(),
        };

        const { data, error } = await adminClient
          .from('forms')
          .insert(row)
          .select()
          .single();

        if (error) {
          return res.status(500).json({ error: error.message });
        }

        return res.json({ success: true, data });
      }

      if (action === 'update') {
        const targetId = id || updates?.id;
        if (!targetId) {
          return res.status(400).json({ error: 'Missing form id for update' });
        }

        const rowUpdates: any = {
          updated_at: updates.updatedAt || updates.updated_at || new Date().toISOString(),
        };
        if (updates.name !== undefined) rowUpdates.name = updates.name;
        if (updates.formId !== undefined) rowUpdates.form_id = updates.formId;
        if (updates.form_id !== undefined) rowUpdates.form_id = updates.form_id;
        if (updates.description !== undefined) rowUpdates.description = updates.description;
        if (updates.purpose !== undefined) rowUpdates.purpose = updates.purpose;
        if (updates.fields !== undefined) rowUpdates.fields = updates.fields;

        const { data, error } = await adminClient
          .from('forms')
          .update(rowUpdates)
          .eq('id', targetId)
          .select()
          .single();

        if (error) {
          return res.status(500).json({ error: error.message });
        }

        return res.json({ success: true, data });
      }

      if (action === 'delete') {
        const targetId = id;
        if (!targetId) {
          return res.status(400).json({ error: 'Missing form id for delete' });
        }

        const { error } = await adminClient
          .from('forms')
          .delete()
          .eq('id', targetId);

        if (error) {
          return res.status(500).json({ error: error.message });
        }

        return res.json({ success: true, message: 'Form deleted' });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
