import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Person as PersonIcon,
  Save as SaveIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';
import { useAuth } from '@/hooks/useAuth';
import {
  updateUserSchema,
  UpdateUserFormData,
  changePasswordSchema,
  ChangePasswordFormData,
} from '@/utils/validationSchemas';
import { extractErrorMessage } from '@/utils/errorHandler';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [profileError, setProfileError] = useState<string>('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string>('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Formulário de perfil
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      nome: user?.nome || '',
      telefone: user?.telefone || '',
    },
  });

  // Formulário de senha
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      senhaAtual: '',
      novaSenha: '',
      confirmarNovaSenha: '',
    },
  });

  // Mutation para atualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateUser,
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      setProfileSuccess(true);
      setProfileError('');
      setTimeout(() => setProfileSuccess(false), 3000);
    },
    onError: (error) => {
      setProfileError(extractErrorMessage(error));
      setProfileSuccess(false);
    },
  });

  // Mutation para alterar senha
  const changePasswordMutation = useMutation({
    mutationFn: authApi.updatePassword,
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordError('');
      resetPassword();
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
    onError: (error) => {
      setPasswordError(extractErrorMessage(error));
      setPasswordSuccess(false);
    },
  });

  // Handler para salvar perfil
  const onSubmitProfile = (data: UpdateUserFormData) => {
    setProfileError('');
    updateProfileMutation.mutate(data);
  };

  // Handler para alterar senha
  const onSubmitPassword = (data: ChangePasswordFormData) => {
    setPasswordError('');
    changePasswordMutation.mutate(data);
  };

  // Reset form quando user mudar
  useEffect(() => {
    if (user) {
      resetProfile({
        nome: user.nome,
        telefone: user.telefone,
      });
    }
  }, [user, resetProfile]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Meu Perfil
      </Typography>

      <Paper sx={{ maxWidth: 800, mx: 'auto' }}>
        <Box display="flex" alignItems="center" p={3}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              mr: 3,
              fontSize: 32,
            }}
          >
            {user?.nome?.charAt(0).toUpperCase() || <PersonIcon />}
          </Avatar>
          <Box>
            <Typography variant="h5">{user?.nome}</Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cadastrado em: {new Date(user?.criadoEm || '').toLocaleDateString('pt-BR')}
            </Typography>
          </Box>
        </Box>

        <Divider />

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Informações Pessoais" />
            <Tab label="Alterar Senha" />
          </Tabs>
        </Box>

        {/* Tab 1: Informações Pessoais */}
        <TabPanel value={activeTab} index={0}>
          {profileError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {profileError}
            </Alert>
          )}

          {profileSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Perfil atualizado com sucesso!
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmitProfile(onSubmitProfile)}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  {...registerProfile('nome')}
                  label="Nome completo"
                  fullWidth
                  error={!!profileErrors.nome}
                  helperText={profileErrors.nome?.message}
                  disabled={updateProfileMutation.isPending}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  {...registerProfile('telefone')}
                  label="Telefone"
                  fullWidth
                  error={!!profileErrors.telefone}
                  helperText={profileErrors.telefone?.message}
                  placeholder="(11) 99999-9999"
                  disabled={updateProfileMutation.isPending}
                />
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                label="Email"
                value={user?.email || ''}
                fullWidth
                disabled
                helperText="Email não pode ser alterado"
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={updateProfileMutation.isPending}
                startIcon={
                  updateProfileMutation.isPending ? (
                    <CircularProgress size={20} />
                  ) : (
                    <SaveIcon />
                  )
                }
              >
                {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Tab 2: Alterar Senha */}
        <TabPanel value={activeTab} index={1}>
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}

          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Senha alterada com sucesso!
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmitPassword(onSubmitPassword)}>
            <Box sx={{ mb: 3 }}>
              <TextField
                {...registerPassword('senhaAtual')}
                label="Senha Atual"
                type="password"
                fullWidth
                error={!!passwordErrors.senhaAtual}
                helperText={passwordErrors.senhaAtual?.message}
                disabled={changePasswordMutation.isPending}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  {...registerPassword('novaSenha')}
                  label="Nova Senha"
                  type="password"
                  fullWidth
                  error={!!passwordErrors.novaSenha}
                  helperText={passwordErrors.novaSenha?.message}
                  disabled={changePasswordMutation.isPending}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  {...registerPassword('confirmarNovaSenha')}
                  label="Confirmar Nova Senha"
                  type="password"
                  fullWidth
                  error={!!passwordErrors.confirmarNovaSenha}
                  helperText={passwordErrors.confirmarNovaSenha?.message}
                  disabled={changePasswordMutation.isPending}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={changePasswordMutation.isPending}
                startIcon={
                  changePasswordMutation.isPending ? (
                    <CircularProgress size={20} />
                  ) : (
                    <LockIcon />
                  )
                }
              >
                {changePasswordMutation.isPending ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}

export default ProfilePage;