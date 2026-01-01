import api from './client';
import {
  Manutencao,
  CriarManutencaoDto,
  AtualizarManutencaoDto,
} from '@/types/manutencoes';

export const manutencaoApi = {
  // Obtém todas as manutenções do usuário
  getAll: async (): Promise<Manutencao[]> => {
    const response = await api.get('/Manutencoes/todas');
    return response.data;
  },

  // Obtém manutenções por imóvel
  getByImovel: async (imovelId: string): Promise<Manutencao[]> => {
    const response = await api.get(`/Manutencoes/imovel/${imovelId}`);
    return response.data;
  },

  // Obtém manutenção pelo ID
  getById: async (id: string): Promise<Manutencao> => {
    const response = await api.get(`/Manutencoes/${id}`);
    return response.data;
  },

  // Cria nova manutenção
  create: async (data: CriarManutencaoDto): Promise<Manutencao> => {
    const response = await api.post('/Manutencoes', data);
    return response.data;
  },

  // Atualiza manutenção
  update: async (id: string, data: AtualizarManutencaoDto): Promise<Manutencao> => {
    const response = await api.put(`/Manutencoes/${id}`, data);
    return response.data;
  },

  // Exclui manutenção
  delete: async (id: string): Promise<void> => {
    await api.delete(`/Manutencoes/${id}`);
  },

  // Marca manutenção como concluída
  concluir: async (id: string): Promise<void> => {
    await api.put(`/Manutencoes/${id}/concluir`);
  },
};