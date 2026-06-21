import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStoredUser, setStoredUser, removeStoredUser, removeToken, setToken } from '../lib/auth';

interface User {
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser());

  const login = (token: string, u: User) => {
    setToken(token);
    setStoredUser(u);
    setUser(u);
  };

  const logout = () => {
    removeToken();
    removeStoredUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
