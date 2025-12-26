import apiClient from './client';
import {
  Locatario,
  CreateLocatarioRequest,
  UpdateLocatarioRequest,
  SearchLocatariosParams,
} from '@/types/locatario';

export const locatarioApi = {
  // Listar todos os locatários
  async getAll(): Promise<Locatario[]> {
    const response = await apiClient.get<Locatario[]>('/Locatarios');
    return response.data;
  },

  // Buscar locatários com filtro
  async search(params: SearchLocatariosParams): Promise<Locatario[]> {
    const response = await apiClient.get<Locatario[]>('/Locatarios/buscar', { params });
    return response.data;
  },

  // Obter locatário por ID
  async getById(id: string): Promise<Locatario> {
    const response = await apiClient.get<Locatario>(`/Locatarios/${id}`);
    return response.data;
  },

  // Criar novo locatário
  async create(data: CreateLocatarioRequest): Promise<Locatario> {
    const response = await apiClient.post<Locatario>('/Locatarios', data);
    return response.data;
  },

  // Atualizar locatário
  async update(id: string, data: UpdateLocatarioRequest): Promise<Locatario> {
    const response = await apiClient.put<Locatario>(`/Locatarios/${id}`, data);
    return response.data;
  },

  // Excluir locatário
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/Locatarios/${id}`);
  },

  // Marcar como adimplente
  async markAsAdimplente(id: string): Promise<void> {
    await apiClient.put(`/Locatarios/${id}/adimplente`);
  },

  // Marcar como inadimplente
  async markAsInadimplente(id: string): Promise<void> {
    await apiClient.put(`/Locatarios/${id}/inadimplente`);
  },
};

// Queries do React Query para Locatários
export const locatarioQueries = {
  all: () => ({
    queryKey: ['locatarios'],
    queryFn: () => locatarioApi.getAll(),
  }),
  detail: (id: string) => ({
    queryKey: ['locatarios', id],
    queryFn: () => locatarioApi.getById(id),
  }),
  search: (params: SearchLocatariosParams) => ({
    queryKey: ['locatarios', 'search', params],
    queryFn: () => locatarioApi.search(params),
  }),
};