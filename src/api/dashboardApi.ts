import api from './client';
import {
  DashboardResumo,
  GraficoReceitaDespesa,
  ContratoVencimento,
  ManutencaoPendente,
  EstatisticasDetalhadas,
} from '@/types/dashboard';

export const dashboardApi = {
  // Obter resumo do dashboard
  getResumo: () => {
    return api.get<DashboardResumo>('/Dashboard/resumo');
  },

  // Obter gráfico de receitas e despesas
  getGraficoReceitaDespesa: () => {
    return api.get<GraficoReceitaDespesa[]>('/Dashboard/grafico-receita-despesa');
  },

  // Obter contratos próximos do vencimento
  getContratosVencimento: () => {
    return api.get<ContratoVencimento[]>('/Dashboard/contratos-vencimento');
  },

  // Obter manutenções pendentes
  getManutencoesPendentes: () => {
    return api.get<ManutencaoPendente[]>('/Dashboard/manutencoes-pendentes');
  },

  // Obter estatísticas detalhadas
  getEstatisticasDetalhadas: () => {
    return api.get<EstatisticasDetalhadas>('/Dashboard/estatisticas-detalhadas');
  },
};

// React Query keys e queries
export const dashboardQueries = {
  all: () => ['dashboard'] as const,
  resumo: () => [...dashboardQueries.all(), 'resumo'] as const,
  grafico: () => [...dashboardQueries.all(), 'grafico'] as const,
  contratosVencimento: () => [...dashboardQueries.all(), 'contratos-vencimento'] as const,
  manutencoesPendentes: () => [...dashboardQueries.all(), 'manutencoes-pendentes'] as const,
  estatisticas: () => [...dashboardQueries.all(), 'estatisticas'] as const,
};