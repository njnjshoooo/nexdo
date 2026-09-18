import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User } from '../types/auth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { adminAccess } from '../lib/authAccess';
import { validateNewPassword } from '../lib/passwordRecovery';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingProfile: boolean;
  authError: string;
  login: (email: string, password: string) => Promise<User>;
  register: (data: Omit<User, 'id' | 'role'> & { password: string }) => Promise<{ needsConfirmation: boolean }>;
  updateProfile: (data: Partial<User> & { password?: string }) => Promise<void>;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function loadProfile(id: string, email: string): Promise<User> {
  const [profile, admin] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).abortSignal(AbortSignal.timeout(15000)).maybeSingle(),
    supabase.from('admin_permission').select('role, permissions').eq('id', id).abortSignal(AbortSignal.timeout(15000)).maybeSingle(),
  ]);
  if (profile.error || admin.error) throw new Error('無法讀取帳號權限，請重新整理後再試；若持續發生請聯繫管理員。');
  const row = profile.data;
  return {
    id, email, name: row?.name || email.split('@')[0], ...adminAccess(admin.data),
    phone: row?.phone, address: row?.address, lineId: row?.line_id,
    title: row?.title, nickname: row?.nickname,
    emergencyContactName: row?.emergency_contact_name,
    emergencyContactPhone: row?.emergency_contact_phone,
    specialRequirements: row?.special_requirements,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // A browser cache is never evidence of a valid session or administrative access.
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [authError, setAuthError] = useState('');
  const generation = useRef(0);
  useEffect(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('users');
    if (!isSupabaseConfigured) { setIsLoadingProfile(false); return; }
    let cancelled = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    // Never await Supabase calls inside its auth callback (the auth lock is still held).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const request = ++generation.current;
      setAuthError('');
      setUser(null);
      if (!session?.user) { setIsLoadingProfile(false); return; }
      setIsLoadingProfile(true);
      const timer = setTimeout(async () => {
        timers.delete(timer);
        try {
          const profile = await loadProfile(session.user.id, session.user.email || '');
          if (!cancelled && request === generation.current) setUser(profile);
        } catch (error) {
          if (!cancelled && request === generation.current) setAuthError((error as Error).message);
        } finally {
          if (!cancelled && request === generation.current) setIsLoadingProfile(false);
        }
      }, 0);
      timers.add(timer);
    });
    return () => { cancelled = true; generation.current++; timers.forEach(clearTimeout); subscription.unsubscribe(); };
  }, []);

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured) throw new Error('登入服務尚未設定');
    setIsLoadingProfile(true); setAuthError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error || !data.user || !data.session) throw new Error('登入失敗，請確認帳號、密碼與信箱驗證狀態。');
      const request = ++generation.current;
      const profile = await loadProfile(data.user.id, data.user.email || email);
      if (request === generation.current) setUser(profile);
      return profile;
    } finally { setIsLoadingProfile(false); }
  };
  const register: AuthContextType['register'] = async data => {
    if (!isSupabaseConfigured) throw new Error('註冊服務尚未設定');
    const issue = validateNewPassword(data.password, data.password);
    if (issue) throw new Error(issue);
    const { data: result, error } = await supabase.auth.signUp({
      email: data.email.trim(), password: data.password,
      options: { data: { name: data.name, phone: data.phone } },
    });
    if (error) throw new Error(error.message);
    // A user object without a session is an unverified registration, not a login.
    return { needsConfirmation: !result.session };
  };
  const updateProfile: AuthContextType['updateProfile'] = async data => {
    if (!user || !isSupabaseConfigured) throw new Error('請先登入');
    const mapping = { name: 'name', phone: 'phone', address: 'address', lineId: 'line_id' } as const;
    const updates: Record<string, unknown> = {};
    for (const [key, column] of Object.entries(mapping)) {
      const value = data[key as keyof typeof mapping];
      if (value !== undefined) updates[column] = value;
    }
    if (data.password) {
      const issue = validateNewPassword(data.password, data.password);
      if (issue) throw new Error(issue);
    }
    if (Object.keys(updates).length) {
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) throw new Error('個人資料儲存失敗，請稍後重試');
    }
    if (data.password) {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw new Error('密碼更新失敗，請重新登入後再試');
    }
    setUser(await loadProfile(user.id, user.email));
  };
  const logout = async () => {
    ++generation.current; setUser(null); setAuthError('');
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) setAuthError('登出未完成，請重新整理後重試。');
    }
  };
  return <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoadingProfile, authError, login, register, updateProfile, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
