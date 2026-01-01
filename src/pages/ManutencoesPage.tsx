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
  CheckCircle as ConcluirIcon,
  Build as BuildIcon,
  Schedule as PendenteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { manutencaoApi } from '@/api/manutencaoApi';
import { Manutencao, StatusManutencao } from '@/types/manutencoes';
import { extractErrorMessage } from '@/utils/errorHandler';
import { useImoveisOptions } from '@/hooks/useImoveisOptions';
import { formatCurrency } from '@/utils/formatters';
import { formatDate } from '@/utils/formatters';

function ManutencoesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    imovelId: '',
    status: '',
  });
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [concluirDialogOpen, setConcluirDialogOpen] = useState(false);
  const [selectedManutencao, setSelectedManutencao] = useState<Manutencao | null>(null);
  const [error, setError] = useState<string>('');

  // Buscar opções de imóveis
  const { options: imoveisOptions, isLoading: isLoadingImoveis } = useImoveisOptions();

  // Query para buscar todas as manutenções
  const {
    data: manutencoes = [],
    isLoading,
  } = useQuery({
    queryKey: ['manutencoes'],
    queryFn: () => manutencaoApi.getAll(),
  });

  // Mutation para excluir manutenção
  const deleteMutation = useMutation({
    mutationFn: (id: string) => manutencaoApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] });
      setDeleteDialogOpen(false);
      setError('');
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
    },
  });

  // Mutation para concluir manutenção
  const concluirMutation = useMutation({
    mutationFn: (id: string) => manutencaoApi.concluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] });
      setConcluirDialogOpen(false);
      setError('');
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
    },
  });

  // Filtrar manutenções
  const filteredManutencoes = manutencoes.filter((manutencao) => {
    const matchesSearch = 
      manutencao.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manutencao.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manutencao.imovelTitulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    
    const matchesImovel = !filters.imovelId || manutencao.imovelId === filters.imovelId;
    const matchesStatus = !filters.status || manutencao.status === filters.status;
    
    return matchesSearch && matchesImovel && matchesStatus;
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleAddNew = () => {
    navigate('/manutencoes/novo');
  };

  const handleEdit = (id: string) => {
    navigate(`/manutencoes/editar/${id}`);
  };

  const handleView = (manutencao: Manutencao) => {
    setSelectedManutencao(manutencao);
    setViewDialogOpen(true);
  };

  const handleDelete = (manutencao: Manutencao) => {
    setSelectedManutencao(manutencao);
    setDeleteDialogOpen(true);
  };

  const handleConcluir = (manutencao: Manutencao) => {
    setSelectedManutencao(manutencao);
    setConcluirDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedManutencao) {
      deleteMutation.mutate(selectedManutencao.id);
    }
  };

  const confirmConcluir = () => {
    if (selectedManutencao) {
      concluirMutation.mutate(selectedManutencao.id);
    }
  };

  const getStatusIcon = (status: StatusManutencao) => {
    switch (status) {
      case 'Pendente':
        return <PendenteIcon />;
      case 'Feito':
        return <ConcluirIcon />;
      default:
        return <BuildIcon />;
    }
  };

  const getStatusColor = (status: StatusManutencao) => {
    switch (status) {
      case 'Pendente':
        return 'warning';
      case 'Feito':
        return 'success';
      default:
        return 'default';
    }
  };

  // Opções para filtros
  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Feito', label: 'Feito' },
  ];

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Manutenções
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Nova Manutenção
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
              placeholder="Pesquisar por descrição, responsável ou imóvel..."
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

      {/* Lista de Manutenções */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : filteredManutencoes.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm || filters.imovelId || filters.status
              ? 'Nenhuma manutenção encontrada com os critérios de busca.'
              : 'Ainda não possui nenhuma manutenção cadastrada.'}
          </Typography>
          {!searchTerm && !filters.imovelId && !filters.status && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{ mt: 2 }}
            >
              Cadastrar Primeira Manutenção
            </Button>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Imóvel</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Responsável</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredManutencoes.map((manutencao) => (
                <TableRow key={manutencao.id}>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(manutencao.data)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography fontWeight="medium">
                        {manutencao.imovelTitulo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {manutencao.imovelEndereco}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography>{manutencao.descricao}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{manutencao.responsavel}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">
                      {formatCurrency(manutencao.valor)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(manutencao.status)}
                      label={manutencao.status}
                      color={getStatusColor(manutencao.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleView(manutencao)}
                      title="Visualizar"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(manutencao.id)}
                      title="Editar"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {manutencao.status === 'Pendente' && (
                      <IconButton
                        size="small"
                        onClick={() => handleConcluir(manutencao)}
                        title="Marcar como Feito"
                        color="success"
                      >
                        <ConcluirIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(manutencao)}
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
        <DialogTitle>Detalhes da Manutenção</DialogTitle>
        <DialogContent>
          {selectedManutencao && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Manutenção #{selectedManutencao.id.substring(0, 8)}...
              </Typography>
              
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Imóvel
                </Typography>
                <Typography>
                  <strong>{selectedManutencao.imovelTitulo}</strong>
                  {selectedManutencao.imovelEndereco && (
                    <Typography variant="body2" color="text.secondary">
                      {selectedManutencao.imovelEndereco}
                    </Typography>
                  )}
                </Typography>
              </Box>

              <Box display="flex" gap={3} mb={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Data
                  </Typography>
                  <Typography>{formatDate(selectedManutencao.data)}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Responsável
                  </Typography>
                  <Typography>{selectedManutencao.responsavel}</Typography>
                </Box>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Descrição
                </Typography>
                <Typography>{selectedManutencao.descricao}</Typography>
              </Box>

              <Box display="flex" gap={3} mb={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Valor
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(selectedManutencao.valor)}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Status
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedManutencao.status)}
                    label={selectedManutencao.status}
                    color={getStatusColor(selectedManutencao.status)}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Cadastrado em
                </Typography>
                <Typography>{formatDate(selectedManutencao.criadoEm)}</Typography>
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
            Tem certeza que deseja excluir a manutenção "{selectedManutencao?.descricao}"?
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

      {/* Dialog de Confirmação de Conclusão */}
      <Dialog
        open={concluirDialogOpen}
        onClose={() => setConcluirDialogOpen(false)}
      >
        <DialogTitle>
          <ConcluirIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Concluir Manutenção
        </DialogTitle>
        <DialogContent>
          <Typography>
            Confirmar conclusão da manutenção "{selectedManutencao?.descricao}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta ação marcará a manutenção como "Feito".
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConcluirDialogOpen(false)} disabled={concluirMutation.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={confirmConcluir}
            color="success"
            variant="contained"
            disabled={concluirMutation.isPending}
            startIcon={concluirMutation.isPending && <CircularProgress size={20} />}
          >
            {concluirMutation.isPending ? 'Processando...' : 'Confirmar Conclusão'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ManutencoesPage;