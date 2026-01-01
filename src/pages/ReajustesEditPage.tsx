import { useState, useLayoutEffect } from 'react';
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
  FormHelperText,
  Card,
  CardContent,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reajusteApi } from '@/api/reajusteApi';
import { atualizarReajusteFormSchema, AtualizarReajusteFormData } from '@/utils/reajusteSchemas';
import { useContratosOptions, ContratoOption } from '@/hooks/useContratosOptions';
import { extractErrorMessage } from '@/utils/errorHandler';
import { INDICES_REAJUSTE } from '@/types/reajustes';
import { formatCurrency } from '@/utils/formatters';
import { formatDate } from '@/utils/formatters';

// Tipo para o formulário que aceita string no valor
type AtualizarReajusteFormInput = Omit<AtualizarReajusteFormData, 'valorNovo'> & {
  valorNovo: number | string;
};

function ReajustesEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [contratoSelecionado, setContratoSelecionado] = useState<ContratoOption | null>(null);

  // Buscar opções de contratos
  const { options: contratosOptions, isLoading: isLoadingContratos } = useContratosOptions();

  // Buscar reajuste para edição
  const { data: reajuste, isLoading: isLoadingReajuste } = useQuery({
    queryKey: ['reajustes', id],
    queryFn: () => reajusteApi.getById(id!),
    enabled: !!id,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AtualizarReajusteFormInput>({
    resolver: zodResolver(atualizarReajusteFormSchema),
    defaultValues: {
      contratoId: '',
      valorNovo: 0,
      indiceUtilizado: 'IPCA',
    },
  });

  // Usar useWatch para observar os valores
  const contratoId = useWatch({ control, name: 'contratoId' });
  const valorNovo = useWatch({ control, name: 'valorNovo' });

  // Usar useLayoutEffect para atualizações síncronas
  useLayoutEffect(() => {
    if (reajuste) {
      reset({
        contratoId: reajuste.contratoId,
        valorNovo: reajuste.valorNovo,
        indiceUtilizado: reajuste.indiceUtilizado,
      });
      
      // Encontrar contrato selecionado (atualizar de forma assíncrona)
      const contrato = contratosOptions.find(c => c.value === reajuste.contratoId);
      const timer = setTimeout(() => {
        setContratoSelecionado(contrato || null);
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [reajuste, reset, contratosOptions]);

  // Atualizar contrato selecionado quando mudar
  useLayoutEffect(() => {
    if (contratoId && !reajuste) {
      const contrato = contratosOptions.find(c => c.value === contratoId);
      const timer = setTimeout(() => {
        setContratoSelecionado(contrato || null);
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [contratoId, contratosOptions, reajuste]);

  // Função para converter dados do formulário para API
  const convertFormDataToApiData = (data: AtualizarReajusteFormInput) => {
    return {
      ...data,
      valorNovo: typeof data.valorNovo === 'string' ? parseFloat(data.valorNovo) : data.valorNovo,
    };
  };

  // Mutation para atualizar reajuste
  const mutation = useMutation({
    mutationFn: (data: AtualizarReajusteFormInput) => {
      const apiData = convertFormDataToApiData(data);
      return reajusteApi.update(id!, apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reajustes'] });
      setSuccess(true);
      setError('');
      setTimeout(() => {
        navigate('/reajustes');
      }, 2000);
    },
    onError: (error: Error) => {
      setError(extractErrorMessage(error));
      setSuccess(false);
    },
  });

  const onSubmit = (data: AtualizarReajusteFormInput) => {
    setError('');
    mutation.mutate(data);
  };

  const handleBack = () => {
    navigate('/reajustes');
  };

  const calcularPercentual = () => {
    if (!contratoSelecionado || !valorNovo) return 0;
    
    const valorAnterior = contratoSelecionado.valorAluguel;
    const valorAtual = typeof valorNovo === 'string' ? parseFloat(valorNovo) : valorNovo;
    
    if (valorAtual <= 0) return 0;
    
    const variacao = ((valorAtual - valorAnterior) / valorAnterior) * 100;
    return parseFloat(variacao.toFixed(2));
  };

  const percentualAtual = calcularPercentual();

  if (isLoadingReajuste) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!reajuste) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Reajuste não encontrado.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Voltar para Reajustes
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
          Editar Reajuste
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Reajuste atualizado com sucesso! Redirecionando...
        </Alert>
      )}

      {/* Informações não editáveis */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Informações do Reajuste Original
        </Typography>

        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={2}>
          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Data do Reajuste
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {formatDate(reajuste.dataReajuste)}
            </Typography>
          </Box>
          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Valor Anterior
            </Typography>
            <Typography variant="body1">
              {formatCurrency(reajuste.valorAnterior)}
            </Typography>
          </Box>
          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Cadastrado em
            </Typography>
            <Typography variant="body1">
              {formatDate(reajuste.criadoEm)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
        {/* Formulário de edição */}
        <Box flex={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Editar Dados do Reajuste
            </Typography>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Box mb={3}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="contrato-label">Contrato *</InputLabel>
                  <Controller
                    name="contratoId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="contrato-label"
                        label="Contrato *"
                        error={!!errors.contratoId}
                        disabled={mutation.isPending || isLoadingContratos}
                      >
                        {contratosOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  <FormHelperText>
                    Contrato associado ao reajuste
                  </FormHelperText>
                  {errors.contratoId && (
                    <Typography color="error" variant="caption">
                      {errors.contratoId.message}
                    </Typography>
                  )}
                </FormControl>
              </Box>

              {contratoSelecionado && (
                <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Informações do Contrato
                    </Typography>
                    <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Aluguel Atual
                        </Typography>
                        <Typography variant="body1" fontWeight="medium" color="primary.main">
                          {formatCurrency(contratoSelecionado.valorAluguel)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Imóvel
                        </Typography>
                        <Typography variant="body1">
                          {contratoSelecionado.imovelTitulo}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

              <Box mb={3}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="indice-label">Índice de Reajuste *</InputLabel>
                  <Controller
                    name="indiceUtilizado"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="indice-label"
                        label="Índice de Reajuste *"
                        error={!!errors.indiceUtilizado}
                        disabled={mutation.isPending}
                      >
                        {INDICES_REAJUSTE.map((indice) => (
                          <MenuItem key={indice.value} value={indice.value}>
                            {indice.label}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  <FormHelperText>
                    Índice utilizado para o reajuste
                  </FormHelperText>
                  {errors.indiceUtilizado && (
                    <Typography color="error" variant="caption">
                      {errors.indiceUtilizado.message}
                    </Typography>
                  )}
                </FormControl>
              </Box>

              <Box mb={3}>
                <Controller
                  name="valorNovo"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Novo Valor do Aluguel *"
                      type="number"
                      fullWidth
                      margin="normal"
                      error={!!errors.valorNovo}
                      helperText={errors.valorNovo?.message}
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

              {contratoSelecionado && valorNovo && (
                <Alert 
                  severity={percentualAtual >= 0 ? "info" : "warning"} 
                  sx={{ mb: 3 }}
                  icon={<TrendingUpIcon />}
                >
                  <Typography variant="body2">
                    <strong>Comparação com valor atual do contrato:</strong><br />
                    • Valor atual: {formatCurrency(contratoSelecionado.valorAluguel)}<br />
                    • Novo valor: {formatCurrency(
                      typeof valorNovo === 'string' ? parseFloat(valorNovo) : valorNovo
                    )}<br />
                    • Variação: {percentualAtual > 0 ? '+' : ''}{percentualAtual}%<br />
                    • Diferença: {formatCurrency(
                      (typeof valorNovo === 'string' ? parseFloat(valorNovo) : valorNovo) - 
                      contratoSelecionado.valorAluguel
                    )}
                  </Typography>
                </Alert>
              )}

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
                  {mutation.isPending ? 'Atualizando...' : 'Atualizar Reajuste'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Informações de ajuda */}
        <Box flex={1}>
          <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Sobre os Reajustes
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Índices comuns:</strong><br />
              • IPCA: Índice de Preços ao Consumidor Amplo<br />
              • IGP-M: Índice Geral de Preços do Mercado<br />
              • INCC: Índice Nacional de Custos da Construção<br />
              • IPC: Índice de Preços ao Consumidor
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Recomendações:</strong><br />
              • Mantenha o histórico de reajustes atualizado<br />
              • Utilize índices oficiais reconhecidos<br />
              • Registre a data exata do reajuste
            </Typography>
            <Typography variant="body2">
              <strong>Valor original:</strong> {formatCurrency(reajuste.valorAnterior)}<br />
              <strong>Data original:</strong> {formatDate(reajuste.dataReajuste)}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default ReajustesEditPage;