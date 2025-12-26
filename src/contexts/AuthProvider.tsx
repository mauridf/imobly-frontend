import { useState } from 'react';
import { User } from '@/types/auth';
import { authApi } from '@/api/authApi';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    // Estado inicial baseado no localStorage
    return localStorage.getItem('token');
  });
  
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