import { z } from 'zod';

// Schema que retorna valor como number
export const movimentacaoSchema = z.object({
  imovelId: z.string().optional(),
  tipo: z.enum(['Despesa', 'Receita']),
  categoria: z.enum(['Manutencao', 'IPTU', 'Seguro', 'Outros']),
  descricao: z
    .string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(200, 'Descrição deve ter no máximo 200 caracteres'),
  valor: z.coerce
    .number()
    .min(0.01, 'Valor deve ser maior que zero'),
  data: z.string().min(1, 'Data é obrigatória'),
});

export const updateMovimentacaoSchema = z.object({
  descricao: z
    .string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(200, 'Descrição deve ter no máximo 200 caracteres'),
  valor: z.coerce
    .number()
    .min(0.01, 'Valor deve ser maior que zero'),
  data: z.string().min(1, 'Data é obrigatória'),
  status: z.enum(['Pendente', 'Pago', 'Recebido', 'Cancelado']),
});

// Tipos inferidos do schema
export type MovimentacaoFormData = z.infer<typeof movimentacaoSchema>;
export type UpdateMovimentacaoFormData = z.infer<typeof updateMovimentacaoSchema>;