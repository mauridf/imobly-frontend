import { z } from 'zod';

// Schema para formulário (aceita string no valor)
export const criarReajusteFormSchema = z.object({
  contratoId: z.string().min(1, 'Contrato é obrigatório'),
  valorNovo: z.union([
    z.number().min(0.01, 'Valor deve ser maior que zero'),
    z.string().min(1, 'Valor é obrigatório')
      .refine(val => !isNaN(parseFloat(val)) && isFinite(Number(val)), {
        message: 'Valor deve ser um número válido'
      })
  ]),
  indiceUtilizado: z.string().min(1, 'Índice é obrigatório'),
});

export const atualizarReajusteFormSchema = z.object({
  contratoId: z.string().min(1, 'Contrato é obrigatório'),
  valorNovo: z.union([
    z.number().min(0.01, 'Valor deve ser maior que zero'),
    z.string().min(1, 'Valor é obrigatório')
      .refine(val => !isNaN(parseFloat(val)) && isFinite(Number(val)), {
        message: 'Valor deve ser um número válido'
      })
  ]),
  indiceUtilizado: z.string().min(1, 'Índice é obrigatório'),
});

// Tipos para formulário
export type CriarReajusteFormData = z.infer<typeof criarReajusteFormSchema>;
export type AtualizarReajusteFormData = z.infer<typeof atualizarReajusteFormSchema>;