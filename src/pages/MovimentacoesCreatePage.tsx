import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FormHelperText,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { movimentacaoApi } from '@/api/movimentacaoApi';
import { useImoveisOptions } from '@/hooks/useImoveisOptions';
import { extractErrorMessage } from '@/utils/errorHandler';
import { z } from 'zod';

// Criar um schema específico para o formulário que aceita string no valor
const movimentacaoFormSchema = z.object({
  imovelId: z.string().optional(),
  tipo: z.enum(['Despesa', 'Receita']),
  categoria: z.enum(['Manutencao', 'IPTU', 'Seguro', 'Outros']),
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
});

type MovimentacaoFormInput = z.infer<typeof movimentacaoFormSchema>;

// Função para converter os dados do formulário para o formato da API
const convertFormDataToApiData = (formData: MovimentacaoFormInput) => {
  return {
    ...formData,
    valor: typeof formData.valor === 'string' ? parseFloat(formData.valor) : formData.valor,
    data: new Date(formData.data + 'T12:00:00Z').toISOString(),
  };
};

function MovimentacoesCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  // Usar o hook para imóveis
  const { options: imoveisOptions, isLoading: isLoadingImoveis } = useImoveisOptions();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MovimentacaoFormInput>({
    resolver: zodResolver(movimentacaoFormSchema),
    defaultValues: {
      imovelId: '',
      tipo: 'Despesa',
      categoria: 'Manutencao',
      descricao: '',
      valor: 0,
      data: new Date().toISOString().split('T')[0],
    },
  });

  // Usar useWatch para observar o valor do tipo
  const tipoValue = useWatch({
    control,
    name: 'tipo',
    defaultValue: 'Despesa',
  });

  // Mutation para criar movimentação
  const mutation = useMutation({
    mutationFn: (data: MovimentacaoFormInput) => {
      const apiData = convertFormDataToApiData(data);
      return movimentacaoApi.create(apiData);
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

  const onSubmit = (data: MovimentacaoFormInput) => {
    setError('');
    mutation.mutate(data);
  };

  const handleBack = () => {
    navigate('/movimentacoes');
  };

  // Opções para selects
  const tipoOptions = [
    { value: 'Despesa', label: 'Despesa' },
    { value: 'Receita', label: 'Receita' },
  ];

  const categoriaOptions = [
    { value: 'Manutencao', label: 'Manutenção' },
    { value: 'IPTU', label: 'IPTU' },
    { value: 'Seguro', label: 'Seguro' },
    { value: 'Outros', label: 'Outros' },
  ];

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
          Nova Movimentação Financeira
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Movimentação cadastrada com sucesso! Redirecionando...
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Dados da Movimentação
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={3}>
            <Box flex={1}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="imovel-label">Imóvel (opcional)</InputLabel>
                <Controller
                  name="imovelId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="imovel-label"
                      label="Imóvel (opcional)"
                      error={!!errors.imovelId}
                      disabled={mutation.isPending || isLoadingImoveis}
                    >
                      <MenuItem value="">Não vinculado</MenuItem>
                      {imoveisOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText>Selecione um imóvel para vincular esta movimentação</FormHelperText>
              </FormControl>
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

          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={3}>
            <Box flex={1}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="tipo-label">Tipo *</InputLabel>
                <Controller
                  name="tipo"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="tipo-label"
                      label="Tipo *"
                      error={!!errors.tipo}
                      disabled={mutation.isPending}
                    >
                      {tipoOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.tipo && (
                  <Typography color="error" variant="caption">
                    {errors.tipo.message}
                  </Typography>
                )}
              </FormControl>
            </Box>

            <Box flex={1}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="categoria-label">Categoria *</InputLabel>
                <Controller
                  name="categoria"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="categoria-label"
                      label="Categoria *"
                      error={!!errors.categoria}
                      disabled={mutation.isPending}
                    >
                      {categoriaOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.categoria && (
                  <Typography color="error" variant="caption">
                    {errors.categoria.message}
                  </Typography>
                )}
              </FormControl>
            </Box>
          </Box>

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
                  helperText={errors.descricao?.message || `Descreva esta ${tipoValue.toLowerCase()}`}
                  disabled={mutation.isPending}
                  multiline
                  rows={3}
                />
              )}
            />
          </Box>

          <Box mb={3}>
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
                  helperText={errors.valor?.message || 'Digite o valor da movimentação'}
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

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Atenção:</strong> Esta movimentação será cadastrada como{' '}
              <strong>{tipoValue === 'Despesa' ? 'despesa pendente' : 'receita pendente'}</strong>.
              Você poderá registrar o {tipoValue === 'Despesa' ? 'pagamento' : 'recebimento'} posteriormente.
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
              disabled={mutation.isPending || isLoadingImoveis}
              startIcon={
                mutation.isPending ? (
                  <CircularProgress size={20} />
                ) : (
                  <SaveIcon />
                )
              }
            >
              {mutation.isPending ? 'Cadastrando...' : 'Cadastrar Movimentação'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default MovimentacoesCreatePage;