export interface Seguro {
  id: string;
  imovelId: string;
  descricao: string;
  valor: number;
  dataInicio: Date | string;
  dataFim: Date | string;
  seguradora: string;
  apolice: string;
  criadoEm: Date | string;
  imovelTitulo: string;
}

export interface SeguroCreate {
  imovelId: string;
  descricao: string;
  valor: number;
  dataInicio: Date | string;
  dataFim: Date | string;
  seguradora: string;
  apolice: string;
}

export interface SeguroUpdate {
  descricao: string;
  valor: number;
  dataInicio: Date | string;
  dataFim: Date | string;
  seguradora: string;
  apolice: string;
}

export interface SegurosQuery {
  search?: string;
  imovelId?: string;
  seguradora?: string;
  apolice?: string;
}

export interface SeguroResponse {
  id: string;
  imovelId: string;
  descricao: string;
  valor: number;
  dataInicio: string;
  dataFim: string;
  seguradora: string;
  apolice: string;
  criadoEm: string;
  imovelTitulo: string;
}