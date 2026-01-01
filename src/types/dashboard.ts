export interface DashboardResumo {
  totalImoveis: number;
  imoveisAtivos: number;
  totalLocatarios: number;
  contratosAtivos: number;
  recebimentosPendentes: number;
  manutencoesPendentes: number;
  receitaMensal: number;
  despesaMensal: number;
  saldoMensal: number;
}

export interface GraficoReceitaDespesa {
  mes: string;
  receita: number;
  despesa: number;
}

export interface ContratoVencimento {
  id: string;
  imovelTitulo: string;
  locatarioNome: string;
  dataFim: Date | string;
  diasParaVencimento: number;
}

export interface ManutencaoPendente {
  id: string;
  imovelTitulo: string;
  descricao: string;
  data: Date | string;
  valor: number;
}

export interface EstatisticasDetalhadas {
  totalRecebidoAno: number;
  totalDespesasAno: number;
  saldoAno: number;
  locatariosInadimplentes: number;
  totalAtrasado: number;
  percentualInadimplencia: number;
  mesMaisRentavel: string;
  contratosVencendoProximoMes: number;
  previsaoReceitaProximoMes: number;
}