import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PrivateRoute from './PrivateRoute';
import AuthLayout from '@/components/auth/AuthLayout';

// Lazy loading para as páginas
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Rotas públicas com layout de autenticação */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Rotas privadas */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Rota padrão */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;