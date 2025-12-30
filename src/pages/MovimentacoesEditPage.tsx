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
import { movimentacaoApi } from '@/api/movimentacaoApi';
import { UpdateMovimentacaoFormData } from '@/utils/movimentacaoSchemas';
import { extractErrorMessage } from '@/utils/errorHandler';
import { z } from 'zod';

// Criar um schema específico para o formulário que aceita string no valor
const updateMovimentacaoFormSchema = z.object({
  descricao: z
    .string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(200, 'Descrição deve ter no máximo 200 caracteres'),
  valor: z.union([
    z.number().min(0.01, 'Valor deve ser maior que zero'),
    z.string().min(1, 'Valor é obrigatório')
      .refine(val => !isNaN(parseFloat(val)) && isFinite(Number(val)), {
        message: 'Valor deve ser um número válido'
      })
  ]),
  data: z.string().min(1, 'Data é obrigatória'),
  status: z.enum(['Pendente', 'Pago', 'Recebido', 'Cancelado']),
});

type UpdateMovimentacaoFormInput = z.infer<typeof updateMovimentacaoFormSchema>;

// Função para converter os dados do formulário para o formato da API
const convertFormDataToApiData = (formData: UpdateMovimentacaoFormInput): UpdateMovimentacaoFormData => {
  return {
    ...formData,
    valor: typeof formData.valor === 'string' ? parseFloat(formData.valor) : formData.valor,
    data: new Date(formData.data + 'T12:00:00Z').toISOString(),
    status: formData.status,
  };
};

function MovimentacoesEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  // Buscar movimentação para edição
  const { data: movimentacao, isLoading: isLoadingMovimentacao } = useQuery({
    queryKey: ['movimentacoes', id],
    queryFn: () => movimentacaoApi.getById(id!),
    enabled: !!id,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateMovimentacaoFormInput>({
    resolver: zodResolver(updateMovimentacaoFormSchema),
    defaultValues: {
      descricao: '',
      valor: 0,
      data: new Date().toISOString().split('T')[0],
      status: 'Pendente',
    },
  });

  // Preencher form com dados da movimentação
  useEffect(() => {
    if (movimentacao) {
      reset({
        descricao: movimentacao.descricao,
        valor: movimentacao.valor,
        data: movimentacao.data.split('T')[0],
        status: movimentacao.status,
      });
    }
  }, [movimentacao, reset]);

  // Mutation para atualizar movimentação
  const mutation = useMutation({
    mutationFn: (data: UpdateMovimentacaoFormInput) => {
      const apiData = convertFormDataToApiData(data);
      return movimentacaoApi.update(id!, apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
      setSuccess(true);
      setError('');
      setTimeout(() => {
        navigate('/movimentacoes');
      }, 2000);
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
      setSuccess(false);
    },
  });

  const onSubmit = (data: UpdateMovimentacaoFormInput) => {
    setError('');
    mutation.mutate(data);
  };

  const handleBack = () => {
    navigate('/movimentacoes');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Opções para status
  const statusOptions = [
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Pago', label: 'Pago' },
    { value: 'Recebido', label: 'Recebido' },
    { value: 'Cancelado', label: 'Cancelado' },
  ];

  if (isLoadingMovimentacao) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!movimentacao) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Movimentação não encontrada.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Voltar para Movimentações
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
          Editar Movimentação
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Movimentação atualizada com sucesso! Redirecionando...
        </Alert>
      )}

      {/* Informações não editáveis */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Informações da Movimentação
        </Typography>

        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={3}>
          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Tipo
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {movimentacao.tipo}
            </Typography>
          </Box>
          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Categoria
            </Typography>
            <Typography variant="body1">
              {movimentacao.categoria}
            </Typography>
          </Box>
          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Imóvel
            </Typography>
            <Typography variant="body1">
              {movimentacao.imovelTitulo || 'Não vinculado'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Editar Dados
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Box mb={3}>
            <Controller
              name="descricao"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Descrição *"
                  fullWidth
                  margin="normal"
                  error={!!errors.descricao}
                  helperText={errors.descricao?.message}
                  disabled={mutation.isPending}
                  multiline
                  rows={3}
                />
              )}
            />
          </Box>

          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={3}>
            <Box flex={1}>
              <Controller
                name="valor"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Valor *"
                    type="number"
                    fullWidth
                    margin="normal"
                    error={!!errors.valor}
                    helperText={errors.valor?.message}
                    disabled={mutation.isPending}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                    }}
                    onChange={(e) => {
                      const value = e.target.value === '' ? '' : e.target.value;
                      field.onChange(value);
                    }}
                    value={field.value === 0 ? '' : field.value}
                  />
                )}
              />
            </Box>

            <Box flex={1}>
              <Controller
                name="data"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Data *"
                    type="date"
                    fullWidth
                    margin="normal"
                    error={!!errors.data}
                    helperText={errors.data?.message}
                    disabled={mutation.isPending}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Box>
          </Box>

          <Box mb={3}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="status-label">Status *</InputLabel>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
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
                )}
              />
              {errors.status && (
                <Typography color="error" variant="caption">
                  {errors.status.message}
                </Typography>
              )}
            </FormControl>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Informações originais:</strong><br />
              • Valor original: {formatCurrency(movimentacao.valor)}<br />
              • Data original: {formatDate(movimentacao.data)}<br />
              • Cadastrado em: {formatDate(movimentacao.criadoEm)}
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
              {mutation.isPending ? 'Atualizando...' : 'Atualizar Movimentação'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default MovimentacoesEditPage;