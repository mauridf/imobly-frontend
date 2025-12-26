export interface Locatario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  status: string;
  criadoEm: string;
  enderecoLogradouro?: string;
  enderecoNumero?: string;
  enderecoBairro?: string;
  enderecoCidade?: string;
  enderecoEstado?: string;
  enderecoCEP?: string;
}

export interface CreateLocatarioRequest {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  enderecoLogradouro: string;
  enderecoNumero: string;
  enderecoBairro: string;
  enderecoCidade: string;
  enderecoEstado: string;
  enderecoCEP: string;
}

export interface UpdateLocatarioRequest {
  nome: string;
  email: string;
  telefone: string;
  rg: string;
  dataNascimento: string;
}

export interface SearchLocatariosParams {
  termo?: string;
}

// Tipo unificado para formulário
export interface LocatarioFormFields {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  enderecoLogradouro?: string;
  enderecoNumero?: string;
  enderecoBairro?: string;
  enderecoCidade?: string;
  enderecoEstado?: string;
  enderecoCEP?: string;
}