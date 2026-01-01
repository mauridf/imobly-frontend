import { z } from 'zod';

export const criarSeguroSchema = z.object({
  imovelId: z.string().min(1, 'Imóvel é obrigatório'),
  descricao: z
    .string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(150, 'Descrição deve ter no máximo 150 caracteres'),
  valor: z.number().min(0.01, 'Valor deve ser maior que zero'),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().min(1, 'Data de fim é obrigatória'),
  seguradora: z
    .string()
    .min(3, 'Seguradora deve ter pelo menos 3 caracteres')
    .max(150, 'Seguradora deve ter no máximo 150 caracteres'),
  apolice: z
    .string()
    .min(3, 'Apólice deve ter pelo menos 3 caracteres')
    .max(100, 'Apólice deve ter no máximo 100 caracteres'),
}).refine(data => {
  const inicio = new Date(data.dataInicio);
  const fim = new Date(data.dataFim);
  return fim > inicio;
}, {
  message: 'Data de fim deve ser maior que data de início',
  path: ['dataFim'],
});

export const atualizarSeguroSchema = z.object({
  descricao: z
    .string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(150, 'Descrição deve ter no máximo 150 caracteres'),
  valor: z.number().min(0.01, 'Valor deve ser maior que zero'),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().min(1, 'Data de fim é obrigatória'),
  seguradora: z
    .string()
    .min(3, 'Seguradora deve ter pelo menos 3 caracteres')
    .max(150, 'Seguradora deve ter no máximo 150 caracteres'),
  apolice: z
    .string()
    .min(3, 'Apólice deve ter pelo menos 3 caracteres')
    .max(100, 'Apólice deve ter no máximo 100 caracteres'),
}).refine(data => {
  const inicio = new Date(data.dataInicio);
  const fim = new Date(data.dataFim);
  return fim > inicio;
}, {
  message: 'Data de fim deve ser maior que data de início',
  path: ['dataFim'],
});

export type CriarSeguroFormData = z.infer<typeof criarSeguroSchema>;
export type AtualizarSeguroFormData = z.infer<typeof atualizarSeguroSchema>;