import type { User } from '../types/auth';

export function adminAccess(row: { role?: string; permissions?: unknown } | null) {
  const admin = row?.role === 'admin';
  return {
    role: admin ? 'admin' as const : 'user' as const,
    permissions: admin && Array.isArray(row?.permissions)
      ? row.permissions.filter((value): value is string => typeof value === 'string') : [],
  };
}
export function hasPermission(user: User | null, permission: string) {
  return user?.role === 'admin' && !!(user.permissions?.includes('all') || user.permissions?.includes(permission));
}
export function memberReturnPath(value: unknown) {
  return typeof value === 'string' && /^\/profile(?:\/|$)/.test(value) && !value.includes('\\')
    ? value : '/profile';
}
