import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  // Edit as EditIcon,
  Visibility as VisibilityIcon,
  AttachMoney as MoneyIcon,
  Schedule as PendenteIcon,
  Error as AtrasadoIcon,
  CheckCircle as PagoIcon,
  TrendingUp as AdiantadoIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recebimentoApi } from '@/api/recebimentoApi';
import { Recebimento, StatusRecebimento, PagarRecebimentoRequest } from '@/types/recebimento';
import { extractErrorMessage } from '@/utils/errorHandler';
import PagarRecebimentoModal from '@/components/recebimentos/PagarRecebimentoModal'; // Vamos criar este modal

function RecebimentosPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    contratoId: '',
    status: '',
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
  });
  const [pagarDialogOpen, setPagarDialogOpen] = useState(false); // Novo estado para modal de pagamento
  const [selectedRecebimento, setSelectedRecebimento] = useState<Recebimento | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [error, setError] = useState<string>('');

  // Query para buscar todos recebimentos
  const {
    data: recebimentos = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['recebimentos'],
    queryFn: async () => {
      // Se tiver endpoint /Recebimentos/todos, use:
      return recebimentoApi.getAll();
      
      // Se não tiver, combine os que temos
      // const [pendentes, atrasados] = await Promise.all([
      //   recebimentoApi.getPendentes(),
      //   recebimentoApi.getAtrasados(),
      // ]);
      
      // // Para Pago e Adiantado, precisaríamos de endpoints...
      // // Por enquanto, mostramos apenas pendentes e atrasados
      // const todos = [...pendentes, ...atrasados];
      
      // // Remover duplicados
      // const unicos = Array.from(new Map(todos.map(item => [item.id, item])).values());
      
      // return unicos.sort((a, b) => 
      //   new Date(b.competencia).getTime() - new Date(a.competencia).getTime()
      // );
    },
  });

  // Quando registrar pagamento, refetch
  const pagarMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PagarRecebimentoRequest }) => 
      recebimentoApi.pagar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recebimentos'] });
      refetch(); // Refetch para atualizar a lista
      setPagarDialogOpen(false);
      setError('');
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
    },
  });

  // Mutation para registrar pagamento - CORRIGIDO
  // const pagarMutation = useMutation({
  //   mutationFn: ({ id, data }: { id: string; data: PagarRecebimentoRequest }) => 
  //     recebimentoApi.pagar(id, data),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['recebimentos'] });
  //     setPagarDialogOpen(false); // Fechar modal após sucesso
  //     setError('');
  //   },
  //   onError: (error) => {
  //     setError(extractErrorMessage(error));
  //   },
  // });

  // Filtrar recebimentos localmente
  const filteredRecebimentos = recebimentos.filter((recebimento) => {
    const matchesSearch = 
      recebimento.imovelTitulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recebimento.locatarioNome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesContrato = !filters.contratoId || recebimento.contratoId === filters.contratoId;
    const matchesStatus = !filters.status || recebimento.status === filters.status;
    
    return matchesSearch && matchesContrato && matchesStatus;
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (field: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleAddNew = () => {
    navigate('/recebimentos/novo');
  };

  const handleGerarEmLote = () => {
    navigate('/recebimentos/gerar');
  };

  // const handleEdit = (id: string) => {
  //   navigate(`/recebimentos/editar/${id}`);
  // };

  const handleView = (recebimento: Recebimento) => {
    setSelectedRecebimento(recebimento);
    setViewDialogOpen(true);
  };

  // Função para abrir modal de pagamento
  const handlePagarRecebimento = (recebimento: Recebimento) => {
    console.log('Dados do recebimento:', recebimento);
    setSelectedRecebimento(recebimento);
    setPagarDialogOpen(true);
  };

  // Função para fechar modal de pagamento
  const handlePagarDialogClose = () => {
    setPagarDialogOpen(false);
    setSelectedRecebimento(null);
  };

  // Função para confirmar pagamento
  const handleConfirmarPagamento = (data: PagarRecebimentoRequest) => {
    if (selectedRecebimento) {
      pagarMutation.mutate({ 
        id: selectedRecebimento.id, 
        data 
      });
    }
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

  const getStatusIcon = (status: StatusRecebimento) => {
    switch (status) {
      case 'Aguardando':
        return <PendenteIcon />;
      case 'Pago':
        return <PagoIcon />;
      case 'Atrasado':
        return <AtrasadoIcon />;
      case 'Adiantado':
        return <AdiantadoIcon />;
      default:
        return undefined;
    }
  };

  const getStatusColor = (status: StatusRecebimento): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'Aguardando':
        return 'default';
      case 'Pago':
        return 'success';
      case 'Atrasado':
        return 'error';
      case 'Adiantado':
        return 'info';
      default:
        return 'default';
    }
  };

  // Status options para filtro
  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'Aguardando', label: 'Aguardando' },
    { value: 'Pago', label: 'Pago' },
    { value: 'Atrasado', label: 'Atrasado' },
    { value: 'Adiantado', label: 'Adiantado' },
  ];

  // Meses para filtro
  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  // Anos para filtro (últimos 3 anos e próximos 2)
  const currentYear = new Date().getFullYear();
  const anos = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Recebimentos</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={handleGerarEmLote}
          >
            Gerar em Lote
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
          >
            Novo Recebimento
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
          <Box flex={1}>
            <TextField
              fullWidth
              placeholder="Pesquisar por imóvel ou locatário..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box flex={1}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box flex={1}>
            <FormControl fullWidth>
              <InputLabel>Mês</InputLabel>
              <Select
                value={filters.mes}
                onChange={(e) => handleFilterChange('mes', Number(e.target.value))}
                label="Mês"
              >
                {meses.map((mes) => (
                  <MenuItem key={mes.value} value={mes.value}>
                    {mes.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box flex={1}>
            <FormControl fullWidth>
              <InputLabel>Ano</InputLabel>
              <Select
                value={filters.ano}
                onChange={(e) => handleFilterChange('ano', Number(e.target.value))}
                label="Ano"
              >
                {anos.map((ano) => (
                  <MenuItem key={ano} value={ano}>
                    {ano}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* Lista de Recebimentos */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : filteredRecebimentos.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm || filters.status
              ? 'Nenhum recebimento encontrado com os critérios de busca.'
              : 'Ainda não possui nenhum recebimento gerado.'}
          </Typography>
          {!searchTerm && !filters.status && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{ mt: 2 }}
            >
              Cadastrar Primeiro Recebimento
            </Button>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Competência</TableCell>
                <TableCell>Imóvel</TableCell>
                <TableCell>Locatário</TableCell>
                <TableCell>Valor Previsto</TableCell>
                <TableCell>Valor Pago</TableCell>
                <TableCell>Data Pagamento</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecebimentos.map((recebimento) => (
                <TableRow key={recebimento.id}>
                  <TableCell>
                    <Typography variant="body2">
                      {formatCompetencia(recebimento.competencia)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">{recebimento.imovelTitulo}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{recebimento.locatarioNome}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">
                      {formatCurrency(recebimento.valorPrevisto)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color={recebimento.valorPago > 0 ? "success.main" : "text.secondary"}>
                      {formatCurrency(recebimento.valorPago)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {recebimento.dataPagamento ? formatDate(recebimento.dataPagamento) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(recebimento.status)}
                      label={recebimento.status}
                      color={getStatusColor(recebimento.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleView(recebimento)}
                      title="Visualizar"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    {/* <IconButton
                      size="small"
                      onClick={() => handleEdit(recebimento.id)}
                      title="Editar"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton> */}
                    {recebimento.status === 'Aguardando' && (
                      <IconButton
                        size="small"
                        onClick={() => handlePagarRecebimento(recebimento)}
                        title="Registrar Pagamento"
                        color="primary"
                      >
                        <MoneyIcon fontSize="small" />
                      </IconButton>
                    )}
                    {/* Botão de excluir removido - não existe endpoint */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog de Confirmação de Exclusão - REMOVIDO pois não tem endpoint */}

      {/* Dialog de Visualização */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalhes do Recebimento</DialogTitle>
        <DialogContent>
          {selectedRecebimento && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recebimento #{selectedRecebimento.id.substring(0, 8)}...
              </Typography>
              
              <Box display="flex" gap={3} mb={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Imóvel
                  </Typography>
                  <Typography>{selectedRecebimento.imovelTitulo}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Locatário
                  </Typography>
                  <Typography>{selectedRecebimento.locatarioNome}</Typography>
                </Box>
              </Box>

              <Box display="flex" gap={3} mb={2}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Competência
                  </Typography>
                  <Typography>{formatCompetencia(selectedRecebimento.competencia)}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Data Pagamento
                  </Typography>
                  <Typography>
                    {selectedRecebimento.dataPagamento ? formatDate(selectedRecebimento.dataPagamento) : '-'}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" gap={3} mb={2}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Valor Previsto
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(selectedRecebimento.valorPrevisto)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Valor Pago
                  </Typography>
                  <Typography variant="h6" color={selectedRecebimento.valorPago > 0 ? "success.main" : "text.secondary"}>
                    {formatCurrency(selectedRecebimento.valorPago)}
                  </Typography>
                </Box>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Status
                </Typography>
                <Chip
                  icon={getStatusIcon(selectedRecebimento.status)}
                  label={selectedRecebimento.status}
                  color={getStatusColor(selectedRecebimento.status)}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Cadastrado em
                </Typography>
                <Typography>{formatDate(selectedRecebimento.criadoEm)}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Pagamento */}
      {selectedRecebimento && (
        <PagarRecebimentoModal
          open={pagarDialogOpen}
          onClose={handlePagarDialogClose}
          recebimento={selectedRecebimento}
          onPagar={handleConfirmarPagamento}
          isLoading={pagarMutation.isPending}
        />
      )}
    </Box>
  );
}

export default RecebimentosPage;