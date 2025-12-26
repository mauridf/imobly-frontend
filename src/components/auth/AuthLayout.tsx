import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Box, Container, Paper, Typography } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';

function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <LockOutlined sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          <Typography component="h1" variant="h5" gutterBottom>
            Imobly
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Sistema de Gestão Imobiliária
          </Typography>
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
}

export default AuthLayout;