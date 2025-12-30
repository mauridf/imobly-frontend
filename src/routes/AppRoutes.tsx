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
const ImoveisPage = lazy(() => import('@/pages/ImoveisPage'));
const LocatariosPage = lazy(() => import('@/pages/LocatariosPage'));
const LocatarioCreatePage = lazy(() => import('@/pages/LocatarioCreatePage'));
const LocatarioEditPage = lazy(() => import('@/pages/LocatarioEditPage'));
const ImovelFormPage = lazy(() => import('@/pages/ImovelFormPage'));
const ContratosPage = lazy(() => import('@/pages/ContratosPage'));
const ContratoCreatePage = lazy(() => import('@/pages/ContratoCreatePage'));
const ContratoEditPage = lazy(() => import('@/pages/ContratoEditPage'));
const RecebimentosPage = lazy(() => import('@/pages/RecebimentosPage'));
const RecebimentoCreatePage = lazy(() => import('@/pages/RecebimentoCreatePage'));
const RecebimentoEditPage = lazy(() => import('@/pages/RecebimentoEditPage'));
const RecebimentoGerarPage = lazy(() => import('@/pages/RecebimentoGerarPage'));
const MovimentacoesPage = lazy(() => import('@/pages/MovimentacoesPage'));
const MovimentacaoCreatePage = lazy(() => import('@/pages/MovimentacoesCreatePage'));
const MovimentacaoEditPage = lazy(() => import('@/pages/MovimentacoesEditPage'));

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
          <Route path="/imoveis" element={<ImoveisPage />} />
          <Route path="/imoveis/novo" element={<ImovelFormPage />} />
          <Route path="/imoveis/editar/:id" element={<ImovelFormPage />} />
          <Route path="/locatarios" element={<LocatariosPage />} />
          <Route path="/locatarios/novo" element={<LocatarioCreatePage />} />
          <Route path="/locatarios/editar/:id" element={<LocatarioEditPage />} />
          <Route path="/contratos" element={<ContratosPage />} />
          <Route path="/contratos/novo" element={<ContratoCreatePage />} />
          <Route path="/contratos/editar/:id" element={<ContratoEditPage />} />
          <Route path="/recebimentos" element={<RecebimentosPage />} />
          <Route path="/recebimentos/novo" element={<RecebimentoCreatePage />} />
          <Route path="/recebimentos/editar/:id" element={<RecebimentoEditPage />} />
          <Route path="/recebimentos/gerar" element={<RecebimentoGerarPage />} />
          <Route path="/movimentacoes" element={<MovimentacoesPage />} />
          <Route path="/movimentacoes/novo" element={<MovimentacaoCreatePage />} />
          <Route path="/movimentacoes/editar/:id" element={<MovimentacaoEditPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Rota padrão */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;