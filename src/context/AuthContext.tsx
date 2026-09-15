import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService, AuthSession } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<User>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession>(authService.getSession());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsub = authService.subscribe((newSession) => {
      setSession(newSession);
    });
    return () => unsub();
  }, []);

  const login = async (email: string, pass: string, rememberMe = true) => {
    setIsLoading(true);
    const res = await authService.login(email, pass, rememberMe);
    setIsLoading(false);
    return res;
  };

  const register = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    const res = await authService.register(name, email, pass);
    setIsLoading(false);
    return res;
  };

  const logout = async () => {
    setIsLoading(true);
    await authService.logout();
    setIsLoading(false);
  };

  const updateProfile = async (data: Partial<User>) => {
    return authService.updateProfile(data);
  };

  const forgotPassword = async (email: string) => {
    return authService.forgotPassword(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user: session.user,
        isAuthenticated: session.isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
