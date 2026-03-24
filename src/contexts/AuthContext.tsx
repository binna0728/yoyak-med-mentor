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
  user_id: 'demo_0', email: 'demo@yoyak.kr', name: '깐부치킨', nickname: '깐부', gender: 'M',
  birthday: '1960-01-01', phone_number: '01012345678',
  is_active: true, is_admin: false, last_login: null,
  created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
};

/** 백엔드 /users/me 응답을 프론트엔드 User 타입으로 변환 */
const mapBackendUser = (raw: Record<string, unknown>): User => {
  const genderMap: Record<string, string> = { MALE: 'M', FEMALE: 'F', M: 'M', F: 'F' };
  return {
    user_id: String(raw.user_id ?? raw.id ?? ''),
    email: String(raw.email ?? ''),
    name: String(raw.name ?? ''),
    nickname: String(raw.nickname ?? raw.name ?? ''),
    gender: (genderMap[String(raw.gender ?? 'M')] ?? 'M') as 'M' | 'F',
    birthday: String(raw.birthday ?? ''),
    phone_number: String(raw.phone_number ?? ''),
    is_active: raw.is_active !== false,
    is_admin: raw.is_admin === true,
    last_login: raw.last_login ? String(raw.last_login) : null,
    created_at: String(raw.created_at ?? new Date().toISOString()),
    updated_at: String(raw.updated_at ?? new Date().toISOString()),
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      // 백엔드가 { data: User } 래핑 또는 직접 User 객체 반환 둘 다 처리
      const raw = response.data ?? response;
      setUser(mapBackendUser(raw as Record<string, unknown>));
    } catch {
      // Backend unavailable — keep current user (don't clear)
    }
  }, []);

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
        setUser(DEMO_USER);
      }
      // 토큰 없으면 비로그인 상태 유지 (온보딩 표시)
      setIsLoading(false);
    };

    initAuth();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      // 백엔드가 { data: { access_token } } 래핑 또는 { access_token } 직접 반환 둘 다 처리
      const tokenData = response.data ?? response;
      const td = tokenData as Record<string, string>;
      const token = td.access_token;
      if (!token) throw new Error('No access_token in response');
      localStorage.setItem('access_token', token);
      if (td.refresh_token) localStorage.setItem('refresh_token', td.refresh_token);
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
