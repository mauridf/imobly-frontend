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
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Build as BuildIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { manutencaoApi } from '@/api/manutencaoApi';
import { extractErrorMessage } from '@/utils/errorHandler';
import { formatCurrency } from '@/utils/formatters';
import { formatDate } from '@/utils/formatters';
import { z } from 'zod';
// Interface para a resposta da API
interface ManutencaoResponse {
  id: string;
  imovelId: string;
  descricao: string;
  data: string;
  valor: number;
  responsavel: string;
  status: string | number;
  criadoEm: string;
  imovelTitulo?: string;
}

// Criar um schema específico para o formulário de edição
const manutencaoUpdateFormSchema = z.object({
  descricao: z
    .string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  data: z.string().min(1, 'Data é obrigatória'),
  valor: z.union([
    z.number().min(0.01, 'Valor deve ser maior que zero'),
    z.string().min(1, 'Valor é obrigatório')
      .refine(val => !isNaN(parseFloat(val)) && isFinite(Number(val)), {
        message: 'Valor deve ser um número válido'
      })
  ]),
  responsavel: z
    .string()
    .min(3, 'Responsável deve ter pelo menos 3 caracteres')
    .max(150, 'Responsável deve ter no máximo 150 caracteres'),
  status: z.enum(['Pendente', 'Feito']),
});

type ManutencaoUpdateFormInput = z.infer<typeof manutencaoUpdateFormSchema>;

// Função para converter os dados do formulário para o formato da API
const convertFormDataToApiData = (formData: ManutencaoUpdateFormInput) => {
  return {
    descricao: formData.descricao,
    data: new Date(formData.data + 'T12:00:00Z').toISOString(),
    valor: typeof formData.valor === 'string' ? parseFloat(formData.valor) : formData.valor,
    responsavel: formData.responsavel,
    status: formData.status,
  };
};

// Helper function para converter status
const getStatusText = (status: string | number): 'Pendente' | 'Feito' => {
  if (typeof status === 'number') {
    return status === 1 ? 'Pendente' : 'Feito';
  }
  return status === 'Pendente' ? 'Pendente' : 'Feito';
};

function ManutencoesEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  // Buscar manutenção para edição - especificando o tipo de retorno
  const { 
    data: manutencao, 
    isLoading: isLoadingManutencao 
  } = useQuery<ManutencaoResponse>({
    queryKey: ['manutencoes', id],
    queryFn: () => manutencaoApi.getById(id!),
    enabled: !!id,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ManutencaoUpdateFormInput>({
    resolver: zodResolver(manutencaoUpdateFormSchema),
    defaultValues: {
      descricao: '',
      data: new Date().toISOString().split('T')[0],
      valor: 0,
      responsavel: '',
      status: 'Pendente',
    },
  });

  // Usar useWatch para observar os valores
  const valor = useWatch({ control, name: 'valor' });

  // Usar useLayoutEffect para atualizações síncronas
  useLayoutEffect(() => {
    if (manutencao) {
      reset({
        descricao: manutencao.descricao,
        data: new Date(manutencao.data).toISOString().split('T')[0],
        valor: manutencao.valor,
        responsavel: manutencao.responsavel || '',
        status: getStatusText(manutencao.status),
      });
    }
  }, [manutencao, reset]);

  // Mutation para atualizar manutenção
  const mutation = useMutation({
    mutationFn: (data: ManutencaoUpdateFormInput) => {
      const apiData = convertFormDataToApiData(data);
      return manutencaoApi.update(id!, apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] });
      queryClient.invalidateQueries({ queryKey: ['manutencoes', id] });
      setSuccess(true);
      setError('');
      setTimeout(() => {
        navigate('/manutencoes');
      }, 2000);
    },
    onError: (error: Error) => {
      setError(extractErrorMessage(error));
      setSuccess(false);
    },
  });

  const onSubmit = (data: ManutencaoUpdateFormInput) => {
    setError('');
    mutation.mutate(data);
  };

  const handleBack = () => {
    navigate('/manutencoes');
  };

  if (isLoadingManutencao) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!manutencao) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Manutenção não encontrada.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Voltar para Manutenções
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
          <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Editar Manutenção
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Manutenção atualizada com sucesso! Redirecionando...
        </Alert>
      )}

      {/* Informações não editáveis */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Informações da Manutenção
        </Typography>

        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={2}>
          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Imóvel
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {manutencao.imovelTitulo}
            </Typography>
          </Box>
          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Cadastrado em
            </Typography>
            <Typography variant="body1">
              {formatDate(manutencao.criadoEm)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
        {/* Formulário de edição */}
        <Box flex={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Editar Dados da Manutenção
            </Typography>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              {/* Data da Manutenção */}
              <Box mb={3}>
                <Controller
                  name="data"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Data da Manutenção *"
                      type="date"
                      fullWidth
                      margin="normal"
                      error={!!errors.data}
                      helperText={errors.data?.message}
                      disabled={mutation.isPending}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <CalendarIcon sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  )}
                />
              </Box>

              {/* Responsável */}
              <Box mb={3}>
                <Controller
                  name="responsavel"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Responsável *"
                      fullWidth
                      margin="normal"
                      error={!!errors.responsavel}
                      helperText={errors.responsavel?.message}
                      disabled={mutation.isPending}
                      placeholder="Nome do responsável pela manutenção"
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  )}
                />
              </Box>

              {/* Valor */}
              <Box mb={3}>
                <Controller
                  name="valor"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Valor (R$) *"
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

              {/* Status */}
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
                        <MenuItem value="Pendente">Pendente</MenuItem>
                        <MenuItem value="Feito">Feito</MenuItem>
                      </Select>
                    )}
                  />
                  <FormHelperText>
                    Defina o status atual da manutenção
                  </FormHelperText>
                  {errors.status && (
                    <Typography color="error" variant="caption">
                      {errors.status.message}
                    </Typography>
                  )}
                </FormControl>
              </Box>

              {/* Descrição */}
              <Box mb={3}>
                <Controller
                  name="descricao"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Descrição *"
                      multiline
                      rows={4}
                      fullWidth
                      margin="normal"
                      error={!!errors.descricao}
                      helperText={errors.descricao?.message}
                      disabled={mutation.isPending}
                      placeholder="Descreva detalhadamente a manutenção..."
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
                  {mutation.isPending ? 'Atualizando...' : 'Atualizar Manutenção'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Informações de ajuda */}
        <Box flex={1}>
          <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Status da Manutenção
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Pendente</strong><br />
              A manutenção está agendada ou em andamento, mas ainda não foi concluída.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Feito</strong><br />
              A manutenção foi concluída com sucesso e não requer mais atenção.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Dicas importantes:</strong><br />
              • Mantenha a descrição detalhada para referência futura<br />
              • Registre o responsável para facilitar a comunicação<br />
              • Atualize o status conforme o andamento<br />
              • Guarde comprovantes de pagamento quando houver valor envolvido
            </Typography>
            <Typography variant="body2">
              <strong>Informações originais:</strong><br />
              • Imóvel: {manutencao.imovelTitulo}<br />
              • Cadastrado em: {formatDate(manutencao.criadoEm)}<br />
              • Status original: {getStatusText(manutencao.status)}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default ManutencoesEditPage;