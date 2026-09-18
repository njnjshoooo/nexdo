import type { Request, Response } from 'express';
import { getSupabaseAdmin } from './_lib/supabase-admin.js';
import { sendFormSubmissionEmails } from './_lib/email.js';
import { ORGANIZING_FORM_ID, ORGANIZING_LABELS, validateOrganizing } from '../src/features/consultation/organizing.js';

export function createOrganizingHandler(deps = { getDb: getSupabaseAdmin, notify: sendFormSubmissionEmails }) {
return async function organizingRequest(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const body = req.body || {};
  if (body.website || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.requestId || '')) {
    return res.status(400).json({ error: '無法送出，請重新整理後再試' });
  }
  let data: Record<string, string>;
  try { data = validateOrganizing(body); }
  catch (error) { return res.status(400).json({ error: (error as Error).message }); }
  const id = body.requestId as string;
  const bookingId = `ORGA-${id.toUpperCase()}`;
  const createdAt = new Date().toISOString();
  try {
    const db = deps.getDb();
    const { error } = await db.from('submissions').insert({
      id, form_id: ORGANIZING_FORM_ID, booking_id: bookingId,
      page_slug: 'services/organizing', page_title: '老前整理線上諮詢',
      data, status: 'PENDING', created_at: createdAt,
    });
    // 同一次重試沿用 requestId，不建立重複名單或重複寄信。
    if (error?.code === '23505') return res.json({ ok: true, bookingId });
    if (error) throw error;
    // 等候寄信完成，避免 serverless 回應後提前停止執行。
    const notification = await deps.notify({
      bookingId, submissionId: id, formId: ORGANIZING_FORM_ID, formName: '老前整理線上諮詢',
      pageSlug: 'services/organizing', pageTitle: '老前整理線上諮詢', submittedAt: createdAt,
      customerName: data.name, customerPhone: data.phone, customerEmail: data.email,
      fields: Object.entries(data).map(([key, value]) => ({ label: ORGANIZING_LABELS[key] || key, value })),
    });
    if (!notification.internal) console.warn('[organizing-request] Saved; admin email unavailable:', id);
    return res.json({ ok: true, bookingId });
  } catch (error) {
    console.error('[organizing-request] Unable to save request');
    return res.status(503).json({ error: '目前無法確認送出結果，請稍後再試。重試不會重複建立需求，也可透過 LINE 聯繫我們。' });
  }
}

}
export default createOrganizingHandler();
