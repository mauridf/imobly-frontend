import { z } from 'zod';

export const criarManutencaoSchema = z.object({
  imovelId: z.string().min(1, 'Imóvel é obrigatório'),
  descricao: z.string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  data: z.string().min(1, 'Data é obrigatória'),
  valor: z.coerce
    .number()
    .min(0.01, 'Valor deve ser maior que zero'),
  responsavel: z.string()
    .min(3, 'Responsável deve ter pelo menos 3 caracteres')
    .max(150, 'Responsável deve ter no máximo 150 caracteres'),
});

export const atualizarManutencaoSchema = z.object({
  descricao: z.string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  data: z.string().min(1, 'Data é obrigatória'),
  valor: z.coerce
    .number()
    .min(0.01, 'Valor deve ser maior que zero'),
  responsavel: z.string()
    .min(3, 'Responsável deve ter pelo menos 3 caracteres')
    .max(150, 'Responsável deve ter no máximo 150 caracteres'),
  status: z.enum(['Pendente', 'Feito']),
});

export type CriarManutencaoFormData = z.infer<typeof criarManutencaoSchema>;
export type AtualizarManutencaoFormData = z.infer<typeof atualizarManutencaoSchema>;