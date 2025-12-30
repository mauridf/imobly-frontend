import { useState, useEffect } from 'react';
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
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PlaylistAdd as GerarIcon,
} from '@mui/icons-material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recebimentoApi } from '@/api/recebimentoApi';
import { gerarRecebimentosSchema, GerarRecebimentosFormData } from '@/utils/recebimentoSchemas';
import { useContratosOptions, ContratoOption } from '@/hooks/useContratosOptions';
import { extractErrorMessage } from '@/utils/errorHandler';
import { Recebimento } from '@/types/recebimento';
import { formatarParaUTC } from '@/utils/dateUtils';

function RecebimentoGerarPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [resultados, setResultados] = useState<Recebimento[]>([]);
  const [contratoInfo, setContratoInfo] = useState<ContratoOption | null>(null);

  // Usar o hook para contratos
  const { options: contratosOptions, isLoading: isLoadingContratos } = useContratosOptions();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<GerarRecebimentosFormData>({
    resolver: zodResolver(gerarRecebimentosSchema),
    defaultValues: {
      contratoId: '',
      dataInicio: '',
      dataFim: '',
      valorAluguel: 0,
      diaVencimento: 10,
    },
  });

  // Observar contrato selecionado
  const contratoId = useWatch({ control, name: 'contratoId' });
  const dataInicio = useWatch({ control, name: 'dataInicio' });
  const dataFim = useWatch({ control, name: 'dataFim' });
  const valorAluguel = useWatch({ control, name: 'valorAluguel' }); // Adicionar para usar no JSX

  // Quando contrato for selecionado, preencher valores automaticamente
  useEffect(() => {
    if (contratoId && !dataInicio && !dataFim) {
      const contratoSelecionado = contratosOptions.find((opt: ContratoOption) => opt.value === contratoId);
      if (contratoSelecionado) {
        // Usar um timeout para evitar chamar setState diretamente no efeito
        const timeoutId = setTimeout(() => {
          setContratoInfo(contratoSelecionado);
          setValue('valorAluguel', contratoSelecionado.valorAluguel);
          setValue('diaVencimento', contratoSelecionado.diaVencimento);
          
          // Sugerir datas (início primeiro dia do próximo mês, fim em 1 ano)
          const hoje = new Date();
          const inicio = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
          const fim = new Date(inicio.getFullYear() + 1, inicio.getMonth(), 0);
          
          setValue('dataInicio', inicio.toISOString().split('T')[0]);
          setValue('dataFim', fim.toISOString().split('T')[0]);
        }, 0);
        
        // Cleanup
        return () => clearTimeout(timeoutId);
      }
    }
  }, [contratoId, contratosOptions, setValue, dataInicio, dataFim]);

  // Calcular quantidade de meses entre as datas
  const calcularMeses = () => {
    if (!dataInicio || !dataFim) return 0;
    
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    if (fim <= inicio) return 0;
    
    const diffAnos = fim.getFullYear() - inicio.getFullYear();
    const diffMeses = fim.getMonth() - inicio.getMonth();
    
    return (diffAnos * 12) + diffMeses;
  };

  const meses = calcularMeses();

  // Mutation para gerar recebimentos em lote
  const mutation = useMutation({
    mutationFn: (data: GerarRecebimentosFormData) => {
      // Usar a função do utilitário
      const formattedData = {
        ...data,
        dataInicio: formatarParaUTC(data.dataInicio),
        dataFim: formatarParaUTC(data.dataFim),
      };
      
      console.log('Payload gerar:', formattedData); // Debug
      
      return recebimentoApi.gerar(formattedData);
    },
    onSuccess: (resultado) => {
      queryClient.invalidateQueries({ queryKey: ['recebimentos'] });
      setResultados(resultado);
      setSuccess(true);
      setError('');
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
      setSuccess(false);
      setResultados([]);
    },
  });

  const onSubmit = (data: GerarRecebimentosFormData) => {
    setError('');
    setResultados([]);
    mutation.mutate(data);
  };

  const handleBack = () => {
    navigate('/recebimentos');
  };

  const handleNovo = () => {
    reset();
    setResultados([]);
    setSuccess(false);
    setContratoInfo(null);
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

  const hoje = new Date().toISOString().split('T')[0];

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
          Gerar Recebimentos em Lote
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && resultados.length > 0 && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {resultados.length} recebimentos gerados com sucesso!
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Configurar Geração
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={3}>
            <Box flex={1}>
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
                      {isLoadingContratos ? (
                        <MenuItem disabled>Carregando contratos...</MenuItem>
                      ) : contratosOptions.length === 0 ? (
                        <MenuItem disabled>Nenhum contrato disponível</MenuItem>
                      ) : (
                        contratosOptions.map((option: ContratoOption) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  )}
                />
                {errors.contratoId && (
                  <Typography color="error" variant="caption">
                    {errors.contratoId.message}
                  </Typography>
                )}
              </FormControl>
            </Box>
          </Box>

          {contratoInfo && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Contrato selecionado:</strong> {contratoInfo.label}<br />
                <strong>Valor do aluguel:</strong> {formatCurrency(contratoInfo.valorAluguel)}<br />
                <strong>Dia de vencimento:</strong> {contratoInfo.diaVencimento}
              </Typography>
            </Alert>
          )}

          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={3}>
            <Box flex={1}>
              <Controller
                name="dataInicio"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Data Início *"
                    type="date"
                    fullWidth
                    margin="normal"
                    error={!!errors.dataInicio}
                    helperText={errors.dataInicio?.message}
                    disabled={mutation.isPending}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: hoje }}
                  />
                )}
              />
            </Box>

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
                    helperText={errors.dataFim?.message || (meses > 0 ? `${meses} meses` : '')}
                    disabled={mutation.isPending}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: dataInicio || hoje }}
                  />
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

          {meses > 0 && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Serão gerados <strong>{meses} recebimentos</strong> (um para cada mês)<br />
                Valor total: <strong>{formatCurrency(meses * (valorAluguel || 0))}</strong>
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
              color="primary"
              disabled={mutation.isPending || isLoadingContratos || meses === 0}
              startIcon={
                mutation.isPending ? (
                  <CircularProgress size={20} />
                ) : (
                  <GerarIcon />
                )
              }
            >
              {mutation.isPending ? 'Gerando...' : 'Gerar Recebimentos'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {resultados.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Recebimentos Gerados ({resultados.length})
          </Typography>
          
          <Box mb={2}>
            {resultados.slice(0, 5).map((recebimento) => (
              <Chip
                key={recebimento.id}
                label={`${formatDate(recebimento.competencia)} - ${formatCurrency(recebimento.valorPrevisto)}`}
                color="success"
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
            {resultados.length > 5 && (
              <Chip
                label={`+${resultados.length - 5} mais...`}
                color="default"
                variant="outlined"
              />
            )}
          </Box>

          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              onClick={handleNovo}
            >
              Gerar Novos
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/recebimentos')}
            >
              Ir para Recebimentos
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default RecebimentoGerarPage;