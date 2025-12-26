import { Typography, Box, Paper } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

function DashboardPage() {
  const { user } = useAuth();

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Bem-vindo, {user?.nome}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Dashboard do sistema Imobly. Aqui serão exibidos os principais 
          indicadores e funcionalidades do sistema.
        </Typography>
      </Paper>
    </Box>
  );
}

export default DashboardPage;