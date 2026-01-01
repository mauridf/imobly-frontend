export interface HistoricoReajuste {
  id: string;
  contratoId: string;
  valorAnterior: number;
  valorNovo: number;
  dataReajuste: string;
  indiceUtilizado: string;
  criadoEm: string;
  // Propriedades relacionadas para exibição
  contratoDescricao?: string;
  imovelTitulo?: string;
  locatarioNome?: string;
}

export interface CriarReajusteDto {
  contratoId: string;
  valorNovo: number;
  indiceUtilizado: string;
}

export interface AtualizarReajusteDto {
  contratoId: string;
  valorNovo: number;
  indiceUtilizado: string;
}

export interface CalcularReajusteDto {
  valorAtual: number;
  indice: string;
  percentual: number;
}

// Opções de índice
export const INDICES_REAJUSTE = [
  { value: 'IPCA', label: 'IPCA' },
  { value: 'IGPM', label: 'IGP-M' },
  { value: 'INCC', label: 'INCC' },
  { value: 'IPC', label: 'IPC' },
  { value: 'Customizado', label: 'Customizado' },
];