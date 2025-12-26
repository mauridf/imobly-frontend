import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';
import { registerSchema, RegisterFormData } from '@/utils/validationSchemas';
import { extractErrorMessage } from '@/utils/errorHandler';

function RegisterForm() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      senha: '',
      confirmarSenha: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      setSuccess(true);
      setError('');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setError('');
    registerMutation.mutate(data);
  };

  if (success) {
    return (
      <Alert severity="success" sx={{ mt: 3 }}>
        Cadastro realizado com sucesso! Redirecionando para o login...
      </Alert>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ mt: 3, width: '100%' }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        {...register('nome')}
        label="Nome completo"
        fullWidth
        margin="normal"
        error={!!errors.nome}
        helperText={errors.nome?.message}
        disabled={registerMutation.isPending}
      />

      <TextField
        {...register('email')}
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        error={!!errors.email}
        helperText={errors.email?.message}
        disabled={registerMutation.isPending}
      />

      <TextField
        {...register('telefone')}
        label="Telefone"
        fullWidth
        margin="normal"
        error={!!errors.telefone}
        helperText={errors.telefone?.message}
        placeholder="(11) 99999-9999"
        disabled={registerMutation.isPending}
      />

      <TextField
        {...register('senha')}
        label="Senha"
        type="password"
        fullWidth
        margin="normal"
        error={!!errors.senha}
        helperText={errors.senha?.message}
        disabled={registerMutation.isPending}
      />

      <TextField
        {...register('confirmarSenha')}
        label="Confirmar Senha"
        type="password"
        fullWidth
        margin="normal"
        error={!!errors.confirmarSenha}
        helperText={errors.confirmarSenha?.message}
        disabled={registerMutation.isPending}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={registerMutation.isPending}
        startIcon={
          registerMutation.isPending ? (
            <CircularProgress size={20} />
          ) : (
            <PersonAddIcon />
          )
        }
      >
        {registerMutation.isPending ? 'Cadastrando...' : 'Cadastrar'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Link component={RouterLink} to="/login" variant="body2">
          Já tem uma conta? Faça login
        </Link>
      </Box>
    </Box>
  );
}

export default RegisterForm;