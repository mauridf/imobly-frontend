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
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Shield as InsuranceIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seguroApi, seguroQueries } from '@/api/seguroApi';
import { Seguro } from '@/types/seguros';
import { extractErrorMessage } from '@/utils/errorHandler';
import { useImoveisOptions } from '@/hooks/useImoveisOptions';
import { formatCurrency } from '@/utils/formatters';
import { formatDate } from '@/utils/formatters';

function SegurosPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    imovelId: '',
    seguradora: '',
  });
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSeguro, setSelectedSeguro] = useState<Seguro | null>(null);
  const [error, setError] = useState<string>('');

  // Buscar opções de imóveis
  const { options: imoveisOptions, isLoading: isLoadingImoveis } = useImoveisOptions();

  // Query para buscar todos os seguros
  const {
    data: seguros = [],
    isLoading,
  } = useQuery({
    queryKey: seguroQueries.list({
      search: searchTerm,
      imovelId: filters.imovelId || undefined,
      seguradora: filters.seguradora || undefined,
    }),
    queryFn: () => seguroApi.listAll({
      search: searchTerm,
      imovelId: filters.imovelId || undefined,
      seguradora: filters.seguradora || undefined,
    }).then(res => res.data),
  });

  // Query para seguros vencendo
  const { data: segurosVencendo = [] } = useQuery({
    queryKey: seguroQueries.vencendo(),
    queryFn: () => seguroApi.getVencendoProximos30Dias().then(res => res.data),
  });

  // Mutation para excluir seguro
  const deleteMutation = useMutation({
    mutationFn: (id: string) => seguroApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seguroQueries.lists() });
      queryClient.invalidateQueries({ queryKey: seguroQueries.vencendo() });
      setDeleteDialogOpen(false);
      setError('');
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
    },
  });

  // Filtrar seguros
  const filteredSeguros = seguros.filter((seguro) => {
    const matchesSearch = 
      seguro.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seguro.seguradora.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seguro.apolice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seguro.imovelTitulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    
    const matchesImovel = !filters.imovelId || seguro.imovelId === filters.imovelId;
    const matchesSeguradora = !filters.seguradora || seguro.seguradora === filters.seguradora;
    
    return matchesSearch && matchesImovel && matchesSeguradora;
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleAddNew = () => {
    navigate('/seguros/novo');
  };

  const handleEdit = (id: string) => {
    navigate(`/seguros/editar/${id}`);
  };

  const handleView = (seguro: Seguro) => {
    setSelectedSeguro(seguro);
    setViewDialogOpen(true);
  };

  const handleDelete = (seguro: Seguro) => {
    setSelectedSeguro(seguro);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedSeguro) {
      deleteMutation.mutate(selectedSeguro.id);
    }
  };

  // Verificar status do seguro
  const getSeguroStatus = (seguro: Seguro) => {
    const hoje = new Date();
    const dataFim = new Date(String(seguro.dataFim));
    const diffTime = dataFim.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'Vencido', color: 'error' as const, icon: <WarningIcon /> };
    } else if (diffDays <= 30) {
      return { status: 'Vence em breve', color: 'warning' as const, icon: <WarningIcon /> };
    } else {
      return { status: 'Vigente', color: 'success' as const, icon: <InsuranceIcon /> };
    }
  };

  // Opções para filtros
  const seguradoraOptions = Array.from(
    new Set(seguros.map(seguro => seguro.seguradora).filter(Boolean))
  ).map(seguradora => ({
    value: seguradora,
    label: seguradora,
  }));

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          <InsuranceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Seguros do Imóvel
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Novo Seguro
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Alerta para seguros vencendo */}
      {segurosVencendo.length > 0 && (
        <Alert 
          severity="warning" 
          icon={<WarningIcon />}
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle2" gutterBottom>
            <strong>Atenção:</strong> {segurosVencendo.length} seguro(s) vence(m) nos próximos 30 dias
          </Typography>
          {segurosVencendo.slice(0, 2).map(seguro => (
            <Typography key={seguro.id} variant="body2">
              • {seguro.descricao} - Vence em {formatDate(String(seguro.dataFim))}
            </Typography>
          ))}
          {segurosVencendo.length > 2 && (
            <Typography variant="body2">
              ... e mais {segurosVencendo.length - 2} seguro(s)
            </Typography>
          )}
        </Alert>
      )}

      {/* Filtros */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
          <Box flex={2}>
            <TextField
              fullWidth
              placeholder="Pesquisar por descrição, seguradora, apólice ou imóvel..."
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
              <InputLabel>Seguradora</InputLabel>
              <Select
                value={filters.seguradora}
                onChange={(e) => handleFilterChange('seguradora', e.target.value)}
                label="Seguradora"
              >
                <MenuItem value="">Todas</MenuItem>
                {seguradoraOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* Lista de Seguros */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : filteredSeguros.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm || filters.imovelId || filters.seguradora
              ? 'Nenhum seguro encontrado com os critérios de busca.'
              : 'Ainda não possui nenhum seguro cadastrado.'}
          </Typography>
          {!searchTerm && !filters.imovelId && !filters.seguradora && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{ mt: 2 }}
            >
              Cadastrar Primeiro Seguro
            </Button>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Imóvel</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Seguradora</TableCell>
                <TableCell>Apólice</TableCell>
                <TableCell>Vigência</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSeguros.map((seguro) => {
                const statusInfo = getSeguroStatus(seguro);
                return (
                  <TableRow key={seguro.id}>
                    <TableCell>
                      <Box>
                        <Typography fontWeight="medium">
                          {seguro.imovelTitulo}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography>{seguro.descricao}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>{seguro.seguradora}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {seguro.apolice}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          <CalendarIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                          Início: {formatDate(String(seguro.dataInicio))}
                        </Typography>
                        <Typography variant="body2">
                          <CalendarIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                          Fim: {formatDate(String(seguro.dataFim))}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {formatCurrency(seguro.valor)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={statusInfo.icon}
                        label={statusInfo.status}
                        color={statusInfo.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleView(seguro)}
                        title="Visualizar"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(seguro.id)}
                        title="Editar"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(seguro)}
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
        <DialogTitle>Detalhes do Seguro</DialogTitle>
        <DialogContent>
          {selectedSeguro && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Seguro #{selectedSeguro.id.substring(0, 8)}...
              </Typography>
              
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Imóvel
                </Typography>
                <Typography>
                  <strong>{selectedSeguro.imovelTitulo}</strong>
                </Typography>
              </Box>

              <Box display="flex" gap={3} mb={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Descrição
                  </Typography>
                  <Typography>{selectedSeguro.descricao}</Typography>
                </Box>
              </Box>

              <Box display="flex" gap={3} mb={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Seguradora
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <BusinessIcon fontSize="small" />
                    <Typography>{selectedSeguro.seguradora}</Typography>
                  </Box>
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Apólice
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <DescriptionIcon fontSize="small" />
                    <Typography fontFamily="monospace">{selectedSeguro.apolice}</Typography>
                  </Box>
                </Box>
              </Box>

              <Box display="flex" gap={3} mb={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Vigência
                  </Typography>
                  <Box>
                    <Typography variant="body2">
                      <CalendarIcon sx={{ fontSize: 14, mr: 1, verticalAlign: 'middle' }} />
                      Início: {formatDate(String(selectedSeguro.dataInicio))}
                    </Typography>
                    <Typography variant="body2">
                      <CalendarIcon sx={{ fontSize: 14, mr: 1, verticalAlign: 'middle' }} />
                      Fim: {formatDate(String(selectedSeguro.dataFim))}
                    </Typography>
                  </Box>
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Status
                  </Typography>
                  {(() => {
                    const statusInfo = getSeguroStatus(selectedSeguro);
                    return (
                      <Chip
                        icon={statusInfo.icon}
                        label={statusInfo.status}
                        color={statusInfo.color}
                      />
                    );
                  })()}
                </Box>
              </Box>

              <Box display="flex" gap={3} mb={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Valor
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(selectedSeguro.valor)}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Cadastrado em
                  </Typography>
                  <Typography>{formatDate(String(selectedSeguro.criadoEm))}</Typography>
                </Box>
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
            Tem certeza que deseja excluir o seguro "{selectedSeguro?.descricao}"?
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

export default SegurosPage;