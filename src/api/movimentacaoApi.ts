import apiClient from './client';
import {
  MovimentacaoFinanceira,
  CreateMovimentacaoRequest,
  UpdateMovimentacaoRequest,
  PagarMovimentacaoRequest,
  SaldoPeriodo,
  RelatorioAnual,
} from '@/types/movimentacao';

export const movimentacaoApi = {
  // Listar todas as movimentações
  async getAll(): Promise<MovimentacaoFinanceira[]> {
    const response = await apiClient.get<MovimentacaoFinanceira[]>('/Movimentacoes/todas');
    return response.data;
  },

  // Listar por imóvel
  async getByImovel(imovelId: string): Promise<MovimentacaoFinanceira[]> {
    const response = await apiClient.get<MovimentacaoFinanceira[]>(`/Movimentacoes/imovel/${imovelId}`);
    return response.data;
  },

  // Listar por período
  async getByPeriodo(inicio: string, fim: string): Promise<MovimentacaoFinanceira[]> {
    const response = await apiClient.get<MovimentacaoFinanceira[]>('/Movimentacoes/periodo', {
      params: { inicio, fim },
    });
    return response.data;
  },

  // Listar por categoria
  async getByCategoria(categoria: string): Promise<MovimentacaoFinanceira[]> {
    const response = await apiClient.get<MovimentacaoFinanceira[]>(`/Movimentacoes/categoria/${categoria}`);
    return response.data;
  },

  // Obter por ID
  async getById(id: string): Promise<MovimentacaoFinanceira> {
    const response = await apiClient.get<MovimentacaoFinanceira>(`/Movimentacoes/${id}`);
    return response.data;
  },

  // Criar movimentação
  async create(data: CreateMovimentacaoRequest): Promise<MovimentacaoFinanceira> {
    const response = await apiClient.post<MovimentacaoFinanceira>('/Movimentacoes', data);
    return response.data;
  },

  // Atualizar movimentação
  async update(id: string, data: UpdateMovimentacaoRequest): Promise<MovimentacaoFinanceira> {
    const response = await apiClient.put<MovimentacaoFinanceira>(`/Movimentacoes/${id}`, data);
    return response.data;
  },

  // Excluir movimentação
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/Movimentacoes/${id}`);
  },

  // Registrar pagamento
  async pagar(id: string, data?: PagarMovimentacaoRequest): Promise<void> {
    await apiClient.put(`/Movimentacoes/${id}/pagar`, data || {});
  },

  // Registrar recebimento
  async receber(id: string, data?: PagarMovimentacaoRequest): Promise<void> {
    await apiClient.put(`/Movimentacoes/${id}/receber`, data || {});
  },

  // Registrar cancelamento
  async cancelar(id: string, data?: PagarMovimentacaoRequest): Promise<void> {
    await apiClient.put(`/Movimentacoes/${id}/cancelar`, data || {});
  },


  // Obter saldo por período
  async getSaldoPeriodo(inicio: string, fim: string): Promise<SaldoPeriodo> {
    const response = await apiClient.get<SaldoPeriodo>('/Movimentacoes/saldo-periodo', {
      params: { inicio, fim },
    });
    return response.data;
  },

  // Obter relatório anual
  async getRelatorioAnual(ano: number): Promise<RelatorioAnual[]> {
    const response = await apiClient.get<RelatorioAnual[]>(`/Movimentacoes/relatorio/${ano}`);
    return response.data;
  },

  // Buscar com filtros
  async search(params: {
    imovelId?: string;
    tipo?: string;
    categoria?: string;
    status?: string;
    inicio?: string;
    fim?: string;
  }): Promise<MovimentacaoFinanceira[]> {
    const response = await apiClient.get<MovimentacaoFinanceira[]>('/Movimentacoes/search', {
      params,
    });
    return response.data;
  },
};