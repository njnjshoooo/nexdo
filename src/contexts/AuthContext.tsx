import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/auth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
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
      console.warn('[Auth] loadProfile failed', error);
    }
    return {
      id: authUserId,
      name: data?.name || fallbackEmail.split('@')[0] || 'User',
      email: data?.email || fallbackEmail,
      role: (data?.role as 'admin' | 'user') || 'user',
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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 先讀本地快取（即時可用）
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch {}
    }

    // 然後同步 Supabase auth state
    if (!isSupabaseConfigured) return;

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
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await loadProfile(session.user.id, session.user.email || '');
        if (profile) {
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('user');
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // 若 Supabase 沒有此用戶，也嘗試 fallback（讓開發環境較友善）
        console.warn('[Auth] supabase login failed:', error.message);
        // 拋出讓 UI 顯示
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
    if (email === 'admin@nexdo.com' && password === 'Admin123456') {
      const adminUser: User = { id: '1', name: 'Admin', email, role: 'admin' };
      setUser(adminUser);
      localStorage.setItem('user', JSON.stringify(adminUser));
      return;
    }
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
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, updateProfile, logout }}>
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
