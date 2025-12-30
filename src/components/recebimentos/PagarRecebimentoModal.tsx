import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Recebimento, PagarRecebimentoRequest } from '@/types/recebimento';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { contratoApi } from '@/api/contratoApi';
import { formatDateForAPI } from '@/utils/dateUtils';

interface PagarRecebimentoModalProps {
  open: boolean;
  onClose: () => void;
  recebimento: Recebimento;
  onPagar: (data: PagarRecebimentoRequest) => void;
  isLoading: boolean;
}

function PagarRecebimentoModal({
  open,
  onClose,
  recebimento,
  onPagar,
  isLoading,
}: PagarRecebimentoModalProps) {
  const [valorPago, setValorPago] = useState<string>(
    recebimento.valorPrevisto.toString()
  );
  const [dataPagamento, setDataPagamento] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [error, setError] = useState<string>('');

  // Buscar dados do contrato para garantir que temos todas as informações
  const { data: contrato, isLoading: isLoadingContrato } = useQuery({
    queryKey: ['contratos', recebimento.contratoId],
    queryFn: () => contratoApi.getById(recebimento.contratoId),
    enabled: open && !!recebimento.contratoId,
  });

  // Usar dados do contrato se disponíveis, senão usar dados do recebimento
  const imovelTitulo = contrato?.imovelTitulo || recebimento.imovelTitulo || 'Não disponível';
  const locatarioNome = contrato?.locatarioNome || recebimento.locatarioNome || 'Não disponível';
  const valorPrevisto = recebimento.valorPrevisto || contrato?.valorAluguel || 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
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

  const handleSubmit = () => {
    // Validações
    if (!valorPago || parseFloat(valorPago) <= 0) {
      setError('Informe um valor válido para o pagamento');
      return;
    }

    if (!dataPagamento) {
      setError('Informe a data do pagamento');
      return;
    }

    // Converter para número
    const valorPagoNum = parseFloat(valorPago);

    // Preparar dados para enviar
    const pagamentoData: PagarRecebimentoRequest = {
      valorPago: valorPagoNum,
      dataPagamento: formatDateForAPI(dataPagamento),
    };

    // Chamar função de pagamento
    onPagar(pagamentoData);
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir apenas números e ponto decimal
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setValorPago(value);
      setError('');
    }
  };

  // Se estiver carregando dados do contrato, mostrar loading
  if (isLoadingContrato) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar Pagamento</DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Registrar Pagamento</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Informações do Recebimento */}
          <Box mb={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Imóvel
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {imovelTitulo} {/* Usar a variável imovelTitulo */}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
              Locatário
            </Typography>
            <Typography variant="body1">{locatarioNome}</Typography> {/* Usar locatarioNome */}

            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
              Competência
            </Typography>
            <Typography variant="body1">
              {formatCompetencia(recebimento.competencia)}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
              Valor Previsto
            </Typography>
            <Typography variant="h6" color="primary">
              {formatCurrency(valorPrevisto)} {/* Usar valorPrevisto */}
            </Typography>
          </Box>

          {/* Campos do Formulário */}
          <TextField
            fullWidth
            label="Valor Pago"
            value={valorPago}
            onChange={handleValorChange}
            margin="normal"
            error={!!error}
            helperText="Digite o valor recebido"
            InputProps={{
              startAdornment: 'R$ ',
            }}
            type="text"
            inputProps={{
              inputMode: 'decimal',
            }}
            disabled={isLoading}
          />

          <TextField
            fullWidth
            label="Data do Pagamento"
            type="date"
            value={dataPagamento}
            onChange={(e) => setDataPagamento(e.target.value)}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            disabled={isLoading}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading && <CircularProgress size={20} />}
        >
          {isLoading ? 'Processando...' : 'Confirmar Pagamento'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PagarRecebimentoModal;