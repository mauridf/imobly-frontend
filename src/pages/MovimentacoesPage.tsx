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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  AttachMoney as MoneyIcon,
  Schedule as PendenteIcon,
  CheckCircle as PagoIcon,
  Cancel as CanceladoIcon,
  Receipt as ReceiptIcon, // Ícone para recebimento
//   FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movimentacaoApi } from '@/api/movimentacaoApi';
import {
  MovimentacaoFinanceira,
  TipoMovimentacao,
//   CategoriaMovimentacao,
  StatusMovimentacao,
} from '@/types/movimentacao';
import { extractErrorMessage } from '@/utils/errorHandler';
import { useImoveisOptions } from '@/hooks/useImoveisOptions';

function MovimentacoesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    imovelId: '',
    tipo: '',
    categoria: '',
    status: '',
  });
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pagarDialogOpen, setPagarDialogOpen] = useState(false);
  const [receberDialogOpen, setReceberDialogOpen] = useState(false);
  const [cancelarDialogOpen, setCancelarDialogOpen] = useState(false);
  const [selectedMovimentacao, setSelectedMovimentacao] = useState<MovimentacaoFinanceira | null>(null);
  const [error, setError] = useState<string>('');

  // Buscar opções de imóveis
  const { options: imoveisOptions, isLoading: isLoadingImoveis } = useImoveisOptions();

  // Query para buscar todas as movimentações
  const {
    data: movimentacoes = [],
    isLoading,
  } = useQuery({
    queryKey: ['movimentacoes'],
    queryFn: () => movimentacaoApi.getAll(),
  });

  // Mutation para excluir movimentação
  const deleteMutation = useMutation({
    mutationFn: (id: string) => movimentacaoApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
      setDeleteDialogOpen(false);
      setError('');
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
    },
  });

  // Mutation para registrar pagamento
  const pagarMutation = useMutation({
    mutationFn: (id: string) => movimentacaoApi.pagar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
      setPagarDialogOpen(false);
      setError('');
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
    },
  });

  // Mutation para registrar recebimento
  const receberMutation = useMutation({
    mutationFn: (id: string) => movimentacaoApi.receber(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
      setReceberDialogOpen(false);
      setError('');
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
    },
  });

  // Mutation para registrar cancelamento
  const cancelarMutation = useMutation({
    mutationFn: (id: string) => movimentacaoApi.cancelar(id),
    onSuccess: () => {    
      queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
      setCancelarDialogOpen(false);
      setError('');
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
    },
  });

  // Filtrar movimentações localmente
  const filteredMovimentacoes = movimentacoes.filter((movimentacao) => {
    const matchesSearch = 
      movimentacao.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movimentacao.imovelTitulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    
    const matchesImovel = !filters.imovelId || movimentacao.imovelId === filters.imovelId;
    const matchesTipo = !filters.tipo || movimentacao.tipo === filters.tipo;
    const matchesCategoria = !filters.categoria || movimentacao.categoria === filters.categoria;
    const matchesStatus = !filters.status || movimentacao.status === filters.status;
    
    return matchesSearch && matchesImovel && matchesTipo && matchesCategoria && matchesStatus;
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleAddNew = () => {
    navigate('/movimentacoes/novo');
  };

  const handleEdit = (id: string) => {
    navigate(`/movimentacoes/editar/${id}`);
  };

  const handleView = (movimentacao: MovimentacaoFinanceira) => {
    setSelectedMovimentacao(movimentacao);
    setViewDialogOpen(true);
  };

  const handleDelete = (movimentacao: MovimentacaoFinanceira) => {
    setSelectedMovimentacao(movimentacao);
    setDeleteDialogOpen(true);
  };

  const handlePagar = (movimentacao: MovimentacaoFinanceira) => {
    setSelectedMovimentacao(movimentacao);
    setPagarDialogOpen(true);
  };

  const handleReceber = (movimentacao: MovimentacaoFinanceira) => {
    setSelectedMovimentacao(movimentacao);
    setReceberDialogOpen(true);
  };

  const handleCancelar = (movimentacao: MovimentacaoFinanceira) => {
    setSelectedMovimentacao(movimentacao);
    setCancelarDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedMovimentacao) {
      deleteMutation.mutate(selectedMovimentacao.id);
    }
  };

  const confirmPagar = () => {
    if (selectedMovimentacao) {
      pagarMutation.mutate(selectedMovimentacao.id);
    }
  };

  const confirmReceber = () => {
    if (selectedMovimentacao) {
      receberMutation.mutate(selectedMovimentacao.id);
    }
  };

  const confirmCancelar = () => {
    if (selectedMovimentacao) {
      cancelarMutation.mutate(selectedMovimentacao.id);
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

  const getTipoColor = (tipo: TipoMovimentacao) => {
    return tipo === 'Receita' ? 'success' : 'error';
  };

  const getStatusIcon = (status: StatusMovimentacao) => {
    switch (status) {
      case 'Pendente':
        return <PendenteIcon />;
      case 'Pago':
      case 'Recebido':
        return <PagoIcon />;
      case 'Cancelado':
        return <CanceladoIcon />;
      default:
        return undefined;
    }
  };

  const getStatusColor = (status: StatusMovimentacao): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'Pendente':
        return 'warning';
      case 'Pago':
      case 'Recebido':
        return 'success';
      case 'Cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  // Opções para filtros
  const tipoOptions = [
    { value: '', label: 'Todos' },
    { value: 'Despesa', label: 'Despesa' },
    { value: 'Receita', label: 'Receita' },
  ];

  const categoriaOptions = [
    { value: '', label: 'Todas' },
    { value: 'Manutencao', label: 'Manutenção' },
    { value: 'IPTU', label: 'IPTU' },
    { value: 'Seguro', label: 'Seguro' },
    { value: 'Outros', label: 'Outros' },
  ];

  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Pago', label: 'Pago' },
    { value: 'Recebido', label: 'Recebido' },
    { value: 'Cancelado', label: 'Cancelado' },
  ];

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Movimentações Financeiras</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Nova Movimentação
        </Button>
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
              placeholder="Pesquisar por descrição ou imóvel..."
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
              <InputLabel>Imóvel</InputLabel>
              <Select
                value={filters.imovelId}
                onChange={(e) => handleFilterChange('imovelId', e.target.value)}
                label="Imóvel"
                disabled={isLoadingImoveis}
              >
                <MenuItem value="">Todos</MenuItem>
                {imoveisOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box flex={1}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={filters.tipo}
                onChange={(e) => handleFilterChange('tipo', e.target.value)}
                label="Tipo"
              >
                {tipoOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box flex={1}>
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={filters.categoria}
                onChange={(e) => handleFilterChange('categoria', e.target.value)}
                label="Categoria"
              >
                {categoriaOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
        </Box>
      </Paper>

      {/* Lista de Movimentações */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : filteredMovimentacoes.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm || filters.imovelId || filters.tipo || filters.categoria || filters.status
              ? 'Nenhuma movimentação encontrada com os critérios de busca.'
              : 'Ainda não possui nenhuma movimentação cadastrada.'}
          </Typography>
          {!searchTerm && !filters.imovelId && !filters.tipo && !filters.categoria && !filters.status && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{ mt: 2 }}
            >
              Cadastrar Primeira Movimentação
            </Button>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Imóvel</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMovimentacoes.map((movimentacao) => (
                <TableRow key={movimentacao.id}>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(movimentacao.data)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">{movimentacao.descricao}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{movimentacao.imovelTitulo || 'Não vinculado'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={movimentacao.tipo}
                      color={getTipoColor(movimentacao.tipo)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{movimentacao.categoria}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      fontWeight="medium"
                      color={movimentacao.tipo === 'Receita' ? 'success.main' : 'error.main'}
                    >
                      {formatCurrency(movimentacao.valor)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(movimentacao.status)}
                      label={movimentacao.status}
                      color={getStatusColor(movimentacao.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleView(movimentacao)}
                      title="Visualizar"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(movimentacao.id)}
                      title="Editar"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    
                    {/* Botão de Pagar (apenas para Despesas Pendentes) */}
                    {movimentacao.status === 'Pendente' && movimentacao.tipo === 'Despesa' && (
                      <IconButton
                        size="small"
                        onClick={() => handlePagar(movimentacao)}
                        title="Registrar Pagamento"
                        color="primary"
                      >
                        <MoneyIcon fontSize="small" />
                      </IconButton>
                    )}
                    
                    {/* Botão de Receber (apenas para Receitas Pendentes) */}
                    {movimentacao.status === 'Pendente' && movimentacao.tipo === 'Receita' && (
                      <IconButton
                        size="small"
                        onClick={() => handleReceber(movimentacao)}
                        title="Registrar Recebimento"
                        color="success"
                      >
                        <ReceiptIcon fontSize="small" />
                      </IconButton>
                    )}
                    
                    {/* Botão de Cancelar (apenas para Pendentes) */}
                    {movimentacao.status === 'Pendente' && (
                      <IconButton
                        size="small"
                        onClick={() => handleCancelar(movimentacao)}
                        title="Cancelar Movimentação"
                        color="warning"
                      >
                        <CanceladoIcon fontSize="small" />
                      </IconButton>
                    )}
                    
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(movimentacao)}
                      title="Excluir"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog de Visualização */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalhes da Movimentação</DialogTitle>
        <DialogContent>
          {selectedMovimentacao && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Movimentação #{selectedMovimentacao.id.substring(0, 8)}...
              </Typography>
              
              <Box display="flex" gap={3} mb={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Imóvel
                  </Typography>
                  <Typography>{selectedMovimentacao.imovelTitulo || 'Não vinculado'}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Data
                  </Typography>
                  <Typography>{formatDate(selectedMovimentacao.data)}</Typography>
                </Box>
              </Box>

              <Box display="flex" gap={3} mb={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tipo
                  </Typography>
                  <Chip
                    label={selectedMovimentacao.tipo}
                    color={getTipoColor(selectedMovimentacao.tipo)}
                  />
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Categoria
                  </Typography>
                  <Typography>{selectedMovimentacao.categoria}</Typography>
                </Box>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Descrição
                </Typography>
                <Typography>{selectedMovimentacao.descricao}</Typography>
              </Box>

              <Box display="flex" gap={3} mb={2}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Valor
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color={selectedMovimentacao.tipo === 'Receita' ? 'success.main' : 'error.main'}
                  >
                    {formatCurrency(selectedMovimentacao.valor)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Status
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedMovimentacao.status)}
                    label={selectedMovimentacao.status}
                    color={getStatusColor(selectedMovimentacao.status)}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Cadastrado em
                </Typography>
                <Typography>{formatDate(selectedMovimentacao.criadoEm)}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a movimentação "{selectedMovimentacao?.descricao}"?
            Esta ação não poderá ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteMutation.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending && <CircularProgress size={20} />}
          >
            {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Pagamento */}
      <Dialog
        open={pagarDialogOpen}
        onClose={() => setPagarDialogOpen(false)}
      >
        <DialogTitle>
          Registrar Pagamento
        </DialogTitle>
        <DialogContent>
          <Typography>
            Confirmar pagamento da movimentação 
            "{selectedMovimentacao?.descricao}" no valor de {selectedMovimentacao && formatCurrency(selectedMovimentacao.valor)}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPagarDialogOpen(false)} disabled={pagarMutation.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={confirmPagar}
            color="primary"
            variant="contained"
            disabled={pagarMutation.isPending}
            startIcon={pagarMutation.isPending && <CircularProgress size={20} />}
          >
            {pagarMutation.isPending ? 'Processando...' : 'Confirmar Pagamento'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Recebimento */}
      <Dialog
        open={receberDialogOpen}
        onClose={() => setReceberDialogOpen(false)}
      >
        <DialogTitle>
          Registrar Recebimento
        </DialogTitle>
        <DialogContent>
          <Typography>
            Confirmar recebimento da movimentação 
            "{selectedMovimentacao?.descricao}" no valor de {selectedMovimentacao && formatCurrency(selectedMovimentacao.valor)}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceberDialogOpen(false)} disabled={receberMutation.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={confirmReceber}
            color="success"
            variant="contained"
            disabled={receberMutation.isPending}
            startIcon={receberMutation.isPending && <CircularProgress size={20} />}
          >
            {receberMutation.isPending ? 'Processando...' : 'Confirmar Recebimento'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Cancelamento */}
      <Dialog
        open={cancelarDialogOpen}
        onClose={() => setCancelarDialogOpen(false)}
      >
        <DialogTitle>
          Cancelar Movimentação
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja cancelar a movimentação 
            "{selectedMovimentacao?.descricao}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta ação marcará a movimentação como cancelada.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelarDialogOpen(false)} disabled={cancelarMutation.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={confirmCancelar}
            color="warning"
            variant="contained"
            disabled={cancelarMutation.isPending}
            startIcon={cancelarMutation.isPending && <CircularProgress size={20} />}
          >
            {cancelarMutation.isPending ? 'Processando...' : 'Confirmar Cancelamento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MovimentacoesPage;