import apiClient from './client';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ChangePasswordRequest,
  UpdateUserRequest,
  User,
  ApiError,
} from '@/types/auth';

export const authApi = {
  // Registrar novo usuário
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(
      '/Auth/registrar',
      data
    );
    return response.data;
  },

  // Login
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/Auth/login', data);
    return response.data;
  },

  // Alterar senha
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.put('/Auth/alterar-senha', data);
  },

  // Validar token
  async validateToken(): Promise<void> {
    await apiClient.get('/Auth/validar');
  },

  // Obter dados do usuário atual
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/Usuarios/me');
    return response.data;
  },

  // Atualizar dados do usuário
  async updateUser(data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<User>('/Usuarios/me', data);
    return response.data;
  },

  // Alterar senha (endpoint Usuarios)
  async updatePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.put('/Usuarios/alterar-senha', data);
  },
};

// Hook do React Query para autenticação
export const authQueries = {
  // Query para obter dados do usuário atual
  currentUser: () => ({
    queryKey: ['currentUser'],
    queryFn: () => authApi.getCurrentUser(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  }),
};