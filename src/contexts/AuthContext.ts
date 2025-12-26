import { createContext } from 'react';
import { User } from '@/types/auth';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  refetchUser: () => void;
}

// Exportar o contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);