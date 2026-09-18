import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
export default function MemberCenterPage() {
  const { user, logout } = useAuth();
  return <section className="max-w-3xl mx-auto p-6 py-12"><h1 className="text-3xl mb-4">會員中心</h1><p>{user?.name}，您好</p><p className="text-stone-500 mb-6">{user?.email}</p><div className="grid sm:grid-cols-3 gap-4">{[['/profile/reservations','我的預約'],['/profile/orders','我的訂單'],['/profile/settings','個人資料與密碼']].map(([path, label]) => <Link key={path} to={path} className="border border-stone-200 rounded-xl p-6 bg-white hover:bg-stone-50">{label}</Link>)}</div>{user?.role === 'admin' && <Link to="/admin" className="block underline mt-6">進入管理後台</Link>}<button className="underline mt-6" onClick={() => void logout()}>登出</button></section>;
}
