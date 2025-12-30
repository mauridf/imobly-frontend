import apiClient from './client';
import {
  Recebimento,
  CreateRecebimentoRequest,
  PagarRecebimentoRequest,
  GerarRecebimentosRequest,
} from '@/types/recebimento';

export const recebimentoApi = {
  // Listar todos os recebimentos por contrato
  async getByContrato(contratoId: string): Promise<Recebimento[]> {
    const response = await apiClient.get<Recebimento[]>(`/Recebimentos/contrato/${contratoId}`);
    return response.data;
  },

  // Listar recebimentos pendentes
  async getPendentes(): Promise<Recebimento[]> {
    const response = await apiClient.get<Recebimento[]>('/Recebimentos/pendentes');
    return response.data;
  },

  // Listar recebimentos atrasados
  async getAtrasados(): Promise<Recebimento[]> {
    const response = await apiClient.get<Recebimento[]>('/Recebimentos/atrasados');
    return response.data;
  },

  // Registrar pagamento
  async pagar(id: string, data: PagarRecebimentoRequest): Promise<Recebimento> {
    const response = await apiClient.put<Recebimento>(`/Recebimentos/${id}/pagar`, data);
    return response.data;
  },

  // Gerar recebimentos em lote
  async gerar(data: GerarRecebimentosRequest): Promise<Recebimento[]> {
    const response = await apiClient.post<Recebimento[]>('/Recebimentos/gerar', data);
    return response.data;
  },

  // Criar recebimento individual - CORRIGIDO: Use endpoint correto
  async create(data: CreateRecebimentoRequest): Promise<Recebimento> {
    const response = await apiClient.post<Recebimento>('/Recebimentos/gerar', data);
    return response.data;
  },

  // Obter total do mês atual
  async getTotalMes(): Promise<number> {
    const response = await apiClient.get<number>('/Recebimentos/total-mes');
    return response.data;
  },

  // Obter total por mês/ano
  async getTotalPorMes(ano: number, mes: number): Promise<number> {
    const response = await apiClient.get<number>(`/Recebimentos/total/${ano}/${mes}`);
    return response.data;
  },

  // Obter detalhes de um recebimento
  async getById(id: string): Promise<Recebimento> {
    const response = await apiClient.get<Recebimento>(`/Recebimentos/${id}`);
    return response.data;
  },

  // async getAll(): Promise<Recebimento[]> {
  //   try {
  //     // Tentar primeiro o endpoint específico se existir
  //     const response = await apiClient.get<Recebimento[]>('/Recebimentos');
  //     return response.data;
  //   } catch (error) {
  //     // Se não existir, usar getPendentes e buscar dados complementares
  //     console.log('Endpoint /Recebimentos não encontrado, buscando dados...');
      
  //     // Buscar apenas pendentes (que é o que temos)
  //     const recebimentos = await this.getPendentes();
      
  //     // Para cada recebimento, buscar contrato para complementar dados
  //     // Mas isso seria muitas requisições... melhor seria criar endpoint no backend
      
  //     return recebimentos;
  //   }
  // },

  async getAll(): Promise<Recebimento[]> {
    const response = await apiClient.get<Recebimento[]>('/Recebimentos/todos');
    return response.data;
  },
};