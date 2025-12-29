import { z } from 'zod';

// Definir os valores do enum primeiro
const statusEnum = ['Ativo', 'Encerrado', 'Suspenso'] as const;

// Schema base
const baseContratoSchema = z.object({
  imovelId: z.string().uuid('ID do imóvel inválido'),
  locatarioId: z.string().uuid('ID do locatário inválido'),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().min(1, 'Data de fim é obrigatória'),
  valorAluguel: z.number().min(0.01, 'Valor do aluguel deve ser maior que 0'),
  valorSeguro: z.number().min(0, 'Valor do seguro não pode ser negativo'),
  diaVencimento: z.number().min(1, 'Dia de vencimento inválido').max(31, 'Dia de vencimento inválido'),
});

// Schema para criação
export const contratoSchema = baseContratoSchema.refine(
  (data) => new Date(data.dataFim) > new Date(data.dataInicio),
  {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['dataFim'],
  }
);

// Schema para atualização
export const updateContratoSchema = z.object({
  dataFim: z.string().min(1, 'Data de fim é obrigatória'),
  valorAluguel: z.number().min(0.01, 'Valor do aluguel deve ser maior que 0'),
  valorSeguro: z.number().min(0, 'Valor do seguro não pode ser negativo'),
  diaVencimento: z.number().min(1, 'Dia de vencimento inválido').max(31, 'Dia de vencimento inválido'),
  // Corrigido: Remover errorMap e usar apenas a string de mensagem
  status: z.enum(statusEnum).refine(
    (val) => statusEnum.includes(val),
    { message: 'Status inválido' }
    ),
});

// Tipos
export type ContratoFormData = z.infer<typeof contratoSchema>;
export type UpdateContratoFormData = z.infer<typeof updateContratoSchema>;