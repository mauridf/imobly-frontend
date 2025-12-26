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
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { imovelApi, imovelQueries } from '@/api/imovelApi';
import { Imovel } from '@/types/imovel';
import { extractErrorMessage } from '@/utils/errorHandler';

function ImoveisPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedImovel, setSelectedImovel] = useState<Imovel | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [error, setError] = useState<string>('');

  // Query para buscar imóveis
  const {
    data: imoveis = [],
    isLoading,
  } = useQuery(imovelQueries.all());

  // Mutation para deletar imóvel
  const deleteMutation = useMutation({
    mutationFn: (id: string) => imovelApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
      setDeleteDialogOpen(false);
      setError('');
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
    },
  });

  // Filtrar imóveis localmente
  const filteredImoveis = imoveis.filter((imovel) =>
    imovel.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    imovel.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    imovel.endereco.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    imovel.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddNew = () => {
    navigate('/imoveis/novo');
  };

  const handleEdit = (id: string) => {
    navigate(`/imoveis/editar/${id}`);
  };

  const handleView = (imovel: Imovel) => {
    setSelectedImovel(imovel);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (imovel: Imovel) => {
    setSelectedImovel(imovel);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedImovel) {
      deleteMutation.mutate(selectedImovel.id);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedImovel(null);
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

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Meus Imóveis</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Novo Imóvel
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
          placeholder="Pesquisar imóveis por título, descrição, cidade ou tipo..."
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
      ) : filteredImoveis.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm
              ? 'Nenhum imóvel encontrado com os critérios de busca.'
              : 'Ainda não possui nenhum imóvel cadastrado.'}
          </Typography>
          {!searchTerm && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{ mt: 2 }}
            >
              Cadastrar Primeiro Imóvel
            </Button>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Localização</TableCell>
                <TableCell>Valor Sugerido</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Cadastrado em</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredImoveis.map((imovel) => (
                <TableRow key={imovel.id}>
                  <TableCell>
                    <Typography fontWeight="medium">{imovel.titulo}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {imovel.descricao.substring(0, 50)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={imovel.tipo} size="small" />
                  </TableCell>
                  <TableCell>
                    {imovel.endereco.cidade} - {imovel.endereco.estado}
                    <Typography variant="body2" color="text.secondary">
                      {imovel.endereco.bairro}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">
                      {formatCurrency(imovel.valorAluguelSugerido)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={imovel.ativo ? <ActiveIcon /> : <InactiveIcon />}
                      label={imovel.ativo ? 'Ativo' : 'Inativo'}
                      color={imovel.ativo ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(imovel.criadoEm)}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleView(imovel)}
                      title="Visualizar"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(imovel.id)}
                      title="Editar"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(imovel)}
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
            Tem certeza que deseja excluir o imóvel "{selectedImovel?.titulo}"?
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
        <DialogTitle>Detalhes do Imóvel</DialogTitle>
        <DialogContent>
          {selectedImovel && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedImovel.titulo}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tipo: {selectedImovel.tipo}
              </Typography>
              <Typography paragraph>
                {selectedImovel.descricao}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                Endereço:
              </Typography>
              <Typography variant="body2">
                {selectedImovel.endereco.logradouro}, {selectedImovel.endereco.numero}
                {selectedImovel.endereco.complemento && `, ${selectedImovel.endereco.complemento}`}
              </Typography>
              <Typography variant="body2">
                {selectedImovel.endereco.bairro} - {selectedImovel.endereco.cidade}/{selectedImovel.endereco.estado}
              </Typography>
              <Typography variant="body2">
                CEP: {selectedImovel.endereco.cep}
              </Typography>

              <Box display="flex" gap={3} mt={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Área</Typography>
                  <Typography>{selectedImovel.areaM2} m²</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Quartos</Typography>
                  <Typography>{selectedImovel.quartos}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Banheiros</Typography>
                  <Typography>{selectedImovel.banheiros}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Vagas</Typography>
                  <Typography>{selectedImovel.vagasGaragem}</Typography>
                </Box>
              </Box>

              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">Valor Sugerido</Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(selectedImovel.valorAluguelSugerido)}
                </Typography>
              </Box>

              <Box mt={2}>
                <Chip
                  icon={selectedImovel.ativo ? <ActiveIcon /> : <InactiveIcon />}
                  label={selectedImovel.ativo ? 'Ativo' : 'Inativo'}
                  color={selectedImovel.ativo ? 'success' : 'error'}
                />
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

export default ImoveisPage;