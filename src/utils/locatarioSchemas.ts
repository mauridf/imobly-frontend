import { z } from 'zod';

// Schema base com todos os campos
const baseLocatarioSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  telefone: z.string().min(1, 'Telefone é obrigatório').min(10, 'Telefone inválido'),
  rg: z.string().min(1, 'RG é obrigatório'),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
});

// Schema para criação (com todos os campos obrigatórios)
export const locatarioSchema = baseLocatarioSchema.extend({
  cpf: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido'),
  enderecoLogradouro: z.string().min(1, 'Logradouro é obrigatório'),
  enderecoNumero: z.string().min(1, 'Número é obrigatório'),
  enderecoBairro: z.string().min(1, 'Bairro é obrigatório'),
  enderecoCidade: z.string().min(1, 'Cidade é obrigatória'),
  enderecoEstado: z.string().min(2, 'Estado é obrigatório').max(2, 'Estado deve ter 2 caracteres'),
  enderecoCEP: z.string().min(8, 'CEP inválido').max(9, 'CEP inválido'),
});

// Schema para atualização (apenas campos editáveis)
export const updateLocatarioSchema = baseLocatarioSchema;

// Type para criação
export type LocatarioFormData = z.infer<typeof locatarioSchema>;

// Type para atualização
export type UpdateLocatarioFormData = z.infer<typeof updateLocatarioSchema>;

// Type unificado para uso no formulário
export type LocatarioFormFields = LocatarioFormData & Partial<UpdateLocatarioFormData>;