export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  expiraEm: string;
  usuario: User;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  telefone: string;
}

export interface RegisterResponse {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  criadoEm: string;
}

export interface ChangePasswordRequest {
  senhaAtual: string;
  novaSenha: string;
  confirmarNovaSenha: string;
}

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  additionalProp1: string;
  additionalProp2: string;
  additionalProp3: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  criadoEm: string;
}

export interface UpdateUserRequest {
  nome: string;
  telefone: string;
}