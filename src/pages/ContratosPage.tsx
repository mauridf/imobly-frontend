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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CheckCircle as AtivoIcon,
  Cancel as EncerradoIcon,
  Pause as PauseIcon, // Corrigido o import
  Close as CloseIcon,
  PlayArrow as ReativarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contratoApi, contratoQueries } from '@/api/contratoApi';
import { Contrato, ContratoStatus } from '@/types/contrato';
import { extractErrorMessage } from '@/utils/errorHandler';

function ContratosPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [error, setError] = useState<string>('');

  // Query para buscar contratos
  const {
    data: contratos = [],
    isLoading,
  } = useQuery(contratoQueries.all());

  // Mutations para ações
  const deleteMutation = useMutation({
    mutationFn: (id: string) => contratoApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      setDeleteDialogOpen(false);
      setError('');
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
    },
  });

  const encerrarMutation = useMutation({
    mutationFn: (id: string) => contratoApi.encerrar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
    },
  });

  const suspenderMutation = useMutation({
    mutationFn: (id: string) => contratoApi.suspender(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
    },
  });

  const reativarMutation = useMutation({
    mutationFn: (id: string) => contratoApi.reativar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
    },
  });

  // Filtrar contratos
  const filteredContratos = contratos.filter((contrato) =>
    contrato.imovelTitulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.locatarioNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddNew = () => {
    navigate('/contratos/novo');
  };

  const handleEdit = (id: string) => {
    navigate(`/contratos/editar/${id}`);
  };

  const handleView = (contrato: Contrato) => {
    setSelectedContrato(contrato);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (contrato: Contrato) => {
    setSelectedContrato(contrato);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedContrato) {
      deleteMutation.mutate(selectedContrato.id);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedContrato(null);
  };

  const handleEncerrar = (id: string) => {
    encerrarMutation.mutate(id);
  };

  const handleSuspender = (id: string) => {
    suspenderMutation.mutate(id);
  };

  const handleReativar = (id: string) => {
    reativarMutation.mutate(id);
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

  const getStatusIcon = (status: ContratoStatus) => {
    switch (status) {
      case 'Ativo':
        return <AtivoIcon />;
      case 'Encerrado':
        return <EncerradoIcon />;
      case 'Suspenso':
        return <PauseIcon />;
      default:
        return undefined;
    }
  };

  const getStatusColor = (status: ContratoStatus): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'Ativo':
        return 'success';
      case 'Encerrado':
        return 'error';
      case 'Suspenso':
        return 'warning';
      default:
        return 'default';
    }
  };

  const calcularMesesRestantes = (dataFim: string) => {
    const fim = new Date(dataFim);
    const hoje = new Date();
    const diffTime = fim.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.ceil(diffDays / 30));
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Contratos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Novo Contrato
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Pesquisar contratos por imóvel, locatário ou status..."
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
      </Paper>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : filteredContratos.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm
              ? 'Nenhum contrato encontrado com os critérios de busca.'
              : 'Ainda não possui nenhum Contrato firmado.'}
          </Typography>
          {!searchTerm && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{ mt: 2 }}
            >
              Firmar Primeiro Contrato
            </Button>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Imóvel</TableCell>
                <TableCell>Locatário</TableCell>
                <TableCell>Período</TableCell>
                <TableCell>Valor Aluguel</TableCell>
                <TableCell>Dia Vencimento</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Meses Restantes</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContratos.map((contrato) => (
                <TableRow key={contrato.id}>
                  <TableCell>
                    <Typography fontWeight="medium">{contrato.imovelTitulo}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{contrato.locatarioNome}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(contrato.dataInicio)} - {formatDate(contrato.dataFim)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">
                      {formatCurrency(contrato.valorAluguel)}
                    </Typography>
                    {contrato.valorSeguro > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        + {formatCurrency(contrato.valorSeguro)} seguro
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      Dia {contrato.diaVencimento}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(contrato.status)}
                      label={contrato.status}
                      color={getStatusColor(contrato.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {calcularMesesRestantes(contrato.dataFim)} meses
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleView(contrato)}
                      title="Visualizar"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(contrato.id)}
                      title="Editar"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {contrato.status === 'Ativo' && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleEncerrar(contrato.id)}
                          title="Encerrar"
                          color="error"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleSuspender(contrato.id)}
                          title="Suspender"
                          color="warning"
                        >
                          <PauseIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                    {contrato.status === 'Suspenso' && (
                      <IconButton
                        size="small"
                        onClick={() => handleReativar(contrato.id)}
                        title="Reativar"
                        color="success"
                      >
                        <ReativarIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(contrato)}
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

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o contrato entre "{selectedContrato?.imovelTitulo}" e "{selectedContrato?.locatarioNome}"?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteMutation.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending && <CircularProgress size={20} />}
          >
            {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Visualização */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalhes do Contrato</DialogTitle>
        <DialogContent>
          {selectedContrato && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Contrato #{selectedContrato.id.substring(0, 8)}...
              </Typography>
              
              <Box display="flex" gap={3} mb={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Imóvel
                  </Typography>
                  <Typography>{selectedContrato.imovelTitulo}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Locatário
                  </Typography>
                  <Typography>{selectedContrato.locatarioNome}</Typography>
                </Box>
              </Box>

              <Box display="flex" gap={3} mb={2}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Data Início
                  </Typography>
                  <Typography>{formatDate(selectedContrato.dataInicio)}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Data Fim
                  </Typography>
                  <Typography>{formatDate(selectedContrato.dataFim)}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Vencimento
                  </Typography>
                  <Typography>Dia {selectedContrato.diaVencimento}</Typography>
                </Box>
              </Box>

              <Box display="flex" gap={3} mb={2}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Valor Aluguel
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(selectedContrato.valorAluguel)}
                  </Typography>
                </Box>
                {selectedContrato.valorSeguro > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Valor Seguro
                    </Typography>
                    <Typography>
                      {formatCurrency(selectedContrato.valorSeguro)}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Status
                </Typography>
                <Chip
                  icon={getStatusIcon(selectedContrato.status)}
                  label={selectedContrato.status}
                  color={getStatusColor(selectedContrato.status)}
                />
              </Box>

              {selectedContrato.caminhoDocumentoPDF && (
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Documento PDF
                  </Typography>
                  <Typography variant="body2">
                    {selectedContrato.caminhoDocumentoPDF}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Cadastrado em
                </Typography>
                <Typography>{formatDate(selectedContrato.criadoEm)}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ContratosPage;