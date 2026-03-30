import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Omit<User, 'id' | 'role'> & { password: string }) => Promise<void>;
  updateProfile: (data: Partial<User> & { password?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login logic
    if (email === 'admin@nexdo.com' && password === '888888') {
      const adminUser: User = {
        id: '1',
        name: 'Admin',
        email: 'admin@nexdo.com',
        role: 'admin',
      };
      setUser(adminUser);
      localStorage.setItem('user', JSON.stringify(adminUser));
      return;
    }
    
    // Check local storage users
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

    // Mock normal user login
    if (email === 'user@gmail.com' && password === '888888') {
      const normalUser: User = {
        id: '2',
        name: 'User',
        email: 'user@gmail.com',
        role: 'user',
      };
      setUser(normalUser);
      localStorage.setItem('user', JSON.stringify(normalUser));
      return;
    }

    throw new Error('Invalid credentials');
  };

  const register = async (data: Omit<User, 'id' | 'role'> & { password: string }) => {
    const storedUsersStr = localStorage.getItem('users');
    let users = [];
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
  };

  const updateProfile = async (data: Partial<User> & { password?: string }) => {
    if (!user) throw new Error('Not authenticated');

    const storedUsersStr = localStorage.getItem('users');
    let users = [];
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
      // Update existing user in users array
      const existingUser = users[userIndex];
      const { password, ...restData } = data;
      
      updatedUser = { ...existingUser, ...restData };
      if (password) {
        updatedUser.password = password;
      }
      
      users[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
    } else {
      // If user is not in users array (e.g. mock admin/user), just update current state
      const { password, ...restData } = data;
      updatedUser = { ...user, ...restData };
      // We don't save password for mock users
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
  };

  const logout = () => {
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
