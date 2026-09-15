import { Request, Response } from 'express';
import { sendFormSubmissionEmails, FormSubmissionEmailContext } from './_lib/email.js';

/**
 * 表單提交後的通知 endpoint
 *
 * 由前端 submissionService.create() 在成功寫入 Supabase 之後呼叫。
 * 這裡負責發兩封 email：
 *   1. 內部通知 → INTERNAL_NOTIFICATION_EMAIL（安心顧問信箱）
 *   2. 客戶確認 → 若表單裡有填 email 就寄
 *
 * 失敗不影響前端 submission 成立，僅在 log 留下錯誤。
 */

interface RequestBody {
  bookingId: string;
  submissionId: string;
  formName: string;
  formId: string;
  pageSlug?: string;
  pageTitle?: string;
  submittedAt?: string;
  data: Record<string, unknown>;   // 表單原始欄位 → 值
  fieldLabels?: Record<string, string>; // 欄位 id → 顯示名稱
}

// 從 form data 猜出姓名／email／電話（找常見欄位名稱關鍵字）
function pickCommon(data: Record<string, unknown>): {
  name?: string; email?: string; phone?: string;
} {
  const out: { name?: string; email?: string; phone?: string } = {};
  for (const [key, val] of Object.entries(data)) {
    if (val == null || val === '') continue;
    const strVal = typeof val === 'string' ? val : String(val);
    const k = key.toLowerCase();
    if (!out.name && (k === 'name' || k.includes('姓名') || k.includes('稱呼'))) out.name = strVal;
    if (!out.email && (k === 'email' || k.includes('信箱') || k.includes('mail'))) out.email = strVal;
    if (!out.phone && (k === 'phone' || k === 'tel' || k.includes('電話') || k.includes('手機'))) out.phone = strVal;
  }
  return out;
}

function formatValue(val: unknown): string {
  if (val == null) return '';
  if (Array.isArray(val)) return val.filter(v => v != null && v !== '').join('、');
  if (typeof val === 'object') {
    try { return JSON.stringify(val); } catch { return String(val); }
  }
  return String(val);
}

export default async function notifySubmissionHandler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const body = (req.body || {}) as Partial<RequestBody>;
  if (!body.bookingId || !body.formName || !body.data || typeof body.data !== 'object') {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const fieldLabels = body.fieldLabels || {};
  const fields: FormSubmissionEmailContext['fields'] = Object.entries(body.data)
    .map(([key, value]) => ({
      label: fieldLabels[key] || key,
      value: formatValue(value),
    }))
    .filter(f => f.value !== '');

  const { name, email, phone } = pickCommon(body.data);

  const ctx: FormSubmissionEmailContext = {
    bookingId: body.bookingId,
    submissionId: body.submissionId || '',
    formName: body.formName,
    formId: body.formId || '',
    pageSlug: body.pageSlug,
    pageTitle: body.pageTitle,
    submittedAt: body.submittedAt || new Date().toLocaleString('zh-TW', { hour12: false, timeZone: 'Asia/Taipei' }),
    fields,
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
  };

  // fire-and-forget：不阻擋回應，前端只要知道通知已排隊
  sendFormSubmissionEmails(ctx).catch(err => {
    console.error('[notify-submission] sendFormSubmissionEmails 失敗', err);
  });

  res.status(200).json({ ok: true, dispatched: { internal: true, customer: !!email } });
}
