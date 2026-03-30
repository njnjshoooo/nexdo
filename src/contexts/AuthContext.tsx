import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/auth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Omit<User, 'id' | 'role'> & { password: string }) => Promise<void>;
  updateProfile: (data: Partial<User> & { password?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured) {
      // ── Supabase 模式 ──
      // 初始化：取得當前 session
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setUser(profile);
        }
        setIsLoading(false);
      });

      // 監聽登入/登出狀態變化
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const profile = await fetchProfile(session.user.id);
            setUser(profile);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        }
      );

      return () => subscription.unsubscribe();
    } else {
      // ── localStorage fallback 模式 ──
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse stored user', e);
        }
      }
      setIsLoading(false);
    }
  }, []);

  /** 從 profiles 表讀取使用者完整資料 */
  async function fetchProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Failed to fetch profile', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name || '',
      title: data.title,
      nickname: data.nickname,
      email: data.email || '',
      phone: data.phone,
      address: data.address,
      lineId: data.line_id,
      emergencyContactName: data.emergency_contact_name,
      emergencyContactPhone: data.emergency_contact_phone,
      specialRequirements: data.special_requirements,
      role: data.role || 'user',
      permissions: data.permissions || [],
      createdAt: data.created_at,
    };
  }

  const login = async (email: string, password: string) => {
    if (isSupabaseConfigured) {
      // ── Supabase Auth ──
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      // onAuthStateChange 會自動更新 user
    } else {
      // ── localStorage fallback ──
      if (email === 'admin@nexdo.com' && password === '888888') {
        const adminUser: User = { id: '1', name: 'Admin', email: 'admin@nexdo.com', role: 'admin' };
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
        } catch (e) {
          console.error('Failed to parse stored users', e);
        }
      }

      if (email === 'user@gmail.com' && password === '888888') {
        const normalUser: User = { id: '2', name: 'User', email: 'user@gmail.com', role: 'user' };
        setUser(normalUser);
        localStorage.setItem('user', JSON.stringify(normalUser));
        return;
      }

      throw new Error('Invalid credentials');
    }
  };

  const register = async (data: Omit<User, 'id' | 'role'> & { password: string }) => {
    if (isSupabaseConfigured) {
      // ── Supabase Auth ──
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: 'user',
          },
        },
      });
      if (error) throw new Error(error.message);
      // Trigger 會自動建立 profile
      // onAuthStateChange 會自動更新 user
    } else {
      // ── localStorage fallback ──
      const storedUsersStr = localStorage.getItem('users');
      let users: any[] = [];
      if (storedUsersStr) {
        try {
          users = JSON.parse(storedUsersStr);
        } catch (e) {
          console.error('Failed to parse stored users', e);
        }
      }

      if (users.some((u: any) => u.email === data.email)) {
        throw new Error('Email already exists');
      }

      const newUser = {
        ...data,
        id: Date.now().toString(),
        role: 'user' as const,
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    }
  };

  const updateProfile = async (data: Partial<User> & { password?: string }) => {
    if (!user) throw new Error('Not authenticated');

    if (isSupabaseConfigured) {
      // ── Supabase ──
      // 更新 profiles 表
      const profileUpdate: Record<string, any> = {};
      if (data.name !== undefined) profileUpdate.name = data.name;
      if (data.title !== undefined) profileUpdate.title = data.title;
      if (data.nickname !== undefined) profileUpdate.nickname = data.nickname;
      if (data.phone !== undefined) profileUpdate.phone = data.phone;
      if (data.address !== undefined) profileUpdate.address = data.address;
      if (data.lineId !== undefined) profileUpdate.line_id = data.lineId;
      if (data.emergencyContactName !== undefined) profileUpdate.emergency_contact_name = data.emergencyContactName;
      if (data.emergencyContactPhone !== undefined) profileUpdate.emergency_contact_phone = data.emergencyContactPhone;
      if (data.specialRequirements !== undefined) profileUpdate.special_requirements = data.specialRequirements;

      if (Object.keys(profileUpdate).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', user.id);
        if (error) throw new Error(error.message);
      }

      // 更新密碼（透過 Supabase Auth）
      if (data.password) {
        const { error } = await supabase.auth.updateUser({ password: data.password });
        if (error) throw new Error(error.message);
      }

      // 重新讀取 profile
      const updatedProfile = await fetchProfile(user.id);
      if (updatedProfile) setUser(updatedProfile);
    } else {
      // ── localStorage fallback ──
      const storedUsersStr = localStorage.getItem('users');
      let users: any[] = [];
      if (storedUsersStr) {
        try {
          users = JSON.parse(storedUsersStr);
        } catch (e) {
          console.error('Failed to parse stored users', e);
        }
      }

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
    }
  };

  const logout = () => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut();
      // onAuthStateChange 會自動設定 user = null
    } else {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, updateProfile, logout }}>
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
