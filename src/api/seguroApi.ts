import api from './client';
import {
  Seguro,
  SeguroCreate,
  SeguroUpdate,
  SegurosQuery,
} from '@/types/seguros';

export const seguroApi = {
  // Listar seguros por imóvel
  listByImovel: (imovelId: string) => {
    return api.get<Seguro[]>(`/Seguros/imovel/${imovelId}`);
  },

  // Listar todos os seguros
  listAll: (params?: SegurosQuery) => {
    return api.get<Seguro[]>('/Seguros/todos', { params });
  },

  // Obter seguro por ID
  getById: (id: string) => {
    return api.get<Seguro>(`/Seguros/${id}`);
  },

  // Criar novo seguro
  create: (data: SeguroCreate) => {
    return api.post<Seguro>('/Seguros', data);
  },

  // Atualizar seguro
  update: (id: string, data: SeguroUpdate) => {
    return api.put<Seguro>(`/Seguros/${id}`, data);
  },

  // Excluir seguro
  delete: (id: string) => {
    return api.delete(`/Seguros/${id}`);
  },

  // Buscar seguros por seguradora/apólice
  search: (params: { seguradora?: string; apolice?: string }) => {
    return api.get<Seguro[]>('/Seguros/buscar', { params });
  },

  // Seguros vencendo nos próximos 30 dias
  getVencendoProximos30Dias: () => {
    return api.get<Seguro[]>('/Seguros/vencendo-proximos-30-dias');
  },
};

// React Query keys e queries
export const seguroQueries = {
  all: () => ['seguros'] as const,
  lists: () => [...seguroQueries.all(), 'list'] as const,
  list: (params?: SegurosQuery) => [...seguroQueries.lists(), params] as const,
  details: () => [...seguroQueries.all(), 'detail'] as const,
  detail: (id: string) => [...seguroQueries.details(), id] as const,
  byImovel: (imovelId: string) => [...seguroQueries.all(), 'imovel', imovelId] as const,
  vencendo: () => [...seguroQueries.all(), 'vencendo'] as const,
};