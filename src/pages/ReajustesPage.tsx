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
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reajusteApi } from '@/api/reajusteApi';
import { HistoricoReajuste } from '@/types/reajustes';
import { extractErrorMessage } from '@/utils/errorHandler';
import { useContratosOptions } from '@/hooks/useContratosOptions';
import { formatCurrency, formatDate } from '../utils/formatters';

function ReajustesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    contratoId: '',
    indiceUtilizado: '',
  });
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReajuste, setSelectedReajuste] = useState<HistoricoReajuste | null>(null);
  const [error, setError] = useState<string>('');

  // Buscar opções de contratos
  const { options: contratosOptions, isLoading: isLoadingContratos } = useContratosOptions();

  // Query para buscar todos os reajustes
  const {
    data: reajustes = [],
    isLoading,
  } = useQuery({
    queryKey: ['reajustes'],
    queryFn: () => reajusteApi.getAll(),
  });

  // Mutation para excluir reajuste
  const deleteMutation = useMutation({
    mutationFn: (id: string) => reajusteApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reajustes'] });
      setDeleteDialogOpen(false);
      setError('');
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
    },
  });

  // Filtrar reajustes
  const filteredReajustes = reajustes.filter((reajuste) => {
    const matchesSearch = 
      reajuste.indiceUtilizado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reajuste.contratoDescricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reajuste.imovelTitulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reajuste.locatarioNome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    
    const matchesContrato = !filters.contratoId || reajuste.contratoId === filters.contratoId;
    const matchesIndice = !filters.indiceUtilizado || reajuste.indiceUtilizado === filters.indiceUtilizado;
    
    return matchesSearch && matchesContrato && matchesIndice;
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleAddNew = () => {
    navigate('/reajustes/novo');
  };

  const handleEdit = (id: string) => {
    navigate(`/reajustes/editar/${id}`);
  };

  const handleView = (reajuste: HistoricoReajuste) => {
    setSelectedReajuste(reajuste);
    setViewDialogOpen(true);
  };

  const handleDelete = (reajuste: HistoricoReajuste) => {
    setSelectedReajuste(reajuste);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedReajuste) {
      deleteMutation.mutate(selectedReajuste.id);
    }
  };

  const calculatePercentual = (valorAnterior: number, valorNovo: number) => {
    if (valorAnterior === 0) return 0;
    return ((valorNovo - valorAnterior) / valorAnterior) * 100;
  };

  const getPercentualColor = (percentual: number) => {
    return percentual >= 0 ? 'success.main' : 'error.main';
  };

  // Opções de índice para filtro
  const indiceOptions = [
    { value: '', label: 'Todos' },
    { value: 'IPCA', label: 'IPCA' },
    { value: 'IGPM', label: 'IGP-M' },
    { value: 'INCC', label: 'INCC' },
    { value: 'IPC', label: 'IPC' },
    { value: 'Customizado', label: 'Customizado' },
  ];

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Histórico de Reajustes</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Novo Reajuste
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
          <Box flex={2}>
            <TextField
              fullWidth
              placeholder="Pesquisar por índice, imóvel ou locatário..."
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
              <InputLabel>Contrato</InputLabel>
              <Select
                value={filters.contratoId}
                onChange={(e) => handleFilterChange('contratoId', e.target.value)}
                label="Contrato"
                disabled={isLoadingContratos}
              >
                <MenuItem value="">Todos</MenuItem>
                {contratosOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box flex={1}>
            <FormControl fullWidth>
              <InputLabel>Índice</InputLabel>
              <Select
                value={filters.indiceUtilizado}
                onChange={(e) => handleFilterChange('indiceUtilizado', e.target.value)}
                label="Índice"
              >
                {indiceOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* Lista de Reajustes */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : filteredReajustes.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm || filters.contratoId || filters.indiceUtilizado
              ? 'Nenhum reajuste encontrado com os critérios de busca.'
              : 'Ainda não possui nenhum reajuste cadastrado.'}
          </Typography>
          {!searchTerm && !filters.contratoId && !filters.indiceUtilizado && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{ mt: 2 }}
            >
              Cadastrar Primeiro Reajuste
            </Button>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data Reajuste</TableCell>
                <TableCell>Contrato</TableCell>
                <TableCell>Índice</TableCell>
                <TableCell>Valor Anterior</TableCell>
                <TableCell>Valor Novo</TableCell>
                <TableCell>Variação</TableCell>
                <TableCell>Cadastrado em</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReajustes.map((reajuste) => {
                const percentual = calculatePercentual(reajuste.valorAnterior, reajuste.valorNovo);
                return (
                  <TableRow key={reajuste.id}>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(reajuste.dataReajuste)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography fontWeight="medium">
                          {reajuste.imovelTitulo || 'Imóvel não informado'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {reajuste.locatarioNome || 'Locatário não informado'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={reajuste.indiceUtilizado}
                        icon={<TrendingUpIcon />}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography>
                        {formatCurrency(reajuste.valorAnterior)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {formatCurrency(reajuste.valorNovo)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        color={getPercentualColor(percentual)}
                        fontWeight="medium"
                      >
                        {percentual > 0 ? '+' : ''}{percentual.toFixed(2)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(reajuste.criadoEm)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleView(reajuste)}
                        title="Visualizar"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(reajuste.id)}
                        title="Editar"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(reajuste)}
                        title="Excluir"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
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
        <DialogTitle>Detalhes do Reajuste</DialogTitle>
        <DialogContent>
          {selectedReajuste && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Reajuste #{selectedReajuste.id.substring(0, 8)}...
              </Typography>
              
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Contrato
                </Typography>
                <Box display="flex" flexDirection="column" gap={0.5}>
                  <Typography>
                    <strong>Imóvel:</strong> {selectedReajuste.imovelTitulo || 'Não informado'}
                  </Typography>
                  <Typography>
                    <strong>Locatário:</strong> {selectedReajuste.locatarioNome || 'Não informado'}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" gap={3} mb={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Índice Utilizado
                  </Typography>
                  <Chip
                    label={selectedReajuste.indiceUtilizado}
                    icon={<TrendingUpIcon />}
                  />
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Data do Reajuste
                  </Typography>
                  <Typography>{formatDate(selectedReajuste.dataReajuste)}</Typography>
                </Box>
              </Box>

              <Box display="flex" gap={3} mb={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Valor Anterior
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(selectedReajuste.valorAnterior)}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Valor Novo
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {formatCurrency(selectedReajuste.valorNovo)}
                  </Typography>
                </Box>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Variação
                </Typography>
                {(() => {
                  const percentual = calculatePercentual(
                    selectedReajuste.valorAnterior,
                    selectedReajuste.valorNovo
                  );
                  return (
                    <Typography 
                      variant="h5" 
                      color={getPercentualColor(percentual)}
                      fontWeight="bold"
                    >
                      {percentual > 0 ? '+' : ''}{percentual.toFixed(2)}%
                    </Typography>
                  );
                })()}
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Cadastrado em
                </Typography>
                <Typography>{formatDate(selectedReajuste.criadoEm)}</Typography>
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
            Tem certeza que deseja excluir o reajuste do dia {selectedReajuste && formatDate(selectedReajuste.dataReajuste)}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
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
    </Box>
  );
}

export default ReajustesPage;