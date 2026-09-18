import React, { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { memberReturnPath } from '../lib/authAccess';
import LoginModal from '../components/LoginModal';
export default function MemberLoginPage() {
  const { login, user, isLoadingProfile } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [showRegister, setShowRegister] = useState(false);
  if (!isLoadingProfile && user) return <Navigate to={memberReturnPath(location.state?.from)} replace />;
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (busy) return; setBusy(true); setError('');
    try { await login(email, password); setPassword(''); }
    catch (error) { setError((error as Error).message); } finally { setBusy(false); }
  }
  return <main className="public-site min-h-screen bg-[#FFF9EF] p-6"><Helmet><title>會員登入｜好齡居</title><meta name="robots" content="noindex,nofollow" /></Helmet><section className="consultation-form mx-auto max-w-lg bg-white border border-stone-200 rounded-2xl p-8 mt-8"><Link to="/">好齡居 NEXDO</Link><h1 className="text-2xl my-6">會員登入</h1><p>查看預約、訂單與個人資料。</p><form onSubmit={submit}><label>帳號信箱<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label><label>密碼<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>{error && <p role="alert">{error}</p>}<button className="brand-button" disabled={busy}>{busy ? '登入中…' : '登入會員中心'}</button></form><div className="mt-6 flex flex-wrap gap-4"><Link className="underline" to="/reset-password">忘記密碼</Link><button className="underline" onClick={() => setShowRegister(true)}>註冊會員</button><Link className="underline" to="/admin/login">管理員登入</Link></div></section><LoginModal isOpen={showRegister} onClose={() => setShowRegister(false)} initialTab="register" /></main>;
}
