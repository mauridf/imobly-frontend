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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recebimentoApi } from '@/api/recebimentoApi';
import { pagarRecebimentoSchema, PagarRecebimentoFormData } from '@/utils/recebimentoSchemas';
import { extractErrorMessage } from '@/utils/errorHandler';
import { Contrato } from '@/types/contrato'; // Importar tipo Contrato

function RecebimentoEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  // Removido setIsPagar pois não está sendo usado
  // const [isPagar, setIsPagar] = useState(false);

  // Buscar recebimento para edição
  const { data: recebimento, isLoading: isLoadingRecebimento } = useQuery({
    queryKey: ['recebimentos', id],
    queryFn: () => recebimentoApi.getById(id!),
    enabled: !!id,
  });

  // Buscar contratos para informações adicionais - com tipagem
  const { data: contratos = [] } = useQuery<Contrato[]>({
    queryKey: ['contratos'],
    queryFn: async () => {
      const response = await fetch('/api/Contratos');
      return response.json();
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    // Remover watch e usar getValues no submit
  } = useForm<PagarRecebimentoFormData>({
    resolver: zodResolver(pagarRecebimentoSchema),
    defaultValues: {
      valorPago: 0,
      dataPagamento: new Date().toISOString().split('T')[0],
    },
  });

  // Remover watch para evitar erro do React Compiler
  // Em vez disso, calcularemos a diferença no submit
  // const valorPago = watch('valorPago');
  // const valorPrevisto = recebimento?.valorPrevisto || 0;
  // const diferenca = valorPago - valorPrevisto;

  // Mutation para registrar pagamento
  const pagarMutation = useMutation({
    mutationFn: (data: PagarRecebimentoFormData) => {
      return recebimentoApi.pagar(id!, data);
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

  // Preencher form com dados do recebimento
  useEffect(() => {
    if (recebimento && recebimento.dataPagamento) {
      reset({
        valorPago: recebimento.valorPago || recebimento.valorPrevisto,
        dataPagamento: recebimento.dataPagamento.split('T')[0],
      });
    }
  }, [recebimento, reset]);

  const onSubmit = (data: PagarRecebimentoFormData) => {
    setError('');
    
    // Calcular diferença aqui, não com watch
    const diferenca = data.valorPago - (recebimento?.valorPrevisto || 0);
    
    // Log para debug (opcional)
    if (diferenca !== 0) {
      console.log(`Diferença calculada: ${diferenca > 0 ? 'Acréscimo' : 'Desconto'} de ${Math.abs(diferenca)}`);
    }
    
    pagarMutation.mutate(data);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCompetencia = (competencia: string) => {
    try {
      // Se a competência é "-infinity", tratar
      if (competencia === '-infinity' || !competencia) {
        return 'Data inválida';
      }
      
      const date = new Date(competencia);
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      
      return date.toLocaleDateString('pt-BR', { 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return 'Data inválida';
    }
  };

  if (isLoadingRecebimento) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!recebimento) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Recebimento não encontrado.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Voltar para Recebimentos
        </Button>
      </Box>
    );
  }

  const contrato = contratos.find((c: Contrato) => c.id === recebimento.contratoId);
  const valorPrevisto = recebimento.valorPrevisto || 0;

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
          Registrar Pagamento {/* Removida condicional isPagar */}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Pagamento registrado com sucesso! Redirecionando...
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Registrar Pagamento {/* Removida condicional isPagar */}
        </Typography>

        {/* Informações não editáveis */}
        <Box mb={3}>
          <Box display="flex" gap={3} mb={2}>
            <Box flex={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Imóvel
              </Typography>
              <Typography>{recebimento.imovelTitulo}</Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Locatário
              </Typography>
              <Typography>{recebimento.locatarioNome}</Typography>
            </Box>
          </Box>

          <Box display="flex" gap={3} mb={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Competência
              </Typography>
              <Typography>{formatCompetencia(recebimento.competencia)}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Vencimento
              </Typography>
              <Typography>
                Dia {contrato?.diaVencimento || 'N/A'} 
              </Typography>
            </Box>
          </Box>

          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Valor Previsto
            </Typography>
            <Typography variant="h6" color="primary">
              {formatCurrency(valorPrevisto)}
            </Typography>
          </Box>

          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Status Atual
            </Typography>
            <Typography fontWeight="medium">
              {recebimento.status}
            </Typography>
          </Box>
        </Box>

        {recebimento.status !== 'Aguardando' && recebimento.status !== 'Atrasado' && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Este recebimento já foi processado. Status: <strong>{recebimento.status}</strong>
              {recebimento.dataPagamento && (
                <> em {formatDate(recebimento.dataPagamento)}</>
              )}
            </Typography>
          </Alert>
        )}

        {(recebimento.status === 'Aguardando' || recebimento.status === 'Atrasado') && (
          <>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Atenção:</strong> Para registrar o pagamento, preencha os dados abaixo.
              </Typography>
            </Alert>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={3}>
                <Box flex={1}>
                  <Controller
                    name="valorPago"
                    control={control}
                    render={({ field }) => {
                      // Calcular diferença localmente para o helperText
                      const diferencaLocal = field.value - valorPrevisto;
                      const temDiferenca = diferencaLocal !== 0;
                      
                      return (
                        <TextField
                          {...field}
                          label="Valor Pago *"
                          type="number"
                          fullWidth
                          margin="normal"
                          error={!!errors.valorPago}
                          helperText={
                            errors.valorPago?.message ||
                            (temDiferenca && `Diferença: ${formatCurrency(diferencaLocal)} (${diferencaLocal > 0 ? 'acréscimo' : 'desconto'})`)
                          }
                          disabled={pagarMutation.isPending}
                          InputProps={{
                            startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                          }}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      );
                    }}
                  />
                </Box>

                <Box flex={1}>
                  <Controller
                    name="dataPagamento"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Data do Pagamento *"
                        type="date"
                        fullWidth
                        margin="normal"
                        error={!!errors.dataPagamento}
                        helperText={errors.dataPagamento?.message}
                        disabled={pagarMutation.isPending}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Box>
              </Box>

              {/* Alertas de diferença removidos pois já estão no helperText */}

              <Box display="flex" gap={2} mt={3}>
                <Button
                  onClick={handleBack}
                  disabled={pagarMutation.isPending}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={pagarMutation.isPending}
                  startIcon={
                    pagarMutation.isPending ? (
                      <CircularProgress size={20} />
                    ) : (
                      <MoneyIcon />
                    )
                  }
                >
                  {pagarMutation.isPending ? 'Processando...' : 'Registrar Pagamento'}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}

export default RecebimentoEditPage;