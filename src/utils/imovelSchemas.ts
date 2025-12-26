import { z } from 'zod';

export const enderecoSchema = z.object({
  logradouro: z.string().min(1, 'Logradouro é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(2, 'Estado é obrigatório (ex: SP)').max(2, 'Estado deve ter 2 caracteres'),
  cep: z.string().min(8, 'CEP inválido').max(9, 'CEP inválido'),
});

export const imovelSchema = z.object({
  tipo: z.string().min(1, 'Tipo do imóvel é obrigatório'),
  titulo: z.string().min(1, 'Título é obrigatório').min(3, 'Título deve ter pelo menos 3 caracteres'),
  descricao: z.string().min(1, 'Descrição é obrigatória').min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  endereco: enderecoSchema,
  areaM2: z.number().min(1, 'Área deve ser maior que 0'),
  quartos: z.number().min(0, 'Número de quartos não pode ser negativo'),
  banheiros: z.number().min(0, 'Número de banheiros não pode ser negativo'),
  vagasGaragem: z.number().min(0, 'Número de vagas não pode ser negativo'),
  valorAluguelSugerido: z.number().min(0, 'Valor do aluguel não pode ser negativo'),
});

export type ImovelFormData = z.infer<typeof imovelSchema>;