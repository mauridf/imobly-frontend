import { ApiError } from '@/types/auth';
import { AxiosError } from 'axios';

export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;
    
    if (apiError?.detail) {
      return apiError.detail;
    }
    
    if (apiError?.title) {
      return apiError.title;
    }
    
    if (error.response?.status === 401) {
      return 'Credenciais inválidas';
    }
    
    if (error.response?.status === 400) {
      return 'Dados inválidos fornecidos';
    }
    
    if (error.message) {
      return error.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Ocorreu um erro inesperado. Tente novamente.';
}