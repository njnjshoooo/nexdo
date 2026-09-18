import React, { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Helmet } from 'react-helmet-async';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { validateNewPassword, recoveryTokens } from '../lib/passwordRecovery';

// Recovery credentials are kept only in memory, separate from the currently signed-in user.
function recoveryClient() {
  return createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'nexdo-password-recovery' },
  });
}
export default function PasswordRecoveryPage() {
  const [state, setState] = useState<'request' | 'verifying' | 'ready' | 'done'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const started = useRef(false);
  const client = useRef<ReturnType<typeof recoveryClient> | null>(null);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const fragment = window.location.hash;
    const tokens = recoveryTokens(fragment);
    // Remove credentials immediately; do not put them in localStorage, analytics, or error text.
    if (fragment) window.history.replaceState(null, '', '/reset-password');
    if (!isSupabaseConfigured) { setError('目前無法使用密碼重設，請聯繫網站管理員。'); return; }
    if (!tokens) {
      if (fragment) setError('重設連結無效或已過期，請重新申請。');
      return;
    }
    setState('verifying');
    client.current = recoveryClient();
    client.current.auth.setSession(tokens).then(({ data, error }) => {
      if (error || !data.user) { setError('重設連結無效或已過期，請重新申請。'); setState('request'); return; }
      setEmail(data.user.email || ''); setState('ready');
    }).catch(() => { setError('連結驗證失敗，請重新申請重設信。'); setState('request'); });
  }, []);
  async function request(event: React.FormEvent) {
    event.preventDefault(); if (busy || !isSupabaseConfigured) return;
    setBusy(true); setError(''); setSent(false);
    try {
      // The configured Site URL is also supported by the recovery callback in main.tsx.
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      setSent(true);
    } catch { setError('重設信暫時無法寄出，請稍後再試或聯繫管理員。'); }
    finally { setBusy(false); }
  }
  async function save(event: React.FormEvent) {
    event.preventDefault(); if (busy || state !== 'ready' || !client.current) return;
    const issue = validateNewPassword(password, confirm);
    if (issue) { setError(issue); return; }
    setBusy(true); setError('');
    try {
      const { error } = await client.current.auth.updateUser({ password });
      if (error) throw error;
      setPassword(''); setConfirm(''); setState('done');
      // End the isolated recovery session; the user signs in explicitly with the new password.
      await client.current.auth.signOut({ scope: 'local' });
      client.current = null;
    } catch { setError('未能更新密碼。請使用與舊密碼不同的強密碼；若連結已過期，請重新申請重設信。'); }
    finally { setBusy(false); }
  }
  return <main className="public-site min-h-screen p-6 bg-[#FFF9EF]"><Helmet><title>重設密碼｜好齡居</title><meta name="robots" content="noindex,nofollow" /><meta name="referrer" content="no-referrer" /></Helmet>
    <section className="mx-auto max-w-lg rounded-2xl border border-stone-200 bg-white p-6 md:p-10 mt-8 consultation-form">
      <a href="/">好齡居 NEXDO</a><h1 className="text-2xl mt-6 mb-4">{state === 'done' ? '密碼已更新' : '重設密碼'}</h1>
      {state === 'verifying' && <p role="status">正在驗證重設連結…</p>}
      {state === 'request' && <form onSubmit={request}><p>輸入帳號信箱，我們會寄送密碼重設連結。</p><label>帳號信箱<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label><button className="brand-button" disabled={busy || !isSupabaseConfigured}>{busy ? '寄送中…' : '寄送密碼重設信'}</button>{sent && <p role="status" className="mt-4">若此信箱已註冊，你將收到重設信。請檢查收件匣與垃圾郵件，並使用最新一封信中的連結。</p>}</form>}
      {state === 'ready' && <form onSubmit={save}><p>正在為 <strong>{email}</strong> 設定新密碼。</p><label>新密碼<input type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} /></label><p className="text-sm">至少 12 個字元，建議使用密碼管理器產生。</p><label>再次輸入新密碼<input type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={confirm} onChange={e => setConfirm(e.target.value)} /></label><button className="brand-button" disabled={busy}>{busy ? '更新中…' : '儲存新密碼'}</button></form>}
      {error && <p role="alert" className="request-error">{error}</p>}
      {state === 'done' && <><p>請使用新密碼登入好齡居。</p><a className="brand-button mt-6" href="/admin/login">前往管理員登入</a></>}
    </section>
  </main>;
}
