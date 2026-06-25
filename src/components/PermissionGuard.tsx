import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
}

export default function PermissionGuard({ permission, children }: PermissionGuardProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  if (user.permissions === undefined) {
    return null;
  }

  const hasPermission = () => {
    // 1. 舊版測試超管放行
    if (user.id === '1') return true; 

    // 2. 🎯 最高權限安全網：只要擁有 'all'，不論任何頁面一律放行
    if (user.permissions!.includes('all')) return true;

    // 3. 🎯 檢查是否擁有當前頁面要求的特定權限（如 'product'、'member' 等）
    return user.permissions!.includes(permission);
  };

  if (!hasPermission()) {
    // 💡 這裡會被導回 /admin 首頁（通常是後台儀表板），而不是把人踢出後台
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}