import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  senha: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const registerSchema = z
  .object({
    nome: z
      .string()
      .min(1, 'Nome é obrigatório')
      .min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z
      .string()
      .min(1, 'Email é obrigatório')
      .email('Email inválido'),
    telefone: z
      .string()
      .min(1, 'Telefone é obrigatório')
      .min(10, 'Telefone inválido'),
    senha: z
      .string()
      .min(1, 'Senha é obrigatória')
      .min(6, 'Senha deve ter no mínimo 6 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
      ),
    confirmarSenha: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha'],
  });

export const changePasswordSchema = z
  .object({
    senhaAtual: z.string().min(1, 'Senha atual é obrigatória'),
    novaSenha: z
      .string()
      .min(1, 'Nova senha é obrigatória')
      .min(6, 'Nova senha deve ter no mínimo 6 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Nova senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
      ),
    confirmarNovaSenha: z
      .string()
      .min(1, 'Confirmação da nova senha é obrigatória'),
  })
  .refine((data) => data.novaSenha === data.confirmarNovaSenha, {
    message: 'As novas senhas não coincidem',
    path: ['confirmarNovaSenha'],
  });

export const updateUserSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  telefone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .min(10, 'Telefone inválido'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;