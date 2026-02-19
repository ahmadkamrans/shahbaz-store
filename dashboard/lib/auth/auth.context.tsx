'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const dummyUser: AdminUser = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No API: always consider user as logged in with dummy user
    setUser(dummyUser);
    setLoading(false);
  }, []);

  const login = async (_email: string, _password: string) => {
    // No API: just set dummy user (redirect to dashboard is done by login page)
    setUser(dummyUser);
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
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
