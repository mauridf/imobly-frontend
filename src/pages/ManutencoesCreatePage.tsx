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
  Card,
  CardContent,
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { manutencaoApi } from '@/api/manutencaoApi';
import { useImoveisOptions } from '@/hooks/useImoveisOptions';
import { extractErrorMessage } from '@/utils/errorHandler';
import { formatCurrency } from '@/utils/formatters';
import { z } from 'zod';

// Criar um schema específico para o formulário que aceita string no valor
const manutencaoFormSchema = z.object({
  imovelId: z.string().min(1, 'Imóvel é obrigatório'),
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
});

type ManutencaoFormInput = z.infer<typeof manutencaoFormSchema>;

// Função para converter os dados do formulário para o formato da API
const convertFormDataToApiData = (formData: ManutencaoFormInput) => {
  return {
    imovelId: formData.imovelId,
    descricao: formData.descricao,
    data: new Date(formData.data + 'T12:00:00Z').toISOString(),
    valor: typeof formData.valor === 'string' ? parseFloat(formData.valor) : formData.valor,
    responsavel: formData.responsavel,
  };
};

function ManutencoesCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  // Buscar opções de imóveis
  const { options: imoveisOptions, isLoading: isLoadingImoveis } = useImoveisOptions();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ManutencaoFormInput>({
    resolver: zodResolver(manutencaoFormSchema),
    defaultValues: {
      imovelId: '',
      descricao: '',
      data: new Date().toISOString().split('T')[0],
      valor: 0,
      responsavel: '',
    },
  });

  // Usar useWatch para observar os valores
  const imovelId = useWatch({ control, name: 'imovelId' });
  const valor = useWatch({ control, name: 'valor' });

  // Encontrar imóvel selecionado
  const imovelSelecionado = imoveisOptions.find(option => option.value === imovelId);

  // Mutation para criar manutenção
  const mutation = useMutation({
    mutationFn: (data: ManutencaoFormInput) => {
      const apiData = convertFormDataToApiData(data);
      return manutencaoApi.create(apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] });
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

  const onSubmit = (data: ManutencaoFormInput) => {
    setError('');
    mutation.mutate(data);
  };

  const handleBack = () => {
    navigate('/manutencoes');
  };

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
          Nova Manutenção
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Manutenção cadastrada com sucesso! Redirecionando...
        </Alert>
      )}

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
        {/* Formulário principal */}
        <Box flex={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Dados da Manutenção
            </Typography>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              {/* Seleção do Imóvel */}
              <Box mb={3}>
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
                      >
                        {imoveisOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  <FormHelperText>
                    Selecione o imóvel onde será realizada a manutenção
                  </FormHelperText>
                  {errors.imovelId && (
                    <Typography color="error" variant="caption">
                      {errors.imovelId.message}
                    </Typography>
                  )}
                </FormControl>
              </Box>

              {/* Informações do imóvel selecionado */}
              {imovelSelecionado && (
                <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Informações do Imóvel Selecionado
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {imovelSelecionado.label}
                    </Typography>
                  </CardContent>
                </Card>
              )}

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
                      placeholder="Descreva detalhadamente a manutenção a ser realizada..."
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
                  {mutation.isPending ? 'Cadastrando...' : 'Cadastrar Manutenção'}
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
              Como funciona?
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>1. Selecione o imóvel</strong><br />
              Escolha o imóvel onde será realizada a manutenção.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>2. Informe a data</strong><br />
              Defina a data prevista para a realização da manutenção.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>3. Descreva a manutenção</strong><br />
              Detalhe o que será feito, materiais necessários e especificações.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>4. Defina o responsável</strong><br />
              Informe quem será responsável por executar a manutenção.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>5. Estime o valor</strong><br />
              Informe o custo estimado da manutenção.
            </Typography>
            <Typography variant="body2">
              <strong>6. Status inicial</strong><br />
              Todas as manutenções começam com status "Pendente". Após realizada, você pode marcá-la como "Feito".
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default ManutencoesCreatePage;