import { sendWelcomeEmail } from '../_lib/email.js';

interface WelcomeBody {
  email: string;
  name?: string;
}

function isEmail(s: unknown): s is string {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

// Vercel Node 函式（legacy req/res 風格）
// 註：目前不做 server-side 帳號驗證，理論上任何人 POST 都會寄出歡迎信。
// 風險低（Resend 月額度有上限），日後可改用 Supabase Auth Hook 或 HMAC token 加強。
export default async function handler(req: any, res: any): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const body = (req.body || {}) as Partial<WelcomeBody>;
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (!isEmail(email)) {
    res.status(400).json({ error: 'Invalid email' });
    return;
  }

  console.log('[auth/welcome] dispatching welcome email', { email });
  try {
    await sendWelcomeEmail({ name: name || '', email });
    console.log('[auth/welcome] welcome email sent', { email });
  } catch (e: any) {
    console.error('[auth/welcome] sendWelcomeEmail threw', e?.message);
  }

  res.status(200).json({ ok: true });
}
