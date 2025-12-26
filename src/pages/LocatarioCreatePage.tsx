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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { locatarioApi } from '@/api/locatarioApi';
import { locatarioSchema, LocatarioFormData } from '@/utils/locatarioSchemas';
import { extractErrorMessage } from '@/utils/errorHandler';

const estadosBrasil = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const steps = ['Informações Pessoais', 'Contato', 'Endereço'];

function LocatarioCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LocatarioFormData>({
    resolver: zodResolver(locatarioSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      rg: '',
      dataNascimento: '',
      enderecoLogradouro: '',
      enderecoNumero: '',
      enderecoBairro: '',
      enderecoCidade: '',
      enderecoEstado: '',
      enderecoCEP: '',
    },
  });

  // Mutation para criar locatário
  const mutation = useMutation({
    mutationFn: (data: LocatarioFormData) => {
      // Formatar data para o padrão ISO
      const formattedData = {
        ...data,
        dataNascimento: new Date(data.dataNascimento).toISOString(),
      };
      return locatarioApi.create(formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locatarios'] });
      setSuccess(true);
      setError('');
      setTimeout(() => {
        navigate('/locatarios');
      }, 2000);
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
      setSuccess(false);
    },
  });

  const onSubmit = (data: LocatarioFormData) => {
    setError('');
    mutation.mutate(data);
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    } else {
      navigate('/locatarios');
    }
  };

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
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
          Cadastrar Novo Locatário
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Locatário cadastrado com sucesso! Redirecionando...
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
                name="nome"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nome Completo"
                    fullWidth
                    margin="normal"
                    error={!!errors.nome}
                    helperText={errors.nome?.message}
                    disabled={mutation.isPending}
                  />
                )}
              />

              <Box display="flex" gap={2}>
                <Controller
                  name="cpf"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="CPF"
                      fullWidth
                      margin="normal"
                      error={!!errors.cpf}
                      helperText={errors.cpf?.message}
                      disabled={mutation.isPending}
                      onChange={(e) => {
                        const formatted = formatCPF(e.target.value);
                        field.onChange(formatted);
                      }}
                      inputProps={{ maxLength: 14 }}
                    />
                  )}
                />

                <Controller
                  name="rg"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="RG"
                      fullWidth
                      margin="normal"
                      error={!!errors.rg}
                      helperText={errors.rg?.message}
                      disabled={mutation.isPending}
                    />
                  )}
                />
              </Box>

              <Controller
                name="dataNascimento"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Data de Nascimento"
                    type="date"
                    fullWidth
                    margin="normal"
                    error={!!errors.dataNascimento}
                    helperText={errors.dataNascimento?.message}
                    disabled={mutation.isPending}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    fullWidth
                    margin="normal"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={mutation.isPending}
                  />
                )}
              />

              <Controller
                name="telefone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Telefone"
                    fullWidth
                    margin="normal"
                    error={!!errors.telefone}
                    helperText={errors.telefone?.message}
                    disabled={mutation.isPending}
                    placeholder="(11) 99999-9999"
                  />
                )}
              />
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Controller
                name="enderecoLogradouro"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Logradouro"
                    fullWidth
                    margin="normal"
                    error={!!errors.enderecoLogradouro}
                    helperText={errors.enderecoLogradouro?.message}
                    disabled={mutation.isPending}
                  />
                )}
              />

              <Box display="flex" gap={2}>
                <Controller
                  name="enderecoNumero"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Número"
                      fullWidth
                      margin="normal"
                      error={!!errors.enderecoNumero}
                      helperText={errors.enderecoNumero?.message}
                      disabled={mutation.isPending}
                    />
                  )}
                />

                <Controller
                  name="enderecoBairro"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Bairro"
                      fullWidth
                      margin="normal"
                      error={!!errors.enderecoBairro}
                      helperText={errors.enderecoBairro?.message}
                      disabled={mutation.isPending}
                    />
                  )}
                />
              </Box>

              <Controller
                name="enderecoCidade"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Cidade"
                    fullWidth
                    margin="normal"
                    error={!!errors.enderecoCidade}
                    helperText={errors.enderecoCidade?.message}
                    disabled={mutation.isPending}
                  />
                )}
              />

              <Box display="flex" gap={2}>
                <Controller
                  name="enderecoEstado"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Estado"
                      fullWidth
                      margin="normal"
                      error={!!errors.enderecoEstado}
                      helperText={errors.enderecoEstado?.message}
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
                  name="enderecoCEP"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="CEP"
                      fullWidth
                      margin="normal"
                      error={!!errors.enderecoCEP}
                      helperText={errors.enderecoCEP?.message}
                      disabled={mutation.isPending}
                      inputProps={{ maxLength: 9 }}
                    />
                  )}
                />
              </Box>
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
                  {mutation.isPending ? 'Cadastrando...' : 'Cadastrar Locatário'}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default LocatarioCreatePage;