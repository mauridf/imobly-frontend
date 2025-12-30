// src/schemas/recebimentoSchemas.ts
import { z } from 'zod';

// Definir os valores do enum
const statusEnum = ['Aguardando', 'Pago', 'Atrasado', 'Adiantado'] as const;

// Schema para criação de recebimento
export const recebimentoSchema = z.object({
  contratoId: z.string().uuid('ID do contrato inválido'),
  competencia: z.string().min(1, 'Competência é obrigatória'),
  valorPrevisto: z.number().min(0.01, 'Valor previsto deve ser maior que 0'),
});

// Schema para pagamento de recebimento
export const pagarRecebimentoSchema = z.object({
  valorPago: z.number().min(0.01, 'Valor pago deve ser maior que 0'),
  dataPagamento: z.string().min(1, 'Data de pagamento é obrigatória'),
});

// Schema para geração em lote
export const gerarRecebimentosSchema = z.object({
  contratoId: z.string().uuid('ID do contrato inválido'),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().min(1, 'Data de fim é obrigatória'),
  valorAluguel: z.number().min(0.01, 'Valor do aluguel deve ser maior que 0'),
  diaVencimento: z.number().min(1, 'Dia de vencimento inválido').max(31, 'Dia de vencimento inválido'),
}).refine(
  (data) => new Date(data.dataFim) > new Date(data.dataInicio),
  {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['dataFim'],
  }
);

// Schema para edição (atualização)
export const updateRecebimentoSchema = z.object({
  valorPago: z.number().min(0, 'Valor pago não pode ser negativo'),
  dataPagamento: z.string().optional(),
  status: z.enum(statusEnum).refine(
    (val) => statusEnum.includes(val),
    { message: 'Status inválido' }
  ),
});

// Tipos
export type RecebimentoFormData = z.infer<typeof recebimentoSchema>;
export type PagarRecebimentoFormData = z.infer<typeof pagarRecebimentoSchema>;
export type GerarRecebimentosFormData = z.infer<typeof gerarRecebimentosSchema>;
export type UpdateRecebimentoFormData = z.infer<typeof updateRecebimentoSchema>;