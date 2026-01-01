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
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Shield as InsuranceIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { seguroApi } from '@/api/seguroApi';
import { extractErrorMessage } from '@/utils/errorHandler';
import { formatCurrency } from '@/utils/formatters';
import { formatDate } from '@/utils/formatters';
import { z } from 'zod';

// Interface para a resposta da API
interface SeguroResponse {
  id: string;
  imovelId: string;
  descricao: string;
  valor: number;
  dataInicio: string;
  dataFim: string;
  seguradora: string;
  apolice: string;
  criadoEm: string;
  imovelTitulo: string;
}

// Criar um schema específico para o formulário de edição
const seguroUpdateFormSchema = z.object({
  descricao: z
    .string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(150, 'Descrição deve ter no máximo 150 caracteres'),
  valor: z.union([
    z.number().min(0.01, 'Valor deve ser maior que zero'),
    z.string().min(1, 'Valor é obrigatório')
      .refine(val => !isNaN(parseFloat(val)) && isFinite(Number(val)), {
        message: 'Valor deve ser um número válido'
      })
  ]),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().min(1, 'Data de fim é obrigatória'),
  seguradora: z
    .string()
    .min(3, 'Seguradora deve ter pelo menos 3 caracteres')
    .max(150, 'Seguradora deve ter no máximo 150 caracteres'),
  apolice: z
    .string()
    .min(3, 'Apólice deve ter pelo menos 3 caracteres')
    .max(100, 'Apólice deve ter no máximo 100 caracteres'),
}).refine(data => {
  const inicio = new Date(data.dataInicio);
  const fim = new Date(data.dataFim);
  return fim > inicio;
}, {
  message: 'Data de fim deve ser maior que data de início',
  path: ['dataFim'],
});

type SeguroUpdateFormInput = z.infer<typeof seguroUpdateFormSchema>;

// Função para converter os dados do formulário para o formato da API
const convertFormDataToApiData = (formData: SeguroUpdateFormInput) => {
  return {
    descricao: formData.descricao,
    valor: typeof formData.valor === 'string' ? parseFloat(formData.valor) : formData.valor,
    dataInicio: new Date(formData.dataInicio + 'T12:00:00Z').toISOString(),
    dataFim: new Date(formData.dataFim + 'T12:00:00Z').toISOString(),
    seguradora: formData.seguradora,
    apolice: formData.apolice,
  };
};

function SegurosEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  // Buscar seguro para edição
  const { 
    data: seguro, 
    isLoading: isLoadingSeguro 
    } = useQuery<SeguroResponse>({
    queryKey: ['seguros', id],
    // ADICIONAR .then(res => res.data) para extrair o dado do Axios
    queryFn: () => seguroApi.getById(id!).then(res => res.data as SeguroResponse),
    enabled: !!id,
    });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<SeguroUpdateFormInput>({
    resolver: zodResolver(seguroUpdateFormSchema),
    defaultValues: {
      descricao: '',
      valor: 0,
      dataInicio: new Date().toISOString().split('T')[0],
      dataFim: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      seguradora: '',
      apolice: '',
    },
  });

  // Usar useWatch para observar os valores
  const valor = useWatch({ control, name: 'valor' });
  const dataInicio = watch('dataInicio');
  const dataFim = watch('dataFim');

  // Usar useLayoutEffect para atualizações síncronas
  useLayoutEffect(() => {
    if (seguro) {
      reset({
        descricao: seguro.descricao,
        valor: seguro.valor,
        dataInicio: new Date(seguro.dataInicio).toISOString().split('T')[0],
        dataFim: new Date(seguro.dataFim).toISOString().split('T')[0],
        seguradora: seguro.seguradora,
        apolice: seguro.apolice,
      });
    }
  }, [seguro, reset]);

  // Mutation para atualizar seguro
  const mutation = useMutation({
    mutationFn: (data: SeguroUpdateFormInput) => {
      const apiData = convertFormDataToApiData(data);
      return seguroApi.update(id!, apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seguros'] });
      queryClient.invalidateQueries({ queryKey: ['seguros', id] });
      setSuccess(true);
      setError('');
      setTimeout(() => {
        navigate('/seguros');
      }, 2000);
    },
    onError: (error: Error) => {
      setError(extractErrorMessage(error));
      setSuccess(false);
    },
  });

  const onSubmit = (data: SeguroUpdateFormInput) => {
    setError('');
    mutation.mutate(data);
  };

  const handleBack = () => {
    navigate('/seguros');
  };

  // Calcular dias de vigência
  const calcularDiasVigencia = () => {
    if (!dataInicio || !dataFim) return 0;
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffTime = fim.getTime() - inicio.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const diasVigencia = calcularDiasVigencia();

  if (isLoadingSeguro) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!seguro) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Seguro não encontrado.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Voltar para Seguros
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
          <InsuranceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Editar Seguro
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Seguro atualizado com sucesso! Redirecionando...
        </Alert>
      )}

      {/* Informações não editáveis */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Informações do Seguro
        </Typography>

        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={2}>
          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Imóvel
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {seguro.imovelTitulo}
            </Typography>
          </Box>
          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Cadastrado em
            </Typography>
            <Typography variant="body1">
              {formatDate(seguro.criadoEm)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
        {/* Formulário de edição */}
        <Box flex={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Editar Dados do Seguro
            </Typography>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={3}>
                {/* Data de Início */}
                <Box flex={1}>
                  <Controller
                    name="dataInicio"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Data de Início *"
                        type="date"
                        fullWidth
                        margin="normal"
                        error={!!errors.dataInicio}
                        helperText={errors.dataInicio?.message}
                        disabled={mutation.isPending}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: <CalendarIcon sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    )}
                  />
                </Box>

                {/* Data de Fim */}
                <Box flex={1}>
                  <Controller
                    name="dataFim"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Data de Fim *"
                        type="date"
                        fullWidth
                        margin="normal"
                        error={!!errors.dataFim}
                        helperText={errors.dataFim?.message}
                        disabled={mutation.isPending}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: <CalendarIcon sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    )}
                  />
                </Box>
              </Box>

              {/* Vigência calculada */}
              {dataInicio && dataFim && diasVigencia > 0 && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Vigência:</strong> {diasVigencia} dias ({Math.round(diasVigencia / 30)} meses)
                  </Typography>
                </Alert>
              )}

              <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={3}>
                {/* Seguradora */}
                <Box flex={1}>
                  <Controller
                    name="seguradora"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Seguradora *"
                        fullWidth
                        margin="normal"
                        error={!!errors.seguradora}
                        helperText={errors.seguradora?.message}
                        disabled={mutation.isPending}
                        placeholder="Nome da seguradora"
                        InputProps={{
                          startAdornment: <BusinessIcon sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    )}
                  />
                </Box>

                {/* Apólice */}
                <Box flex={1}>
                  <Controller
                    name="apolice"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Número da Apólice *"
                        fullWidth
                        margin="normal"
                        error={!!errors.apolice}
                        helperText={errors.apolice?.message}
                        disabled={mutation.isPending}
                        placeholder="Número da apólice"
                        InputProps={{
                          startAdornment: <DescriptionIcon sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    )}
                  />
                </Box>
              </Box>

              {/* Valor */}
              <Box mb={3}>
                <Controller
                  name="valor"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Valor do Seguro (R$) *"
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
                {valor && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Valor informado: {formatCurrency(typeof valor === 'string' ? parseFloat(valor) : valor)}
                  </Typography>
                )}
              </Box>

              {/* Descrição */}
              <Box mb={3}>
                <Controller
                  name="descricao"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Descrição do Seguro *"
                      multiline
                      rows={3}
                      fullWidth
                      margin="normal"
                      error={!!errors.descricao}
                      helperText={errors.descricao?.message}
                      disabled={mutation.isPending}
                      placeholder="Descreva a cobertura do seguro..."
                      InputProps={{
                        startAdornment: <DescriptionIcon sx={{ 
                          mr: 1, 
                          color: 'action.active',
                          alignSelf: 'flex-start',
                          mt: 1.5 
                        }} />,
                      }}
                    />
                  )}
                />
              </Box>

              {/* Botões de ação */}
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
                  {mutation.isPending ? 'Atualizando...' : 'Atualizar Seguro'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Informações de ajuda */}
        <Box flex={1}>
          <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              <InsuranceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Sobre Seguros
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Coberturas comuns:</strong><br />
              • Incêndio e explosão<br />
              • Danos elétricos<br />
              • Roubo e furto qualificado<br />
              • Responsabilidade civil<br />
              • Fenômenos da natureza
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Dicas importantes:</strong><br />
              • Mantenha a apólice sempre atualizada<br />
              • Guarde cópias digitais dos documentos<br />
              • Renove o seguro antes do vencimento<br />
              • Verifique as coberturas incluídas
            </Typography>
            <Typography variant="body2">
              <strong>Informações originais:</strong><br />
              • Imóvel: {seguro.imovelTitulo}<br />
              • Cadastrado em: {formatDate(seguro.criadoEm)}<br />
              • Vigência original: {formatDate(seguro.dataInicio)} a {formatDate(seguro.dataFim)}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default SegurosEditPage;