// Definir tipo para status
export type ContratoStatus = 'Ativo' | 'Encerrado' | 'Suspenso';

export interface Contrato {
  id: string;
  imovelId: string;
  locatarioId: string;
  dataInicio: string;
  dataFim: string;
  valorAluguel: number;
  valorSeguro: number;
  diaVencimento: number;
  status: ContratoStatus;
  caminhoDocumentoPDF: string;
  criadoEm: string;
  imovelTitulo: string;
  locatarioNome: string;
}

export interface ContratoDetalhes extends Contrato {
  totalRecebimentos: number;
  recebimentosPagos: number;
  recebimentosAtrasados: number;
  totalRecebido: number;
  historicosReajuste: HistoricoReajuste[];
}

export interface HistoricoReajuste {
  id: string;
  contratoId: string;
  valorAnterior: number;
  valorNovo: number;
  dataReajuste: string;
  indiceUtilizado: string;
  criadoEm: string;
}

export interface CreateContratoRequest {
  imovelId: string;
  locatarioId: string;
  dataInicio: string;
  dataFim: string;
  valorAluguel: number;
  valorSeguro: number;
  diaVencimento: number;
}

export interface UpdateContratoRequest {
  dataFim: string;
  valorAluguel: number;
  valorSeguro: number;
  diaVencimento: number;
  status: ContratoStatus;
}

export interface SearchContratosParams {
  termo?: string;
}

export interface ContratoFormData {
  imovelId: string;
  locatarioId: string;
  dataInicio: string;
  dataFim: string;
  valorAluguel: number;
  valorSeguro: number;
  diaVencimento: number;
}

export interface UpdateContratoFormData {
  dataFim: string;
  valorAluguel: number;
  valorSeguro: number;
  diaVencimento: number;
  status: ContratoStatus;
}

// Tipos auxiliares para selects
export interface SelectOption {
  value: string;
  label: string;
  extra?: {
    valorAluguelSugerido?: number;
    [key: string]: unknown;
  };
}