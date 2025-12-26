export interface Endereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface Imovel {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string;
  endereco: Endereco;
  areaM2: number;
  quartos: number;
  banheiros: number;
  vagasGaragem: number;
  valorAluguelSugerido: number;
  ativo: boolean;
  criadoEm: string;
  usuarioId: string;
}

export interface CreateImovelRequest {
  tipo: string;
  titulo: string;
  descricao: string;
  endereco: Endereco;
  areaM2: number;
  quartos: number;
  banheiros: number;
  vagasGaragem: number;
  valorAluguelSugerido: number;
}

export interface UpdateImovelRequest {
  titulo: string;
  descricao: string;
  endereco: Endereco;
  areaM2: number;
  quartos: number;
  banheiros: number;
  vagasGaragem: number;
  valorAluguelSugerido: number;
  ativo: boolean;
}

export interface SearchImoveisParams {
  termo?: string;
}

export interface ImovelFormData {
  tipo: string;
  titulo: string;
  descricao: string;
  endereco: Endereco;
  areaM2: number;
  quartos: number;
  banheiros: number;
  vagasGaragem: number;
  valorAluguelSugerido: number;
}