import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoadingProfile } = useAuth();
  const location = useLocation();

  // 若尚未載入完成且 (沒有暫存登入者，或需要管理員權限但目前快取身分仍非管理員)
  if (isLoadingProfile && (!user || (requireAdmin && user.role !== 'admin'))) {
    return (
      <div className="flex bg-stone-50 items-center justify-center min-h-screen">
        <div className="text-stone-400">驗證身份中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to home or show a message, but since we have a modal, 
    // maybe just redirect to home and let them open the modal
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
