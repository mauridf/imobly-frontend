export type StatusRecebimento = 'Aguardando' | 'Pago' | 'Atrasado' | 'Adiantado';

export interface Recebimento {
  id: string;
  contratoId: string;
  competencia: string; // Data no formato ISO
  valorPrevisto: number;
  valorPago: number;
  dataPagamento?: string;
  status: StatusRecebimento;
  criadoEm: string;
  imovelTitulo: string;
  locatarioNome: string;
}

export interface CreateRecebimentoRequest {
  contratoId: string;
  competencia: string;
  valorPrevisto: number;
}

export interface UpdateRecebimentoRequest {
  valorPago: number;
  dataPagamento: string;
}

export interface PagarRecebimentoRequest {
  valorPago: number;
  dataPagamento: string;
}

export interface GerarRecebimentosRequest {
  contratoId: string;
  dataInicio: string;
  dataFim: string;
  valorAluguel: number;
  diaVencimento: number;
}

export interface SearchRecebimentosParams {
  contratoId?: string;
  status?: StatusRecebimento;
  mes?: number;
  ano?: number;
}

// Tipos auxiliares
export interface ContratoOption {
  value: string;
  label: string;
  valorAluguel: number;
  diaVencimento: number;
  imovelTitulo: string;
  locatarioNome: string;
}

export interface RecebimentoDashboard {
  totalMes: number;
  totalPendente: number;
  totalAtrasado: number;
  totalRecebidoMes: number;
}