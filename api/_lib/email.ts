// Resend 通知信 helper
// 真正的模板與發送邏輯：在這裡集中管理
import { Resend } from 'resend';
import { getSupabaseAdmin } from './supabase-admin.js';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM = process.env.RESEND_FROM_EMAIL || 'noreply@nexdo.tw';
const INTERNAL = (process.env.INTERNAL_NOTIFICATION_EMAIL || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const SITE_URL = (process.env.PUBLIC_SITE_URL || '').replace(/\/$/, '');
// 客服聯絡頁；不設就用站點首頁（目前沒有獨立 /contact 頁面）
const CONTACT_URL =
  process.env.PUBLIC_CONTACT_URL || SITE_URL || 'https://www.nexdo.tw';

let cached: Resend | null = null;
function getClient(): Resend | null {
  if (!RESEND_API_KEY) return null;
  if (cached) return cached;
  cached = new Resend(RESEND_API_KEY);
  return cached;
}

export interface OrderEmailContext {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  amount: number;
  paymentType?: string;
  paymentDate?: string;
  items: Array<{ name: string; quantity: number; price: number; selectedVariant?: { name?: string } }>;
}

const tw = (n: number) => `NT$ ${n.toLocaleString('zh-TW')}`;

function itemsHtml(items: OrderEmailContext['items']): string {
  return items
    .map(i => {
      const variant = i.selectedVariant?.name ? `<div style="color:#888;font-size:12px">規格：${i.selectedVariant.name}</div>` : '';
      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee">
          <div style="font-weight:600">${escapeHtml(i.name)}</div>
          ${variant}
        </td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">x ${i.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${tw(i.price * i.quantity)}</td>
      </tr>`;
    })
    .join('');
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function customerHtml(ctx: OrderEmailContext): string {
  const orderUrl = SITE_URL ? `${SITE_URL}/profile/orders` : '';
  return `<!doctype html><html><body style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222">
  <h2 style="color:#0a7a5a;margin-bottom:8px">您的訂單已收到付款</h2>
  <p style="color:#555">親愛的 ${escapeHtml(ctx.customerName)}，感謝您的訂購！我們已成功收到您的款項。</p>
  <div style="background:#f7f4ee;border-radius:12px;padding:16px;margin:16px 0">
    <div><strong>訂單編號：</strong>${escapeHtml(ctx.orderId)}</div>
    <div><strong>付款方式：</strong>${escapeHtml(ctx.paymentType || '-')}</div>
    ${ctx.paymentDate ? `<div><strong>付款時間：</strong>${escapeHtml(ctx.paymentDate)}</div>` : ''}
  </div>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <thead><tr style="background:#fafafa">
      <th style="padding:8px;text-align:left">商品</th>
      <th style="padding:8px;text-align:center">數量</th>
      <th style="padding:8px;text-align:right">金額</th>
    </tr></thead>
    <tbody>${itemsHtml(ctx.items)}</tbody>
  </table>
  <div style="text-align:right;font-size:18px;margin:8px 0"><strong>已付金額：${tw(ctx.amount)}</strong></div>
  <p style="color:#555;margin-top:24px">我們將在 24 小時內與您聯繫，確認後續服務細節。</p>
  ${orderUrl ? `<p style="margin-top:24px"><a href="${orderUrl}" style="background:#0a7a5a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">查看訂單</a></p>` : ''}
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#888;font-size:12px;line-height:1.6">
    本信由系統自動寄發，<strong>請勿直接回覆</strong>。<br>
    如需協助，請前往 <a href="${CONTACT_URL}" style="color:#0a7a5a">好齡居官網</a> 與我們聯繫。
  </p>
  <p style="color:#888;font-size:12px;margin-top:12px">好齡居 NEXDO ｜ <a href="${SITE_URL || 'https://www.nexdo.tw'}" style="color:#0a7a5a">www.nexdo.tw</a></p>
  </body></html>`;
}

function internalHtml(ctx: OrderEmailContext): string {
  const orderUrl = SITE_URL ? `${SITE_URL}/admin/orders/${encodeURIComponent(ctx.orderId)}` : '';
  return `<!doctype html><html><body style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222">
  <h2>🎉 新訂單入帳</h2>
  <div style="background:#fafafa;border-radius:8px;padding:16px;margin:16px 0">
    <div><strong>訂單編號：</strong>${escapeHtml(ctx.orderId)}</div>
    <div><strong>客戶姓名：</strong>${escapeHtml(ctx.customerName)}</div>
    <div><strong>客戶電話：</strong>${escapeHtml(ctx.customerPhone || '-')}</div>
    <div><strong>客戶 Email：</strong>${escapeHtml(ctx.customerEmail)}</div>
    <div><strong>付款方式：</strong>${escapeHtml(ctx.paymentType || '-')}</div>
    ${ctx.paymentDate ? `<div><strong>付款時間：</strong>${escapeHtml(ctx.paymentDate)}</div>` : ''}
    <div style="margin-top:8px;font-size:18px"><strong>金額：${tw(ctx.amount)}</strong></div>
  </div>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <thead><tr style="background:#fafafa">
      <th style="padding:8px;text-align:left">商品</th>
      <th style="padding:8px;text-align:center">數量</th>
      <th style="padding:8px;text-align:right">金額</th>
    </tr></thead>
    <tbody>${itemsHtml(ctx.items)}</tbody>
  </table>
  ${orderUrl ? `<p style="margin-top:16px"><a href="${orderUrl}">前往後台訂單</a></p>` : ''}
  </body></html>`;
}

// ==========================================================================
// 失敗信模板
// ==========================================================================

export interface OrderFailedEmailContext extends OrderEmailContext {
  failureReason?: string;   // 綠界 RtnMsg
  failureCode?: string;     // 綠界 RtnCode
}

function customerFailedHtml(ctx: OrderFailedEmailContext): string {
  const retryUrl = SITE_URL ? `${SITE_URL}/cart` : '';
  const reason = ctx.failureReason
    ? `<div><strong>失敗原因：</strong>${escapeHtml(ctx.failureReason)}</div>`
    : '';
  return `<!doctype html><html><body style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222">
  <h2 style="color:#b91c1c;margin-bottom:8px">您的訂單付款未成功</h2>
  <p style="color:#555">親愛的 ${escapeHtml(ctx.customerName)}，您剛剛的付款未能完成，您的訂單尚未生效。請查看下方原因並重新嘗試。</p>
  <div style="background:#fef2f2;border-left:4px solid #b91c1c;border-radius:8px;padding:16px;margin:16px 0">
    <div><strong>訂單編號：</strong>${escapeHtml(ctx.orderId)}</div>
    <div><strong>付款方式：</strong>${escapeHtml(ctx.paymentType || '-')}</div>
    ${reason}
  </div>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <thead><tr style="background:#fafafa">
      <th style="padding:8px;text-align:left">商品</th>
      <th style="padding:8px;text-align:center">數量</th>
      <th style="padding:8px;text-align:right">金額</th>
    </tr></thead>
    <tbody>${itemsHtml(ctx.items)}</tbody>
  </table>
  <div style="text-align:right;font-size:16px;margin:8px 0;color:#555">訂單總額：${tw(ctx.amount)}</div>
  <p style="color:#555;margin-top:24px">
    您可以重新加入購物車後再付款一次，或前往官網與我們聯繫取得協助。
  </p>
  ${retryUrl ? `<p style="margin-top:24px"><a href="${retryUrl}" style="background:#0a7a5a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">重新下單</a></p>` : ''}
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#888;font-size:12px;line-height:1.6">
    本信由系統自動寄發，<strong>請勿直接回覆</strong>。<br>
    如需協助，請前往 <a href="${CONTACT_URL}" style="color:#0a7a5a">好齡居官網</a> 與我們聯繫。
  </p>
  <p style="color:#888;font-size:12px;margin-top:12px">好齡居 NEXDO ｜ <a href="${SITE_URL || 'https://www.nexdo.tw'}" style="color:#0a7a5a">www.nexdo.tw</a></p>
  </body></html>`;
}

function internalFailedHtml(ctx: OrderFailedEmailContext): string {
  const orderUrl = SITE_URL ? `${SITE_URL}/admin/orders/${encodeURIComponent(ctx.orderId)}` : '';
  return `<!doctype html><html><body style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222">
  <h2 style="color:#b91c1c">⚠️ 訂單付款失敗</h2>
  <div style="background:#fafafa;border-radius:8px;padding:16px;margin:16px 0">
    <div><strong>訂單編號：</strong>${escapeHtml(ctx.orderId)}</div>
    <div><strong>客戶姓名：</strong>${escapeHtml(ctx.customerName)}</div>
    <div><strong>客戶電話：</strong>${escapeHtml(ctx.customerPhone || '-')}</div>
    <div><strong>客戶 Email：</strong>${escapeHtml(ctx.customerEmail)}</div>
    <div><strong>付款方式：</strong>${escapeHtml(ctx.paymentType || '-')}</div>
    ${ctx.failureCode ? `<div><strong>綠界回傳代碼：</strong>${escapeHtml(ctx.failureCode)}</div>` : ''}
    ${ctx.failureReason ? `<div><strong>失敗原因：</strong>${escapeHtml(ctx.failureReason)}</div>` : ''}
    <div style="margin-top:8px;font-size:18px;color:#555"><strong>訂單總額：${tw(ctx.amount)}</strong></div>
  </div>
  <p style="color:#555">建議與客戶聯繫確認是否有意願重新付款。</p>
  ${orderUrl ? `<p style="margin-top:16px"><a href="${orderUrl}">前往後台訂單</a></p>` : ''}
  </body></html>`;
}

// ==========================================================================
// 寄送函式
// ==========================================================================

export async function sendOrderPaidEmails(ctx: OrderEmailContext): Promise<void> {
  const client = getClient();
  if (!client) {
    console.warn('[email] RESEND_API_KEY not set, skipping paid email. Order:', ctx.orderId);
    return;
  }

  // 客戶確認信
  try {
    await client.emails.send({
      from: FROM,
      to: ctx.customerEmail,
      subject: `好齡居 — 訂單 ${ctx.orderId} 已完成付款`,
      html: customerHtml(ctx),
    });
  } catch (e) {
    console.error('[email] customer paid email failed', e);
  }

  // 商家內部通知
  if (INTERNAL.length > 0) {
    try {
      await client.emails.send({
        from: FROM,
        to: INTERNAL,
        subject: `[新訂單] ${ctx.orderId} — ${ctx.customerName} ${tw(ctx.amount)}`,
        html: internalHtml(ctx),
      });
    } catch (e) {
      console.error('[email] internal paid email failed', e);
    }
  }
}

// ==========================================================================
// 會員註冊歡迎信
// ==========================================================================

export interface WelcomeEmailContext {
  name: string;
  email: string;
}

function customerWelcomeHtml(ctx: WelcomeEmailContext, dynamicHtml?: string): string {
  if (dynamicHtml) {
    return `<!doctype html><html><body style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222">
    ${dynamicHtml}
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
    <p style="color:#888;font-size:12px;line-height:1.6">
      本信由系統自動寄發，<strong>請勿直接回覆</strong>。<br>
      如需協助，請前往 <a href="${CONTACT_URL}" style="color:#0a7a5a">好齡居官網</a> 與我們聯繫。
    </p>
    <p style="color:#888;font-size:12px;margin-top:12px">好齡居 NEXDO ｜ <a href="${SITE_URL || 'https://www.nexdo.tw'}" style="color:#0a7a5a">www.nexdo.tw</a></p>
    </body></html>`;
  }

  const loginUrl = SITE_URL ? `${SITE_URL}/profile/orders` : '';
  return `<!doctype html><html><body style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222">
  <h2 style="color:#0a7a5a;margin-bottom:8px">歡迎加入好齡居 NEXDO</h2>
  <p style="color:#555">親愛的 ${escapeHtml(ctx.name || '會員')}，感謝您註冊好齡居會員！</p>
  <div style="background:#f7f4ee;border-radius:12px;padding:16px;margin:16px 0">
    <div><strong>您的登入 Email：</strong>${escapeHtml(ctx.email)}</div>
  </div>
  <p style="color:#555;line-height:1.7">
    好齡居是專注於樂齡居住安全的服務平台，提供居家整理、安全評估、無障礙改造、到府醫療等多元服務。<br>
    您現在可以登入會員中心查看訂單、預約服務，或瀏覽我們的服務項目。
  </p>
  ${loginUrl ? `<p style="margin-top:24px"><a href="${loginUrl}" style="background:#0a7a5a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">查看我的訂單</a></p>` : ''}
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#888;font-size:12px;line-height:1.6">
    本信由系統自動寄發，<strong>請勿直接回覆</strong>。<br>
    如需協助，請前往 <a href="${CONTACT_URL}" style="color:#0a7a5a">好齡居官網</a> 與我們聯繫。
  </p>
  <p style="color:#888;font-size:12px;margin-top:12px">好齡居 NEXDO ｜ <a href="${SITE_URL || 'https://www.nexdo.tw'}" style="color:#0a7a5a">www.nexdo.tw</a></p>
  </body></html>`;
}

export async function sendWelcomeEmail(ctx: WelcomeEmailContext): Promise<void> {
  const client = getClient();
  if (!client) {
    console.warn('[email] RESEND_API_KEY not set, skipping welcome email. Email:', ctx.email);
    return;
  }
  if (!ctx.email) {
    console.warn('[email] welcome email skipped — no email address');
    return;
  }

  let finalSubject = `歡迎加入好齡居 NEXDO`;
  let dynamicHtml = '';

  try {
    const supabase = getSupabaseAdmin();
    const { data: tpl } = await supabase.from('email_templates').select('*').eq('key', 'WELCOME_MEMBER').single();
    if (tpl && tpl.status !== 'inactive') {
      finalSubject = tpl.subject || finalSubject;
      let cnt = tpl.content || '';
      
      // 支援連續 {} 替換，或具名替換
      cnt = cnt.replace(/{{buyer_name}}|{buyer_name}|{{name}}|{name}/g, ctx.name || '會員');
      cnt = cnt.replace(/{{buyer_email}}|{buyer_email}|{{email}}|{email}/g, ctx.email);

      // 若有其餘 {} 一律依序替換為 name, email
      if (cnt.includes('{}')) {
        cnt = cnt.replace('{}', ctx.name || '會員');
      }
      if (cnt.includes('{}')) {
        cnt = cnt.replace('{}', ctx.email);
      }

      dynamicHtml = `<div style="line-height:1.7;color:#555;">${cnt.replace(/\\n/g, '<br/>')}</div>`;
    }
  } catch (err) {
    console.warn('[email] failed to fetch template from supabase, fallback to default', err);
  }

  try {
    await client.emails.send({
      from: FROM,
      to: ctx.email,
      subject: finalSubject,
      html: customerWelcomeHtml(ctx, dynamicHtml),
    });
  } catch (e) {
    console.error('[email] welcome email failed', e);
  }
}

export async function sendOrderFailedEmails(ctx: OrderFailedEmailContext): Promise<void> {
  const client = getClient();
  if (!client) {
    console.warn('[email] RESEND_API_KEY not set, skipping failed email. Order:', ctx.orderId);
    return;
  }

  // 客戶失敗通知
  try {
    await client.emails.send({
      from: FROM,
      to: ctx.customerEmail,
      subject: `好齡居 — 訂單 ${ctx.orderId} 付款未成功`,
      html: customerFailedHtml(ctx),
    });
  } catch (e) {
    console.error('[email] customer failed email failed', e);
  }

  // 商家內部通知
  if (INTERNAL.length > 0) {
    try {
      await client.emails.send({
        from: FROM,
        to: INTERNAL,
        subject: `[付款失敗] ${ctx.orderId} — ${ctx.customerName}`,
        html: internalFailedHtml(ctx),
      });
    } catch (e) {
      console.error('[email] internal failed email failed', e);
    }
  }
}
