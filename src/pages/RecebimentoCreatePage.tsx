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
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recebimentoApi } from '@/api/recebimentoApi';
import { recebimentoSchema, RecebimentoFormData } from '@/utils/recebimentoSchemas';
import { useContratosOptions, ContratoOption } from '@/hooks/useContratosOptions';
import { extractErrorMessage } from '@/utils/errorHandler';

function RecebimentoCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  // Usar o hook corrigido
  const { options: contratosOptions, isLoading: isLoadingContratos } = useContratosOptions();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RecebimentoFormData>({
    resolver: zodResolver(recebimentoSchema),
    defaultValues: {
      contratoId: '',
      competencia: '',
      valorPrevisto: 0,
    },
  });

  // Observar contrato selecionado para preencher valor sugerido
  const contratoId = useWatch({ control, name: 'contratoId' });
  const contratoSelecionado = contratosOptions.find((opt: ContratoOption) => opt.value === contratoId);

  // Preencher valor do aluguel quando contrato for selecionado
  const handleContratoChange = (contratoId: string) => {
    const contrato = contratosOptions.find((opt: ContratoOption) => opt.value === contratoId);
    if (contrato) {
      setValue('valorPrevisto', contrato.valorAluguel);
    }
  };

  // Mutation para criar recebimento
  const mutation = useMutation({
    mutationFn: (data: RecebimentoFormData) => {
      // Formatar competência para o padrão ISO CORRETAMENTE
      const [ano, mes] = data.competencia.split('-');
      
      // Criar data no primeiro dia do mês, às 00:00 UTC
      const competenciaISO = new Date(Date.UTC(
        Number(ano), 
        Number(mes) - 1, // Mês é 0-based
        1, // Primeiro dia do mês
        0, 0, 0, 0
      )).toISOString();
      
      console.log('Competência formatada:', competenciaISO); // Debug
      
      // O endpoint /gerar espera GerarRecebimentosRequest
      // Para criar apenas um, usamos dataInicio = dataFim = competência
      const payload = {
        contratoId: data.contratoId,
        dataInicio: competenciaISO,
        dataFim: competenciaISO,
        valorAluguel: data.valorPrevisto,
        diaVencimento: contratoSelecionado?.diaVencimento || 10,
      };
      
      return recebimentoApi.gerar(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recebimentos'] });
      setSuccess(true);
      setError('');
      setTimeout(() => {
        navigate('/recebimentos');
      }, 2000);
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
      setSuccess(false);
    },
  });

  const onSubmit = (data: RecebimentoFormData) => {
    setError('');
    mutation.mutate(data);
  };

  const handleBack = () => {
    navigate('/recebimentos');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Data mínima (mês atual)
  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;

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
          Novo Recebimento
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Recebimento cadastrado com sucesso! Redirecionando...
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Dados do Recebimento
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
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        handleContratoChange(e.target.value);
                      }}
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

            <Box flex={1}>
              <Controller
                name="competencia"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Competência *"
                    type="month"
                    fullWidth
                    margin="normal"
                    error={!!errors.competencia}
                    helperText={errors.competencia?.message}
                    disabled={mutation.isPending}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: mesAtual }}
                  />
                )}
              />
            </Box>
          </Box>

          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={3}>
            <Box flex={1}>
              <Controller
                name="valorPrevisto"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Valor Previsto *"
                    type="number"
                    fullWidth
                    margin="normal"
                    error={!!errors.valorPrevisto}
                    helperText={
                      errors.valorPrevisto?.message ||
                      (contratoSelecionado ? `Valor do aluguel: ${formatCurrency(contratoSelecionado.valorAluguel)}` : '')
                    }
                    disabled={mutation.isPending}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                    }}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </Box>
          </Box>

          {contratoSelecionado && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Informações do Contrato:</strong><br />
                • Imóvel: {contratoSelecionado.imovelTitulo}<br />
                • Locatário: {contratoSelecionado.locatarioNome}<br />
                • Vencimento: Dia {contratoSelecionado.diaVencimento} de cada mês
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
              disabled={mutation.isPending || isLoadingContratos}
              startIcon={
                mutation.isPending ? (
                  <CircularProgress size={20} />
                ) : (
                  <SaveIcon />
                )
              }
            >
              {mutation.isPending ? 'Cadastrando...' : 'Cadastrar Recebimento'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default RecebimentoCreatePage;