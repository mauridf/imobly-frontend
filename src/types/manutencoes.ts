export interface Manutencao {
  id: string;
  imovelId: string;
  descricao: string;
  data: string;
  valor: number;
  responsavel: string;
  status: StatusManutencao;
  criadoEm: string;
  // Propriedades relacionadas para exibição
  imovelTitulo?: string;
  imovelEndereco?: string;
}

export type StatusManutencao = 'Pendente' | 'Feito';

export interface CriarManutencaoDto {
  imovelId: string;
  descricao: string;
  data: string;
  valor: number;
  responsavel: string;
}

export interface AtualizarManutencaoDto {
  descricao: string;
  data: string;
  valor: number;
  responsavel: string;
  status: StatusManutencao;
}

// Opções de status
export const STATUS_MANUTENCAO_OPTIONS = [
  { value: 'Pendente', label: 'Pendente' },
  { value: 'Feito', label: 'Feito' },
];