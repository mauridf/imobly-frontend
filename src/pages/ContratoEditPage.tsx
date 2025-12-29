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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contratoApi, contratoQueries } from '@/api/contratoApi';
import { updateContratoSchema, UpdateContratoFormData } from '@/utils/contratoSchemas';
import { extractErrorMessage } from '@/utils/errorHandler';

const statusOptions = [
  { value: 'Ativo', label: 'Ativo' },
  { value: 'Encerrado', label: 'Encerrado' },
  { value: 'Suspenso', label: 'Suspenso' },
];

function ContratoEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  // Buscar contrato para edição
  const { data: contrato, isLoading: isLoadingContrato } = useQuery({
    ...contratoQueries.detail(id!),
    enabled: !!id,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateContratoFormData>({
    resolver: zodResolver(updateContratoSchema),
    defaultValues: {
      dataFim: '',
      valorAluguel: 0,
      valorSeguro: 0,
      diaVencimento: 10,
      status: 'Ativo',
    },
  });

  // Mutation para editar contrato
  const mutation = useMutation({
    mutationFn: (data: UpdateContratoFormData) => {
      // Formatar data para o padrão ISO
      const formattedData = {
        ...data,
        dataFim: new Date(data.dataFim).toISOString(),
      };
      return contratoApi.update(id!, formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      setSuccess(true);
      setError('');
      setTimeout(() => {
        navigate('/contratos');
      }, 2000);
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
      setSuccess(false);
    },
  });

  // Preencher form com dados do contrato
  useEffect(() => {
    if (contrato) {
      // O status já deve vir correto do backend
      reset({
        dataFim: contrato.dataFim.split('T')[0], // Formato YYYY-MM-DD
        valorAluguel: contrato.valorAluguel,
        valorSeguro: contrato.valorSeguro,
        diaVencimento: contrato.diaVencimento,
        status: contrato.status,
      });
    }
  }, [contrato, reset]);

  const onSubmit = (data: UpdateContratoFormData) => {
    setError('');
    mutation.mutate(data);
  };

  const handleBack = () => {
    navigate('/contratos');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoadingContrato) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!contrato) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Contrato não encontrado.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Voltar para Contratos
        </Button>
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
          Editar Contrato
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Contrato atualizado com sucesso! Redirecionando...
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Dados do Contrato
        </Typography>

        {/* Informações não editáveis */}
        <Box mb={3}>
          <Typography variant="subtitle2" color="text.secondary">
            Imóvel
          </Typography>
          <Typography>{contrato.imovelTitulo}</Typography>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
            Locatário
          </Typography>
          <Typography>{contrato.locatarioNome}</Typography>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
            Data Início
          </Typography>
          <Typography>{formatDate(contrato.dataInicio)}</Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Imóvel, Locatário e Data Início não podem ser alterados.</strong>
            Para alterar estes dados, é necessário criar um novo contrato.
          </Typography>
        </Alert>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={3}>
            <Box flex={1}>
              <Controller
                name="dataFim"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Data Fim *"
                    type="date"
                    fullWidth
                    margin="normal"
                    error={!!errors.dataFim}
                    helperText={errors.dataFim?.message}
                    disabled={mutation.isPending}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: contrato.dataInicio.split('T')[0] }}
                  />
                )}
              />
            </Box>

            <Box flex={1}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="status-label">Status *</InputLabel>
                    <Select
                      {...field}
                      labelId="status-label"
                      label="Status *"
                      error={!!errors.status}
                      disabled={mutation.isPending}
                    >
                      {statusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.status && (
                      <Typography color="error" variant="caption">
                        {errors.status.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Box>
          </Box>

          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={3}>
            <Box flex={1}>
              <Controller
                name="valorAluguel"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Valor Aluguel *"
                    type="number"
                    fullWidth
                    margin="normal"
                    error={!!errors.valorAluguel}
                    helperText={errors.valorAluguel?.message}
                    disabled={mutation.isPending}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                    }}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </Box>

            <Box flex={1}>
              <Controller
                name="valorSeguro"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Valor Seguro"
                    type="number"
                    fullWidth
                    margin="normal"
                    error={!!errors.valorSeguro}
                    helperText={errors.valorSeguro?.message}
                    disabled={mutation.isPending}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                    }}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </Box>

            <Box flex={1}>
              <Controller
                name="diaVencimento"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Dia Vencimento *"
                    type="number"
                    fullWidth
                    margin="normal"
                    error={!!errors.diaVencimento}
                    helperText={errors.diaVencimento?.message}
                    disabled={mutation.isPending}
                    inputProps={{ min: 1, max: 31 }}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </Box>
          </Box>

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

export default ContratoEditPage;