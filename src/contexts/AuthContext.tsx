import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'patient' | 'caregiver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('yoyak_user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('yoyak_user', JSON.stringify(user));
    else localStorage.removeItem('yoyak_user');
  }, [user]);

  const login = async (email: string, _password: string) => {
    // Demo: accept any credentials
    const stored = localStorage.getItem('yoyak_users');
    const users: User[] = stored ? JSON.parse(stored) : [];
    const found = users.find(u => u.email === email);
    if (found) { setUser(found); return; }
    // Default demo user
    setUser({ id: 'demo-1', name: '홍길동', email, role: 'patient' });
  };

  const signup = async (name: string, email: string, _password: string, role: UserRole) => {
    const newUser: User = { id: `user-${Date.now()}`, name, email, role };
    const stored = localStorage.getItem('yoyak_users');
    const users: User[] = stored ? JSON.parse(stored) : [];
    users.push(newUser);
    localStorage.setItem('yoyak_users', JSON.stringify(users));
    setUser(newUser);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
