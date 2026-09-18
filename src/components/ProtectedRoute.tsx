import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, isLoadingProfile, authError, logout } = useAuth();
  const location = useLocation();
  if (isLoadingProfile) return <main className="p-10" role="status">正在確認登入與權限…</main>;
  if (authError) return <main className="p-10"><h1>暫時無法確認帳號</h1><p role="alert">{authError}</p><button onClick={() => window.location.reload()}>重新載入</button></main>;
  if (!user) return <Navigate to={requireAdmin ? '/admin/login' : '/login'} state={{ from: location.pathname }} replace />;
  if (requireAdmin && user.role !== 'admin') return <main className="p-8 max-w-xl mx-auto space-y-5"><h1 className="text-2xl">帳號尚未開通管理員權限</h1><p>已登入：{user.email}</p><p>會員登入與管理員授權是分開的。請聯繫網站管理員開通權限；開通後重新整理即可。</p><button onClick={() => window.location.reload()} className="brand-button">重新確認權限</button><button onClick={() => void logout()} className="block underline">登出並切換帳號</button><Link className="block underline" to="/profile">前往會員中心</Link></main>;
  return <>{children}</>;
}
