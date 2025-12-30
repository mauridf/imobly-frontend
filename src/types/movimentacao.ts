export type TipoMovimentacao = 'Despesa' | 'Receita';
export type CategoriaMovimentacao = 'Manutencao' | 'IPTU' | 'Seguro' | 'Outros';
export type StatusMovimentacao = 'Pendente' | 'Pago' | 'Recebido' | 'Cancelado';

export interface MovimentacaoFinanceira {
  id: string;
  imovelId?: string;
  tipo: TipoMovimentacao;
  categoria: CategoriaMovimentacao;
  descricao: string;
  valor: number;
  data: string;
  status: StatusMovimentacao;
  criadoEm: string;
  imovelTitulo?: string;
}

export interface CreateMovimentacaoRequest {
  imovelId?: string;
  tipo: TipoMovimentacao;
  categoria: CategoriaMovimentacao;
  descricao: string;
  valor: number;
  data: string;
}

export interface UpdateMovimentacaoRequest {
  descricao: string;
  valor: number;
  data: string;
  status: StatusMovimentacao;
}

export interface PagarMovimentacaoRequest {
  // Pode conter informações adicionais se necessário
  dataPagamento?: string;
}

export interface SearchMovimentacoesParams {
  imovelId?: string;
  tipo?: TipoMovimentacao;
  categoria?: CategoriaMovimentacao;
  status?: StatusMovimentacao;
  inicio?: string;
  fim?: string;
}

export interface SaldoPeriodo {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

export interface RelatorioAnual {
  mes: number;
  receitas: number;
  despesas: number;
  saldo: number;
}