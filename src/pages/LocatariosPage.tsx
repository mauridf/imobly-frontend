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
  CheckCircle as AdimplenteIcon,
  Cancel as InadimplenteIcon,
  Paid as PaidIcon,
  MoneyOff as MoneyOffIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locatarioApi, locatarioQueries } from '@/api/locatarioApi';
import { Locatario } from '@/types/locatario';
import { extractErrorMessage } from '@/utils/errorHandler';

function LocatariosPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLocatario, setSelectedLocatario] = useState<Locatario | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [error, setError] = useState<string>('');

  // Query para buscar locatários
  const {
    data: locatarios = [],
    isLoading,
  } = useQuery(locatarioQueries.all());

  // Mutation para deletar locatário
  const deleteMutation = useMutation({
    mutationFn: (id: string) => locatarioApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locatarios'] });
      setDeleteDialogOpen(false);
      setError('');
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
    },
  });

  // Mutation para marcar como adimplente
  const adimplenteMutation = useMutation({
    mutationFn: (id: string) => locatarioApi.markAsAdimplente(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locatarios'] });
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
    },
  });

  // Mutation para marcar como inadimplente
  const inadimplenteMutation = useMutation({
    mutationFn: (id: string) => locatarioApi.markAsInadimplente(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locatarios'] });
    },
    onError: (error) => {
      setError(extractErrorMessage(error));
    },
  });

  // Filtrar locatários localmente
  const filteredLocatarios = locatarios.filter((locatario) =>
    locatario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    locatario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    locatario.cpf.includes(searchTerm) ||
    locatario.telefone.includes(searchTerm)
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddNew = () => {
  navigate('/locatarios/novo');
};

  const handleEdit = (id: string) => {
  navigate(`/locatarios/editar/${id}`);
};

  const handleView = (locatario: Locatario) => {
    setSelectedLocatario(locatario);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (locatario: Locatario) => {
    setSelectedLocatario(locatario);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedLocatario) {
      deleteMutation.mutate(selectedLocatario.id);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedLocatario(null);
  };

  const handleMarkAdimplente = (id: string) => {
    adimplenteMutation.mutate(id);
  };

  const handleMarkInadimplente = (id: string) => {
    inadimplenteMutation.mutate(id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateAge = (dateString: string) => {
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatTelefone = (telefone: string) => {
    const cleaned = telefone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Locatários</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Novo Locatário
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
          placeholder="Pesquisar locatários por nome, email, CPF ou telefone..."
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
      ) : filteredLocatarios.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm
              ? 'Nenhum locatário encontrado com os critérios de busca.'
              : 'Ainda não possui nenhum locatário cadastrado.'}
          </Typography>
          {!searchTerm && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{ mt: 2 }}
            >
              Cadastrar Primeiro Locatário
            </Button>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>CPF</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Idade</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Cadastrado em</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLocatarios.map((locatario) => (
                <TableRow key={locatario.id}>
                  <TableCell>
                    <Typography fontWeight="medium">{locatario.nome}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatCPF(locatario.cpf)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatTelefone(locatario.telefone)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {locatario.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {calculateAge(locatario.dataNascimento)} anos
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={locatario.status === 'Adimplente' ? <AdimplenteIcon /> : <InadimplenteIcon />}
                      label={locatario.status}
                      color={locatario.status === 'Adimplente' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(locatario.criadoEm)}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleView(locatario)}
                      title="Visualizar"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(locatario.id)}
                      title="Editar"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleMarkAdimplente(locatario.id)}
                      title="Marcar como Adimplente"
                      color="success"
                      disabled={locatario.status === 'Adimplente'}
                    >
                      <PaidIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleMarkInadimplente(locatario.id)}
                      title="Marcar como Inadimplente"
                      color="error"
                      disabled={locatario.status === 'Inadimplente'}
                    >
                      <MoneyOffIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(locatario)}
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
            Tem certeza que deseja excluir o locatário "{selectedLocatario?.nome}"?
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
        <DialogTitle>Detalhes do Locatário</DialogTitle>
        <DialogContent>
          {selectedLocatario && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedLocatario.nome}
              </Typography>
              
              <Box display="flex" gap={3} mb={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">CPF</Typography>
                  <Typography>{formatCPF(selectedLocatario.cpf)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">RG</Typography>
                  <Typography>{selectedLocatario.rg}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Idade</Typography>
                  <Typography>{calculateAge(selectedLocatario.dataNascimento)} anos</Typography>
                </Box>
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Contato:
              </Typography>
              <Typography variant="body2">
                Email: {selectedLocatario.email}
              </Typography>
              <Typography variant="body2">
                Telefone: {formatTelefone(selectedLocatario.telefone)}
              </Typography>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Data de Nascimento:
              </Typography>
              <Typography variant="body2">
                {formatDate(selectedLocatario.dataNascimento)}
              </Typography>

              {selectedLocatario.enderecoLogradouro && (
                <>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Endereço:
                  </Typography>
                  <Typography variant="body2">
                    {selectedLocatario.enderecoLogradouro}, {selectedLocatario.enderecoNumero}
                  </Typography>
                  <Typography variant="body2">
                    {selectedLocatario.enderecoBairro} - {selectedLocatario.enderecoCidade}/{selectedLocatario.enderecoEstado}
                  </Typography>
                  <Typography variant="body2">
                    CEP: {selectedLocatario.enderecoCEP}
                  </Typography>
                </>
              )}

              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip
                  icon={selectedLocatario.status === 'Adimplente' ? <AdimplenteIcon /> : <InadimplenteIcon />}
                  label={selectedLocatario.status}
                  color={selectedLocatario.status === 'Adimplente' ? 'success' : 'error'}
                  sx={{ mt: 1 }}
                />
              </Box>

              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">Cadastrado em</Typography>
                <Typography>{formatDate(selectedLocatario.criadoEm)}</Typography>
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

export default LocatariosPage;