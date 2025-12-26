import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Person as PersonIcon, Save as SaveIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';
import { useAuth } from '@/hooks/useAuth';
import { updateUserSchema, UpdateUserFormData } from '@/utils/validationSchemas';
import { extractErrorMessage } from '@/utils/errorHandler';

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      nome: user?.nome || '',
      telefone: user?.telefone || '',
    },
  });

  // Query para buscar dados atualizados do usuário
  const { refetch: refetchUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authApi.getCurrentUser(),
    enabled: false, // Não executa automaticamente
  });

  const updateMutation = useMutation({
    mutationFn: authApi.updateUser,
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      setSuccess(true);
      setError('');
      setTimeout(() => setSuccess(false), 3000);
      refetchUser();
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
      setSuccess(false);
    },
  });

  const onSubmit = (data: UpdateUserFormData) => {
    setError('');
    updateMutation.mutate(data);
  };

  // Reset form quando user mudar
  React.useEffect(() => {
    if (user) {
      reset({
        nome: user.nome,
        telefone: user.telefone,
      });
    }
  }, [user, reset]);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Meu Perfil
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'primary.main',
              mr: 3,
            }}
          >
            {user?.nome?.charAt(0).toUpperCase() || <PersonIcon />}
          </Avatar>
          <Box>
            <Typography variant="h6">{user?.nome}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cadastrado em: {new Date(user?.criadoEm || '').toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Perfil atualizado com sucesso!
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register('nome')}
            label="Nome completo"
            fullWidth
            margin="normal"
            error={!!errors.nome}
            helperText={errors.nome?.message}
            disabled={updateMutation.isPending}
          />

          <TextField
            {...register('telefone')}
            label="Telefone"
            fullWidth
            margin="normal"
            error={!!errors.telefone}
            helperText={errors.telefone?.message}
            placeholder="(11) 99999-9999"
            disabled={updateMutation.isPending}
          />

          <TextField
            label="Email"
            value={user?.email || ''}
            fullWidth
            margin="normal"
            disabled
            helperText="Email não pode ser alterado"
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={updateMutation.isPending}
              startIcon={
                updateMutation.isPending ? (
                  <CircularProgress size={20} />
                ) : (
                  <SaveIcon />
                )
              }
            >
              {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default ProfilePage;