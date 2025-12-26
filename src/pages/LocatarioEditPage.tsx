import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { locatarioApi, locatarioQueries } from '@/api/locatarioApi';
import { updateLocatarioSchema, UpdateLocatarioFormData } from '@/utils/locatarioSchemas';
import { extractErrorMessage } from '@/utils/errorHandler';

function LocatarioEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  // Buscar locatário para edição
  const { data: locatario, isLoading: isLoadingLocatario } = useQuery({
    ...locatarioQueries.detail(id!),
    enabled: !!id,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateLocatarioFormData>({
    resolver: zodResolver(updateLocatarioSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      rg: '',
      dataNascimento: '',
    },
  });

  // Mutation para editar locatário
  const mutation = useMutation({
    mutationFn: (data: UpdateLocatarioFormData) => {
      // Formatar data para o padrão ISO
      const formattedData = {
        ...data,
        dataNascimento: new Date(data.dataNascimento).toISOString(),
      };
      return locatarioApi.update(id!, formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locatarios'] });
      setSuccess(true);
      setError('');
      setTimeout(() => {
        navigate('/locatarios');
      }, 2000);
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
      setSuccess(false);
    },
  });

  // Preencher form com dados do locatário
  useEffect(() => {
    if (locatario) {
      reset({
        nome: locatario.nome,
        email: locatario.email,
        telefone: locatario.telefone,
        rg: locatario.rg,
        dataNascimento: locatario.dataNascimento.split('T')[0], // Formato YYYY-MM-DD
      });
    }
  }, [locatario, reset]);

  const onSubmit = (data: UpdateLocatarioFormData) => {
    setError('');
    mutation.mutate(data);
  };

  const handleBack = () => {
    navigate('/locatarios');
  };

  if (isLoadingLocatario) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4">
          Editar Locatário
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Locatário atualizado com sucesso! Redirecionando...
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Informações Pessoais
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="nome"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nome Completo"
                fullWidth
                margin="normal"
                error={!!errors.nome}
                helperText={errors.nome?.message}
                disabled={mutation.isPending}
              />
            )}
          />

          <Box display="flex" gap={2}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  fullWidth
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={mutation.isPending}
                />
              )}
            />

            <Controller
              name="telefone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Telefone"
                  fullWidth
                  margin="normal"
                  error={!!errors.telefone}
                  helperText={errors.telefone?.message}
                  disabled={mutation.isPending}
                  placeholder="(11) 99999-9999"
                />
              )}
            />
          </Box>

          <Box display="flex" gap={2}>
            <Controller
              name="rg"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="RG"
                  fullWidth
                  margin="normal"
                  error={!!errors.rg}
                  helperText={errors.rg?.message}
                  disabled={mutation.isPending}
                />
              )}
            />

            <Controller
              name="dataNascimento"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Data de Nascimento"
                  type="date"
                  fullWidth
                  margin="normal"
                  error={!!errors.dataNascimento}
                  helperText={errors.dataNascimento?.message}
                  disabled={mutation.isPending}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Box>

          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body2">
              <strong>CPF não pode ser alterado.</strong> Para alterar o CPF, 
              é necessário excluir e criar um novo cadastro.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Campos de endereço não podem ser editados</strong> após o cadastro.
              Para alterar o endereço, entre em contato com o administrador.
            </Typography>
          </Alert>

          <Box display="flex" gap={2} mt={3}>
            <Button
              onClick={handleBack}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={mutation.isPending}
              startIcon={
                mutation.isPending ? (
                  <CircularProgress size={20} />
                ) : (
                  <SaveIcon />
                )
              }
            >
              {mutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default LocatarioEditPage;