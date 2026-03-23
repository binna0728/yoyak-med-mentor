import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/types/user';
import authApi from '@/api/auth';
import { isInTossApp } from '@/utils/toss';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInToss: boolean;
  loginWithToss: (tossToken: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const inToss = isInTossApp();

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      setUser(response.data);
    } catch {
      // Backend unavailable — keep current user (don't clear)
    }
  }, []);

  const loginWithToss = useCallback(async (tossToken: string) => {
    try {
      const response = await authApi.tossLogin(tossToken);
      localStorage.setItem('access_token', response.data.access_token);
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
      await refreshUser();
    } catch {
      // Demo mode fallback
      localStorage.setItem('access_token', 'demo_token');
      setUser({
        user_id: 'demo_0', email: 'toss@yoyak.kr', name: '토스 사용자', nickname: '사용자',
        gender: 'M', birthday: '1990-01-01', phone_number: '',
        is_active: true, is_admin: false, last_login: null,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      });
    }
  }, [refreshUser]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token && token !== 'demo_token') {
        try {
          await refreshUser();
        } catch {
          // ignore
        }
      } else if (token === 'demo_token') {
        setUser({
          user_id: 'demo_0', email: 'toss@yoyak.kr', name: '토스 사용자', nickname: '사용자',
          gender: 'M', birthday: '1990-01-01', phone_number: '',
          is_active: true, is_admin: false, last_login: null,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        });
      }
      setIsLoading(false);
    };

    initAuth();
  }, [refreshUser]);

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isInToss: inToss,
        loginWithToss,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
