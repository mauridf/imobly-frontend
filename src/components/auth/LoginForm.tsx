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
import { Login as LoginIcon } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, LoginFormData } from '@/utils/validationSchemas';
import { extractErrorMessage } from '@/utils/errorHandler';

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.token, data.usuario);
      navigate('/dashboard');
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setError('');
    loginMutation.mutate(data);
  };

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
        {...register('email')}
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        error={!!errors.email}
        helperText={errors.email?.message}
        disabled={loginMutation.isPending}
      />

      <TextField
        {...register('senha')}
        label="Senha"
        type="password"
        fullWidth
        margin="normal"
        error={!!errors.senha}
        helperText={errors.senha?.message}
        disabled={loginMutation.isPending}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loginMutation.isPending}
        startIcon={
          loginMutation.isPending ? (
            <CircularProgress size={20} />
          ) : (
            <LoginIcon />
          )
        }
      >
        {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Link component={RouterLink} to="/register" variant="body2">
          Não tem uma conta? Registre-se
        </Link>
      </Box>
    </Box>
  );
}

export default LoginForm;