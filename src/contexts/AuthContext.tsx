import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/auth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingProfile: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Omit<User, 'id' | 'role'> & { password: string }) => Promise<void>;
  updateProfile: (data: Partial<User> & { password?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** 將 Supabase auth.user + profiles row 合成前端 User 型別 */
async function loadProfile(authUserId: string, fallbackEmail: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUserId)
      .maybeSingle();

    if (error) {
      console.warn('[Auth] loadProfile failed (profiles)', error);
    }

    // Check if user is an admin
    let role = (data?.role as 'admin' | 'user') || 'user';
    let permissions: string[] = [];

    const { data: adminData, error: adminError } = await supabase
      .from('admin_permission')
      .select('role, permissions')
      .eq('id', authUserId)
      .maybeSingle();

    if (!adminError && adminData) {
      role = 'admin'; // Always grant admin access if present in admin_permission
      if (adminData.permissions) {
        permissions = adminData.permissions;
      }
      // 呼叫 API 升級 profile role，用 serverless 繞過 RLS
      if (data && data.role !== 'admin') {
        supabase.auth.getSession().then(({ data: sessData }) => {
          if (sessData.session?.access_token) {
            fetch('/api/auth/sync-admin', {
              headers: {
                'Authorization': `Bearer ${sessData.session.access_token}`
              }
            }).catch(e => console.error('[Auth] Failed to sync admin role', e));
          }
        });
      }
    } else if (role === 'admin' || fallbackEmail === 'admin@nexdo.com') {
      // Legacy super-admin (does not exist in admin_permission table yet)
      role = 'admin';
      permissions = ['all'];
    }

    return {
      id: authUserId,
      name: data?.name || fallbackEmail.split('@')[0] || 'User',
      email: data?.email || fallbackEmail,
      role: role,
      permissions: permissions,
      phone: data?.phone || undefined,
      address: data?.address || undefined,
      lineId: data?.line_id || undefined,
    } as User;
  } catch (e) {
    console.warn('[Auth] loadProfile error', e);
    return {
      id: authUserId,
      name: fallbackEmail.split('@')[0] || 'User',
      email: fallbackEmail,
      role: 'user',
    } as User;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // 初始值同步從 localStorage 讀取，避免 ProtectedRoute 在第一次 render 因為 user=null 而誤判未登入
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoadingProfile(false);
      return;
    }

    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session?.user) {
        const profile = await loadProfile(session.user.id, session.user.email || '');
        if (!cancelled && profile) {
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        }
      } else {
        // No session found but we are done checking
        if (!cancelled) {
          setUser(null);
          localStorage.removeItem('user');
        }
      }
      if (!cancelled) setIsLoadingProfile(false);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoadingProfile(true);
        const profile = await loadProfile(session.user.id, session.user.email || '');
        if (profile) {
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        }
        setIsLoadingProfile(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('user');
        setIsLoadingProfile(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    // 🎯 拿掉原本寫死 id: '1' 的 if 測試後門，讓所有人一律走 Supabase 驗證
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw new Error(error.message || '帳號或密碼錯誤');
      }
      if (data.user) {
        const profile = await loadProfile(data.user.id, data.user.email || email);
        if (profile) {
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        }
      }
      return;
    }

    // === 以下為無 Supabase 時的 fallback (本地測試用) ===
    const storedUsersStr = localStorage.getItem('users');
    if (storedUsersStr) {
      try {
        const users = JSON.parse(storedUsersStr);
        const foundUser = users.find((u: any) => u.email === email && u.password === password);
        if (foundUser) {
          const { password: _, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          return;
        }
      } catch {}
    }
    throw new Error('帳號或密碼錯誤');
  };

  const register = async (data: Omit<User, 'id' | 'role'> & { password: string }) => {
    if (isSupabaseConfigured) {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { name: data.name } },
      });
      if (error) throw new Error(error.message);
      if (signUpData.user) {
        const profile = await loadProfile(signUpData.user.id, signUpData.user.email || data.email);
        if (profile) {
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        }
      }
      // 觸發品牌歡迎信（失敗不擋註冊流程）
      fetch('/api/auth/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, name: data.name }),
      }).catch(err => console.error('Failed to send welcome email:', err));
      return;
    }

    // Fallback
    const storedUsersStr = localStorage.getItem('users');
    let users = [];
    if (storedUsersStr) { try { users = JSON.parse(storedUsersStr); } catch {} }
    if (users.some((u: any) => u.email === data.email)) {
      throw new Error('Email already exists');
    }
    const newUser = { ...data, id: Date.now().toString(), role: 'user' as const };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
  };

  const updateProfile = async (data: Partial<User> & { password?: string }) => {
    if (!user) throw new Error('Not authenticated');

    if (isSupabaseConfigured) {
      const updates: any = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.phone !== undefined) updates.phone = data.phone;
      if (data.address !== undefined) updates.address = data.address;
      if ((data as any).lineId !== undefined) updates.line_id = (data as any).lineId;

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
        if (error) throw new Error(error.message);
      }
      if (data.password) {
        const { error } = await supabase.auth.updateUser({ password: data.password });
        if (error) throw new Error(error.message);
      }
      const updatedUser = { ...user, ...data };
      delete (updatedUser as any).password;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return;
    }

    // Fallback (local)
    const storedUsersStr = localStorage.getItem('users');
    let users = [];
    if (storedUsersStr) { try { users = JSON.parse(storedUsersStr); } catch {} }
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    let updatedUser;
    if (userIndex !== -1) {
      const existingUser = users[userIndex];
      const { password, ...restData } = data;
      updatedUser = { ...existingUser, ...restData };
      if (password) updatedUser.password = password;
      users[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
    } else {
      const { password, ...restData } = data;
      updatedUser = { ...user, ...restData };
    }
    const { password: _, ...userWithoutPassword } = updatedUser;
    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
  };

  const logout = () => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut().catch(err => console.warn('[Auth] signOut failed', err));
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoadingProfile, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
