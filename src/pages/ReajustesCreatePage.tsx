import { useState, useLayoutEffect } from 'react';
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
  Card,
  CardContent,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reajusteApi } from '@/api/reajusteApi';
import { criarReajusteFormSchema, CriarReajusteFormData } from '@/utils/reajusteSchemas';
import { useContratosOptions, ContratoOption } from '@/hooks/useContratosOptions';
import { extractErrorMessage } from '@/utils/errorHandler';
import { INDICES_REAJUSTE } from '@/types/reajustes';
import { formatCurrency } from '@/utils/formatters';

// Tipo para o formulário que aceita string no valor
type CriarReajusteFormInput = Omit<CriarReajusteFormData, 'valorNovo'> & {
  valorNovo: number | string;
};

// Interface para a resposta da sugestão
interface SugestaoReajuste {
  valorAtual: number;
  novoValor: number;
  percentualSugerido: number;
  percentualAumento: number;
  aumentoAbsoluto: number;
  indice: string;
  dataSugestao: string;
  observacao: string;
}

function ReajustesCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [contratoSelecionado, setContratoSelecionado] = useState<ContratoOption | null>(null);
  const [valorCalculado, setValorCalculado] = useState<number | null>(null);
  const [percentualCalculo, setPercentualCalculo] = useState<number>(0);
  const [calculando, setCalculando] = useState(false);

  // Buscar opções de contratos
  const { options: contratosOptions, isLoading: isLoadingContratos } = useContratosOptions();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CriarReajusteFormInput>({
    resolver: zodResolver(criarReajusteFormSchema),
    defaultValues: {
      contratoId: '',
      valorNovo: 0,
      indiceUtilizado: 'IPCA',
    },
  });

  // Usar useWatch para observar os valores
  const contratoId = useWatch({ control, name: 'contratoId' });
  const valorNovo = useWatch({ control, name: 'valorNovo' });
  const indiceUtilizado = useWatch({ control, name: 'indiceUtilizado' });

  // Usar useLayoutEffect para atualizações síncronas
  useLayoutEffect(() => {
    if (contratoId) {
      const contrato = contratosOptions.find(c => c.value === contratoId);
      // Usar setTimeout para evitar atualização síncrona
      const timer = setTimeout(() => {
        setContratoSelecionado(contrato || null);
        setPercentualCalculo(0);
        setValorCalculado(null);
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [contratoId, contratosOptions, setValue]);

  // Função para converter dados do formulário para API
  const convertFormDataToApiData = (data: CriarReajusteFormInput) => {
    return {
      ...data,
      valorNovo: typeof data.valorNovo === 'string' ? parseFloat(data.valorNovo) : data.valorNovo,
    };
  };

  // Mutation para criar reajuste
  const mutation = useMutation({
    mutationFn: (data: CriarReajusteFormInput) => {
      const apiData = convertFormDataToApiData(data);
      return reajusteApi.create(apiData);
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

  const onSubmit = (data: CriarReajusteFormInput) => {
    setError('');
    mutation.mutate(data);
  };

  const handleBack = () => {
    navigate('/reajustes');
  };

  const handleCalcularReajuste = async () => {
    if (!contratoSelecionado) {
      setError('Selecione um contrato para calcular o reajuste');
      return;
    }

    try {
      setCalculando(true);
      setError('');
      
      // Chama a API para obter sugestão
      const response = await fetch(
        `http://localhost:5173/api/Reajustes/sugerir/${contratoSelecionado.value}?indice=${indiceUtilizado}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao calcular reajuste');
      }

      const sugestao: SugestaoReajuste = await response.json();
      
      // Usar os valores da sugestão
      setPercentualCalculo(sugestao.percentualSugerido);
      setValorCalculado(sugestao.novoValor);
      
      // Preencher o campo com o novo valor sugerido
      setValue('valorNovo', parseFloat(sugestao.novoValor.toFixed(2)));
      
    } catch {
      setError('Não foi possível calcular o reajuste automático');
    } finally {
      setCalculando(false);
    }
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
          Novo Reajuste de Contrato
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Reajuste cadastrado com sucesso! Redirecionando...
        </Alert>
      )}

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
        {/* Informações do contrato selecionado */}
        <Box flex={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Dados do Reajuste
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
                    Selecione o contrato que será reajustado
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
                      Informações do Contrato Selecionado
                    </Typography>
                    <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Imóvel
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {contratoSelecionado.imovelTitulo}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Locatário
                        </Typography>
                        <Typography variant="body1">
                          {contratoSelecionado.locatarioNome}
                        </Typography>
                      </Box>
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
                          Vencimento
                        </Typography>
                        <Typography variant="body1">
                          Dia {contratoSelecionado.diaVencimento}
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
                        disabled={mutation.isPending || calculando}
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
                    Selecione o índice utilizado para o reajuste
                  </FormHelperText>
                  {errors.indiceUtilizado && (
                    <Typography color="error" variant="caption">
                      {errors.indiceUtilizado.message}
                    </Typography>
                  )}
                </FormControl>
              </Box>

              {contratoSelecionado && (
                <Button
                  variant="outlined"
                  startIcon={<CalculateIcon />}
                  onClick={handleCalcularReajuste}
                  disabled={mutation.isPending || calculando || !contratoSelecionado}
                  sx={{ mb: 3 }}
                  fullWidth
                >
                  {calculando ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Calculando...
                    </>
                  ) : (
                    `Calcular Reajuste Automático (${indiceUtilizado})`
                  )}
                </Button>
              )}

              {valorCalculado && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Sugestão de reajuste:</strong> {percentualCalculo.toFixed(2)}%<br />
                    <strong>Novo valor sugerido:</strong> {formatCurrency(valorCalculado)}<br />
                    <strong>Valor atual:</strong> {formatCurrency(contratoSelecionado?.valorAluguel || 0)}<br />
                    <strong>Aumento absoluto:</strong> {formatCurrency(valorCalculado - (contratoSelecionado?.valorAluguel || 0))}
                  </Typography>
                </Alert>
              )}

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
                    <strong>Variação:</strong> {percentualAtual > 0 ? '+' : ''}{percentualAtual}%<br />
                    <strong>Valor anterior:</strong> {formatCurrency(contratoSelecionado.valorAluguel)}<br />
                    <strong>Novo valor:</strong> {formatCurrency(
                      typeof valorNovo === 'string' ? parseFloat(valorNovo) : valorNovo
                    )}<br />
                    <strong>Diferença:</strong> {formatCurrency(
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
                  {mutation.isPending ? 'Cadastrando...' : 'Cadastrar Reajuste'}
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
              Como funciona?
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>1. Selecione o contrato</strong><br />
              Escolha o contrato de locação que será reajustado.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>2. Escolha o índice</strong><br />
              Selecione o índice oficial utilizado para o reajuste (IPCA, IGP-M, etc.).
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>3. Calcule automaticamente (opcional)</strong><br />
              Use o botão para calcular o reajuste baseado no índice selecionado.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>4. Informe o novo valor</strong><br />
              Digite o novo valor do aluguel após o reajuste.
            </Typography>
            <Typography variant="body2">
              <strong>5. Salve o reajuste</strong><br />
              O histórico será registrado para consultas futuras.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default ReajustesCreatePage;