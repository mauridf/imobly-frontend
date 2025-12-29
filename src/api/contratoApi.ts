import apiClient from './client';
import {
  Contrato,
  ContratoDetalhes,
  CreateContratoRequest,
  UpdateContratoRequest,
} from '@/types/contrato';

export const contratoApi = {
  // Listar todos os contratos
  async getAll(): Promise<Contrato[]> {
    const response = await apiClient.get<Contrato[]>('/Contratos');
    return response.data;
  },

  // Obter contrato por ID
  async getById(id: string): Promise<Contrato> {
    const response = await apiClient.get<Contrato>(`/Contratos/${id}`);
    return response.data;
  },

  // Obter detalhes do contrato
  async getDetalhes(id: string): Promise<ContratoDetalhes> {
    const response = await apiClient.get<ContratoDetalhes>(`/Contratos/${id}/detalhes`);
    return response.data;
  },

  // Criar novo contrato
  async create(data: CreateContratoRequest): Promise<Contrato> {
    const response = await apiClient.post<Contrato>('/Contratos', data);
    return response.data;
  },

  // Atualizar contrato
  async update(id: string, data: UpdateContratoRequest): Promise<Contrato> {
    const response = await apiClient.put<Contrato>(`/Contratos/${id}`, data);
    return response.data;
  },

  // Excluir contrato
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/Contratos/${id}`);
  },

  // Encerrar contrato
  async encerrar(id: string): Promise<void> {
    await apiClient.put(`/Contratos/${id}/encerrar`);
  },

  // Suspender contrato
  async suspender(id: string): Promise<void> {
    await apiClient.put(`/Contratos/${id}/suspender`);
  },

  // Reativar contrato
  async reativar(id: string): Promise<void> {
    await apiClient.put(`/Contratos/${id}/reativar`);
  },

  // Gerar PDF (baixar)
  async gerarPDF(id: string): Promise<Blob> {
    const response = await apiClient.get(`/Contratos/${id}/gerar-pdf`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf',
      },
    });
    return response.data;
  },

  // Salvar PDF no sistema
  async salvarPDF(id: string): Promise<Contrato> {
    const response = await apiClient.post<Contrato>(`/Contratos/${id}/salvar-pdf`);
    return response.data;
  },
};

// Queries do React Query para Contratos
export const contratoQueries = {
  all: () => ({
    queryKey: ['contratos'],
    queryFn: () => contratoApi.getAll(),
  }),
  detail: (id: string) => ({
    queryKey: ['contratos', id],
    queryFn: () => contratoApi.getById(id),
  }),
  detalhes: (id: string) => ({
    queryKey: ['contratos', 'detalhes', id],
    queryFn: () => contratoApi.getDetalhes(id),
  }),
};