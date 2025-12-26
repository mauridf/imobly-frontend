import apiClient from './client';
import {
  Imovel,
  CreateImovelRequest,
  UpdateImovelRequest,
  SearchImoveisParams,
} from '@/types/imovel';

export const imovelApi = {
  // Listar todos os imóveis do usuário
  async getAll(): Promise<Imovel[]> {
    const response = await apiClient.get<Imovel[]>('/Imoveis');
    return response.data;
  },

  // Buscar imóveis com filtro
  async search(params: SearchImoveisParams): Promise<Imovel[]> {
    const response = await apiClient.get<Imovel[]>('/Imoveis/buscar', { params });
    return response.data;
  },

  // Obter imóvel por ID
  async getById(id: string): Promise<Imovel> {
    const response = await apiClient.get<Imovel>(`/Imoveis/${id}`);
    return response.data;
  },

  // Criar novo imóvel
  async create(data: CreateImovelRequest): Promise<Imovel> {
    const response = await apiClient.post<Imovel>('/Imoveis', data);
    return response.data;
  },

  // Atualizar imóvel
  async update(id: string, data: UpdateImovelRequest): Promise<Imovel> {
    const response = await apiClient.put<Imovel>(`/Imoveis/${id}`, data);
    return response.data;
  },

  // Excluir imóvel
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/Imoveis/${id}`);
  },

  // Ativar imóvel
  async activate(id: string): Promise<void> {
    await apiClient.put(`/Imoveis/${id}/ativar`);
  },

  // Desativar imóvel
  async deactivate(id: string): Promise<void> {
    await apiClient.put(`/Imoveis/${id}/desativar`);
  },
};

// Queries do React Query para Imóveis
export const imovelQueries = {
  all: () => ({
    queryKey: ['imoveis'],
    queryFn: () => imovelApi.getAll(),
  }),
  detail: (id: string) => ({
    queryKey: ['imoveis', id],
    queryFn: () => imovelApi.getById(id),
  }),
  search: (params: SearchImoveisParams) => ({
    queryKey: ['imoveis', 'search', params],
    queryFn: () => imovelApi.search(params),
  }),
};