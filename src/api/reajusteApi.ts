import api from './client';
import {
  HistoricoReajuste,
  CriarReajusteDto,
  AtualizarReajusteDto,
  CalcularReajusteDto,
} from '@/types/reajustes';

export const reajusteApi = {
  // Obtém todos os reajustes do usuário
  getAll: async (): Promise<HistoricoReajuste[]> => {
    const response = await api.get('/Reajustes/todos');
    return response.data;
  },

  // Obtém reajustes por contrato
  getByContrato: async (contratoId: string): Promise<HistoricoReajuste[]> => {
    const response = await api.get(`/Reajustes/contrato/${contratoId}`);
    return response.data;
  },

  // Obtém reajuste pelo ID
  getById: async (id: string): Promise<HistoricoReajuste> => {
    const response = await api.get(`/Reajustes/${id}`);
    return response.data;
  },

  // Obtém últimos reajustes
  getUltimos: async (quantidade: number = 10): Promise<HistoricoReajuste[]> => {
    const response = await api.get('/Reajustes/ultimos', {
      params: { quantidade },
    });
    return response.data;
  },

  // Cria novo reajuste
  create: async (data: CriarReajusteDto): Promise<HistoricoReajuste> => {
    const response = await api.post('/Reajustes', data);
    return response.data;
  },

  // Atualiza reajuste
  update: async (id: string, data: AtualizarReajusteDto): Promise<HistoricoReajuste> => {
    const response = await api.put(`/Reajustes/${id}`, data);
    return response.data;
  },

  // Exclui reajuste
  delete: async (id: string): Promise<void> => {
    await api.delete(`/Reajustes/${id}`);
  },

  // Calcula valor de reajuste
  calcular: async (data: CalcularReajusteDto): Promise<number> => {
    const response = await api.post('/Reajustes/calcular', data);
    return response.data;
  },

  // Sugere reajuste baseado em índice
  sugerir: async (contratoId: string, indice: string = 'IPCA'): Promise<string> => {
    const response = await api.get(`/Reajustes/sugerir/${contratoId}`, {
      params: { indice },
    });
    return response.data;
  },
};