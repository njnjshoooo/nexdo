import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types/auth';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
}

export default function PermissionGuard({ permission, children }: PermissionGuardProps) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const currentUser = storedUsers.find((u: User) => u.id === user.id) || user;
      setPermissions(currentUser.permissions || []);
    }
    setLoading(false);
  }, [user]);

  if (loading) return null;

  const hasPermission = () => {
    if (!user) return false;
    if (user.id === '1') return true; // Super admin
    if (permissions.includes('all')) return true;
    return permissions.includes(permission);
  };

  if (!hasPermission()) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
