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
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contratoApi } from '@/api/contratoApi';
import { contratoSchema, ContratoFormData } from '@/utils/contratoSchemas';
import { useImoveisOptions } from '@/hooks/useImoveisOptions';
import { useLocatariosOptions } from '@/hooks/useLocatariosOptions';
import { extractErrorMessage } from '@/utils/errorHandler';

function ContratoCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [valorSugerido, setValorSugerido] = useState<number>(0);

  const { options: imoveisOptions, isLoading: isLoadingImoveis } = useImoveisOptions();
  const { options: locatariosOptions, isLoading: isLoadingLocatarios } = useLocatariosOptions();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ContratoFormData>({
    resolver: zodResolver(contratoSchema),
    defaultValues: {
      imovelId: '',
      locatarioId: '',
      dataInicio: '',
      dataFim: '',
      valorAluguel: 0,
      valorSeguro: 0,
      diaVencimento: 10,
    },
  });

  // Watch selected imovel
  const imovelId = watch('imovelId');

  // Update valorAluguel when imovel changes
  useEffect(() => {
    if (imovelId) {
      const selectedImovel = imoveisOptions.find(opt => opt.value === imovelId);
      if (selectedImovel?.extra?.valorAluguelSugerido) {
        const valor = selectedImovel.extra.valorAluguelSugerido;
        setValorSugerido(valor);
        setValue('valorAluguel', valor);
      }
    }
  }, [imovelId, imoveisOptions, setValue]);

  // Mutation para criar contrato
  const mutation = useMutation({
    mutationFn: (data: ContratoFormData) => {
      // Formatar datas para o padrão ISO
      const formattedData = {
        ...data,
        dataInicio: new Date(data.dataInicio).toISOString(),
        dataFim: new Date(data.dataFim).toISOString(),
      };
      return contratoApi.create(formattedData);
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

  const onSubmit = (data: ContratoFormData) => {
    setError('');
    mutation.mutate(data);
  };

  const handleBack = () => {
    navigate('/contratos');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const hoje = new Date().toISOString().split('T')[0];
  const umAnoDepois = new Date();
  umAnoDepois.setFullYear(umAnoDepois.getFullYear() + 1);
  const dataPadraoFim = umAnoDepois.toISOString().split('T')[0];

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
          Novo Contrato
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Contrato cadastrado com sucesso! Redirecionando...
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Dados do Contrato
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={3}>
            <Box flex={1}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="imovel-label">Imóvel *</InputLabel>
                <Controller
                  name="imovelId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="imovel-label"
                      label="Imóvel *"
                      error={!!errors.imovelId}
                      disabled={mutation.isPending || isLoadingImoveis}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                    >
                      {isLoadingImoveis ? (
                        <MenuItem disabled>Carregando imóveis...</MenuItem>
                      ) : imoveisOptions.length === 0 ? (
                        <MenuItem disabled>Nenhum imóvel disponível</MenuItem>
                      ) : (
                        imoveisOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  )}
                />
                {errors.imovelId && (
                  <Typography color="error" variant="caption">
                    {errors.imovelId.message}
                  </Typography>
                )}
              </FormControl>
            </Box>

            <Box flex={1}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="locatario-label">Locatário *</InputLabel>
                <Controller
                  name="locatarioId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="locatario-label"
                      label="Locatário *"
                      error={!!errors.locatarioId}
                      disabled={mutation.isPending || isLoadingLocatarios}
                    >
                      {isLoadingLocatarios ? (
                        <MenuItem disabled>Carregando locatários...</MenuItem>
                      ) : locatariosOptions.length === 0 ? (
                        <MenuItem disabled>Nenhum locatário disponível</MenuItem>
                      ) : (
                        locatariosOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  )}
                />
                {errors.locatarioId && (
                  <Typography color="error" variant="caption">
                    {errors.locatarioId.message}
                  </Typography>
                )}
              </FormControl>
            </Box>
          </Box>

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
                    helperText={errors.dataFim?.message}
                    disabled={mutation.isPending}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: hoje }}
                    defaultValue={dataPadraoFim}
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
                    helperText={
                      errors.valorAluguel?.message ||
                      (valorSugerido > 0 ? `Valor sugerido: ${formatCurrency(valorSugerido)}` : '')
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
              disabled={mutation.isPending || isLoadingImoveis || isLoadingLocatarios}
              startIcon={
                mutation.isPending ? (
                  <CircularProgress size={20} />
                ) : (
                  <SaveIcon />
                )
              }
            >
              {mutation.isPending ? 'Cadastrando...' : 'Cadastrar Contrato'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default ContratoCreatePage;