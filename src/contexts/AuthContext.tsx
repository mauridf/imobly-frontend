import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { authApi } from '@/api/authApi';
import { useQuery } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  
  // Query para buscar dados do usuário
  const {
    data: user,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authApi.getCurrentUser(),
    enabled: !!token, // Só executa se tiver token
    retry: false,
  });

  useEffect(() => {
    // Verificar se há token no localStorage
    const storedToken = localStorage.getItem('token');
    
    if (storedToken) {
      setToken(storedToken);
    } else {
      setToken(null);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    // Forçar refetch dos dados do usuário
    refetchUser();
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    refetchUser();
  };

  const value = {
    user: user || null,
    token,
    isAuthenticated: !!token && !!user,
    isLoading: isUserLoading,
    login,
    logout,
    updateUser,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}