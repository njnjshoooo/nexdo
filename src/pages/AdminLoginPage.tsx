import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
export default function AdminLoginPage() {
  const { login, user, isLoadingProfile } = useAuth(); const navigate = useNavigate();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (busy) return; setBusy(true); setError('');
    try { await login(email.trim(), password); setPassword(''); navigate('/admin', { replace: true }); }
    catch (error) { setError((error as Error).message || '登入失敗，請確認帳號與密碼。'); }
    finally { setBusy(false); }
  }
  if (!isLoadingProfile && user) return <Navigate to="/admin" replace />;
  return <main className="public-site min-h-screen p-6 bg-[#FFF9EF]"><Helmet><title>管理員登入｜好齡居</title><meta name="robots" content="noindex,nofollow" /></Helmet><section className="mx-auto max-w-lg mt-8 p-6 md:p-10 bg-white rounded-2xl border border-stone-200 consultation-form"><a href="/">好齡居 NEXDO</a><h1 className="text-2xl my-6">管理員登入</h1><form onSubmit={submit}><label>帳號信箱<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label><label>密碼<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>{error && <p role="alert" className="request-error">{error}</p>}<button className="brand-button mt-4" disabled={busy}>{busy ? '登入中…' : '登入管理後台'}</button></form><a href="/reset-password" className="block mt-6 underline">忘記密碼／設定新密碼</a></section></main>;
}
