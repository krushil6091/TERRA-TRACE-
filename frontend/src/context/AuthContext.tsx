import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AdminUser } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<AdminUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser>({
    id: 'adm-001',
    username: 'investigator',
    full_name: 'Lead Forensic Auditor',
    badge_id: 'EXAM-SEC-7749',
    role: 'Lead Forensic Auditor',
    organization: 'Exam Integrity & Audit Bureau (Air-Gapped Enclave)',
    is_authenticated: true,
  });
  const [isLoading] = useState<boolean>(false);

  useEffect(() => {
    // Attempt to sync offline session with backend if reachable
    const initSession = async () => {
      try {
        const session = await api.getSession();
        if (session && session.is_authenticated) {
          setUser(session);
        }
      } catch (err) {
        // Keep default offline auditor
      }
    };
    initSession();
  }, []);

  const login = async () => {
    // No-op for offline
  };

  const logout = () => {
    // No-op for offline
  };

  const updateProfile = (updates: Partial<AdminUser>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
