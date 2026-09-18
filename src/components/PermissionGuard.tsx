import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../lib/authAccess';
export default function PermissionGuard({ permission, children }: { permission: string; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!hasPermission(user, permission)) return <section className="p-6"><h1 className="text-xl">尚未開通此功能權限</h1><p className="my-4">請聯繫網站管理員調整帳號權限。</p><Link to="/admin" className="underline">返回後台首頁</Link></section>;
  return <>{children}</>;
}
