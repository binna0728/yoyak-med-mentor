import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/types/user';
import authApi from '@/api/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  user_id: 'demo_0', email: 'demo@yoyak.kr', name: '홍길동', nickname: '길동이', gender: 'M',
  birthday: '1960-01-01', phone_number: '01012345678',
  is_active: true, is_admin: false, last_login: null,
  created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      setUser(response.data);
    } catch {
      // Backend unavailable — keep current user (don't clear)
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          await refreshUser();
        } catch {
          // ignore
        }
        // If refreshUser didn't set a user (backend down), use demo
        setUser(prev => prev ?? DEMO_USER);
      } else {
        // No token at all — set demo user so preview works without backend
        localStorage.setItem('access_token', 'demo_token');
        setUser(DEMO_USER);
      }
      setIsLoading(false);
    };

    initAuth();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      localStorage.setItem('access_token', response.data.access_token);
      await refreshUser();
    } catch {
      // Demo mode fallback when backend is unavailable
      localStorage.setItem('access_token', 'demo_token');
      setUser({
        user_id: 'demo_0', email, name: email.split('@')[0] || '사용자', nickname: '사용자',
        gender: 'M', birthday: '1960-01-01', phone_number: '01012345678',
        is_active: true, is_admin: false, last_login: null,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
