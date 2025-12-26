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
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { imovelApi, imovelQueries } from '@/api/imovelApi';
import { imovelSchema, ImovelFormData } from '@/utils/imovelSchemas';
import { extractErrorMessage } from '@/utils/errorHandler';

// Tipos de imóvel atualizados conforme sua observação
const tiposImovel = [
  'Residencial',
  'Comercial',
  'Temporada',
];

const estadosBrasil = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const steps = ['Informações Básicas', 'Endereço', 'Características'];

function ImovelFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  // Buscar imóvel para edição - CORRIGIDO
  const { data: imovel, isLoading: isLoadingImovel } = useQuery({
    ...imovelQueries.detail(id!),
    enabled: isEditMode && !!id,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ImovelFormData>({
    resolver: zodResolver(imovelSchema),
    defaultValues: {
      tipo: '',
      titulo: '',
      descricao: '',
      endereco: {
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
      },
      areaM2: 0,
      quartos: 0,
      banheiros: 0,
      vagasGaragem: 0,
      valorAluguelSugerido: 0,
    },
  });

  // Mutation para criar/editar
  const mutation = useMutation({
    mutationFn: (data: ImovelFormData) =>
      isEditMode
        ? imovelApi.update(id!, { ...data, ativo: true })
        : imovelApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
      setSuccess(true);
      setError('');
      setTimeout(() => {
        navigate('/imoveis');
      }, 2000);
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
      setSuccess(false);
    },
  });

  // Preencher form se for edição
  useEffect(() => {
    if (imovel && isEditMode) {
      reset({
        tipo: imovel.tipo,
        titulo: imovel.titulo,
        descricao: imovel.descricao,
        endereco: imovel.endereco,
        areaM2: imovel.areaM2,
        quartos: imovel.quartos,
        banheiros: imovel.banheiros,
        vagasGaragem: imovel.vagasGaragem,
        valorAluguelSugerido: imovel.valorAluguelSugerido,
      });
    }
  }, [imovel, isEditMode, reset]);

  const onSubmit = (data: ImovelFormData) => {
    setError('');
    mutation.mutate(data);
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    } else {
      navigate('/imoveis');
    }
  };

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  if (isLoadingImovel && isEditMode) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
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
          {isEditMode ? 'Editar Imóvel' : 'Cadastrar Novo Imóvel'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {isEditMode
            ? 'Imóvel atualizado com sucesso! Redirecionando...'
            : 'Imóvel cadastrado com sucesso! Redirecionando...'}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {activeStep === 0 && (
            <Box>
              <Controller
                name="tipo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Tipo do Imóvel"
                    fullWidth
                    margin="normal"
                    error={!!errors.tipo}
                    helperText={errors.tipo?.message}
                    disabled={mutation.isPending}
                  >
                    {tiposImovel.map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipo}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Controller
                name="titulo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Título"
                    fullWidth
                    margin="normal"
                    error={!!errors.titulo}
                    helperText={errors.titulo?.message}
                    disabled={mutation.isPending}
                  />
                )}
              />

              <Controller
                name="descricao"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Descrição"
                    multiline
                    rows={4}
                    fullWidth
                    margin="normal"
                    error={!!errors.descricao}
                    helperText={errors.descricao?.message}
                    disabled={mutation.isPending}
                  />
                )}
              />
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Controller
                name="endereco.logradouro"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Logradouro"
                    fullWidth
                    margin="normal"
                    error={!!errors.endereco?.logradouro}
                    helperText={errors.endereco?.logradouro?.message}
                    disabled={mutation.isPending}
                  />
                )}
              />

              <Box display="flex" gap={2}>
                <Controller
                  name="endereco.numero"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Número"
                      fullWidth
                      margin="normal"
                      error={!!errors.endereco?.numero}
                      helperText={errors.endereco?.numero?.message}
                      disabled={mutation.isPending}
                    />
                  )}
                />

                <Controller
                  name="endereco.complemento"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Complemento"
                      fullWidth
                      margin="normal"
                      disabled={mutation.isPending}
                    />
                  )}
                />
              </Box>

              <Controller
                name="endereco.bairro"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Bairro"
                    fullWidth
                    margin="normal"
                    error={!!errors.endereco?.bairro}
                    helperText={errors.endereco?.bairro?.message}
                    disabled={mutation.isPending}
                  />
                )}
              />

              <Controller
                name="endereco.cidade"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Cidade"
                    fullWidth
                    margin="normal"
                    error={!!errors.endereco?.cidade}
                    helperText={errors.endereco?.cidade?.message}
                    disabled={mutation.isPending}
                  />
                )}
              />

              <Box display="flex" gap={2}>
                <Controller
                  name="endereco.estado"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Estado"
                      fullWidth
                      margin="normal"
                      error={!!errors.endereco?.estado}
                      helperText={errors.endereco?.estado?.message}
                      disabled={mutation.isPending}
                    >
                      {estadosBrasil.map((estado) => (
                        <MenuItem key={estado} value={estado}>
                          {estado}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="endereco.cep"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="CEP"
                      fullWidth
                      margin="normal"
                      error={!!errors.endereco?.cep}
                      helperText={errors.endereco?.cep?.message}
                      disabled={mutation.isPending}
                      inputProps={{ maxLength: 9 }}
                    />
                  )}
                />
              </Box>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Box display="flex" gap={2}>
                <Controller
                  name="areaM2"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Área (m²)"
                      type="number"
                      fullWidth
                      margin="normal"
                      error={!!errors.areaM2}
                      helperText={errors.areaM2?.message}
                      disabled={mutation.isPending}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />

                <Controller
                  name="quartos"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Quartos"
                      type="number"
                      fullWidth
                      margin="normal"
                      error={!!errors.quartos}
                      helperText={errors.quartos?.message}
                      disabled={mutation.isPending}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </Box>

              <Box display="flex" gap={2}>
                <Controller
                  name="banheiros"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Banheiros"
                      type="number"
                      fullWidth
                      margin="normal"
                      error={!!errors.banheiros}
                      helperText={errors.banheiros?.message}
                      disabled={mutation.isPending}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />

                <Controller
                  name="vagasGaragem"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Vagas de Garagem"
                      type="number"
                      fullWidth
                      margin="normal"
                      error={!!errors.vagasGaragem}
                      helperText={errors.vagasGaragem?.message}
                      disabled={mutation.isPending}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </Box>

              <Controller
                name="valorAluguelSugerido"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Valor Sugerido do Aluguel (R$)"
                    type="number"
                    fullWidth
                    margin="normal"
                    error={!!errors.valorAluguelSugerido}
                    helperText={errors.valorAluguelSugerido?.message}
                    disabled={mutation.isPending}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                    }}
                  />
                )}
              />
            </Box>
          )}

          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button
              onClick={handleBack}
              disabled={mutation.isPending}
            >
              {activeStep === 0 ? 'Cancelar' : 'Voltar'}
            </Button>

            <Box>
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={mutation.isPending}
                >
                  Próximo
                </Button>
              ) : (
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
                  {mutation.isPending
                    ? isEditMode
                      ? 'Salvando...'
                      : 'Cadastrando...'
                    : isEditMode
                    ? 'Salvar Alterações'
                    : 'Cadastrar Imóvel'}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default ImovelFormPage;