import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
export default function ProfileSettingsPage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '', lineId: user?.lineId || '' });
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  async function save(event: React.FormEvent) {
    event.preventDefault(); if (busy) return; setBusy(true); setMessage('');
    try { await updateProfile(form); setMessage('個人資料已儲存。'); }
    catch (error) { setMessage((error as Error).message); } finally { setBusy(false); }
  }
  return <section className="consultation-form max-w-2xl mx-auto p-6 pt-32 pb-12"><Link className="underline" to="/profile">返回會員中心</Link><h1 className="text-3xl my-6">個人資料</h1><p>帳號：{user?.email}</p><form onSubmit={save}>{([['name','姓名'],['phone','聯絡電話'],['address','聯絡地址'],['lineId','LINE ID']] as const).map(([key,label]) => <label key={key}>{label}<input type={key === 'phone' ? 'tel' : 'text'} required={key === 'name'} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>)}<button className="brand-button" disabled={busy}>{busy ? '儲存中…' : '儲存資料'}</button>{message && <p role="status" className="my-4">{message}</p>}</form><Link to="/reset-password" className="block underline mt-8">透過信箱重設密碼</Link></section>;
}
