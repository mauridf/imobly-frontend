import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Build as BuildIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { dashboardApi, dashboardQueries } from '@/api/dashboardApi';
import { formatCurrency } from '@/utils/formatters';
import { formatDate } from '@/utils/formatters';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Cores para os gráficos
const CHART_COLORS = {
  receita: '#4CAF50',
  despesa: '#F44336',
  saldo: '#2196F3',
  primary: '#1976D2',
  secondary: '#FF9800',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

function DashboardPage() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [refreshing, setRefreshing] = useState(false);

  // Queries para os dados do dashboard
  const { data: resumo, isLoading: isLoadingResumo } = useQuery({
    queryKey: dashboardQueries.resumo(),
    queryFn: () => dashboardApi.getResumo().then(res => res.data),
  });

  const { data: graficoData, isLoading: isLoadingGrafico } = useQuery({
    queryKey: dashboardQueries.grafico(),
    queryFn: () => dashboardApi.getGraficoReceitaDespesa().then(res => res.data),
  });

  const { data: contratosVencimento, isLoading: isLoadingContratos } = useQuery({
    queryKey: dashboardQueries.contratosVencimento(),
    queryFn: () => dashboardApi.getContratosVencimento().then(res => res.data),
  });

  const { data: manutencoesPendentes, isLoading: isLoadingManutencoes } = useQuery({
    queryKey: dashboardQueries.manutencoesPendentes(),
    queryFn: () => dashboardApi.getManutencoesPendentes().then(res => res.data),
  });

  const { data: estatisticas, isLoading: isLoadingEstatisticas } = useQuery({
    queryKey: dashboardQueries.estatisticas(),
    queryFn: () => dashboardApi.getEstatisticasDetalhadas().then(res => res.data),
  });

  // Função para atualizar todos os dados
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // As queries serão automaticamente refeitas pelo TanStack Query
      // quando invalidadas
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  // Dados para o gráfico de pizza (resumo financeiro)
  const pieChartData = resumo ? [
    { name: 'Receita Mensal', value: resumo.receitaMensal, color: CHART_COLORS.receita },
    { name: 'Despesa Mensal', value: resumo.despesaMensal, color: CHART_COLORS.despesa },
  ] : [];

  const isLoading = isLoadingResumo || isLoadingGrafico || isLoadingContratos || 
                    isLoadingManutencoes || isLoadingEstatisticas;

  return (
    <Box p={isMobile ? 2 : 3}>
      {/* Cabeçalho */}
      <Paper sx={{ p: 3, mb: 3, position: 'relative' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h4" gutterBottom>
              Bem-vindo, {user?.nome}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Dashboard do sistema Imobly - Visão geral do seu negócio imobiliário
            </Typography>
          </Box>
          <Tooltip title="Atualizar dados">
            <IconButton 
              onClick={handleRefresh} 
              disabled={refreshing || isLoading}
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        {isLoading && (
          <LinearProgress sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />
        )}
      </Paper>

      {/* Cards de Resumo */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={3}>
        {/* Total de Imóveis */}
        <Box flex={1}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <HomeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Imóveis</Typography>
              </Box>
              <Typography variant="h4">
                {isLoadingResumo ? '...' : resumo?.totalImoveis || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isLoadingResumo ? '...' : `${resumo?.imoveisAtivos || 0} ativos`}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Locatários e Contratos */}
        <Box flex={1}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Locatários</Typography>
              </Box>
              <Typography variant="h4">
                {isLoadingResumo ? '...' : resumo?.totalLocatarios || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isLoadingResumo ? '...' : `${resumo?.contratosAtivos || 0} contratos ativos`}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Financeiro */}
        <Box flex={1}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <MoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Saldo Mensal</Typography>
              </Box>
              <Typography 
                variant="h4" 
                color={resumo?.saldoMensal && resumo.saldoMensal >= 0 ? 'success.main' : 'error.main'}
              >
                {isLoadingResumo ? '...' : formatCurrency(resumo?.saldoMensal || 0)}
              </Typography>
              <Box display="flex" alignItems="center">
                {resumo?.saldoMensal && resumo.saldoMensal >= 0 ? (
                  <>
                    <ArrowUpIcon color="success" fontSize="small" />
                    <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                      Receita: {formatCurrency(resumo?.receitaMensal || 0)}
                    </Typography>
                  </>
                ) : (
                  <>
                    <ArrowDownIcon color="error" fontSize="small" />
                    <Typography variant="body2" color="error.main" sx={{ ml: 0.5 }}>
                      Despesa: {formatCurrency(resumo?.despesaMensal || 0)}
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Pendências */}
        <Box flex={1}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Pendências</Typography>
              </Box>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Recebimentos:</Typography>
                  <Chip
                    label={isLoadingResumo ? '...' : resumo?.recebimentosPendentes || 0}
                    size="small"
                    color="warning"
                  />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Manutenções:</Typography>
                  <Chip
                    label={isLoadingResumo ? '...' : resumo?.manutencoesPendentes || 0}
                    size="small"
                    color="error"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Gráficos */}
      <Box display="flex" flexDirection={{ xs: 'column', lg: 'row' }} gap={3} mb={3}>
        {/* Gráfico de Receitas vs Despesas */}
        <Box flex={{ xs: 'none', lg: 2 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Receitas vs Despesas (Últimos 6 meses)
            </Typography>
            {isLoadingGrafico ? (
              <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                <CircularProgress />
              </Box>
            ) : graficoData && graficoData.length > 0 ? (
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={graficoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value: number | undefined) => formatCurrency(value ?? 0)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="receita"
                    stroke={CHART_COLORS.receita}
                    strokeWidth={2}
                    name="Receitas"
                  />
                  <Line
                    type="monotone"
                    dataKey="despesa"
                    stroke={CHART_COLORS.despesa}
                    strokeWidth={2}
                    name="Despesas"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                <Typography color="text.secondary">Nenhum dado disponível</Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Gráfico de Pizza - Resumo Financeiro */}
        <Box flex={{ xs: 'none', lg: 1 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Distribuição Financeira Mensal
            </Typography>
            {isLoadingResumo || isLoadingGrafico ? (
              <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                <CircularProgress />
              </Box>
            ) : resumo ? (
              <Box height="90%" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number | undefined) => formatCurrency(value ?? 0)}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <Box mt={2} textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Saldo: {formatCurrency(resumo.saldoMensal)}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                <Typography color="text.secondary">Nenhum dado disponível</Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Tabelas */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={3}>
        {/* Contratos Próximos do Vencimento */}
        <Box flex={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarIcon />
                Contratos Próximos do Vencimento
              </Box>
            </Typography>
            {isLoadingContratos ? (
              <Box display="flex" alignItems="center" justifyContent="center" height={200}>
                <CircularProgress />
              </Box>
            ) : contratosVencimento && contratosVencimento.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Imóvel</TableCell>
                      <TableCell>Locatário</TableCell>
                      <TableCell>Vencimento</TableCell>
                      <TableCell align="right">Dias</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contratosVencimento.slice(0, 5).map((contrato) => (
                      <TableRow key={contrato.id} hover>
                        <TableCell>
                          <Typography variant="body2" noWrap>
                            {contrato.imovelTitulo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap>
                            {contrato.locatarioNome}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(String(contrato.dataFim))}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${contrato.diasParaVencimento} dias`}
                            size="small"
                            color={contrato.diasParaVencimento <= 7 ? 'error' : 
                                   contrato.diasParaVencimento <= 30 ? 'warning' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height={200}>
                <Typography color="text.secondary">
                  Nenhum contrato próximo do vencimento
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Manutenções Pendentes */}
        <Box flex={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <Box display="flex" alignItems="center" gap={1}>
                <BuildIcon />
                Manutenções Pendentes
              </Box>
            </Typography>
            {isLoadingManutencoes ? (
              <Box display="flex" alignItems="center" justifyContent="center" height={200}>
                <CircularProgress />
              </Box>
            ) : manutencoesPendentes && manutencoesPendentes.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Imóvel</TableCell>
                      <TableCell>Descrição</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell align="right">Valor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {manutencoesPendentes.slice(0, 5).map((manutencao) => (
                      <TableRow key={manutencao.id} hover>
                        <TableCell>
                          <Typography variant="body2" noWrap>
                            {manutencao.imovelTitulo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={manutencao.descricao}>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                              {manutencao.descricao}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(String(manutencao.data))}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(manutencao.valor)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height={200}>
                <Typography color="text.secondary">
                  Nenhuma manutenção pendente
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Estatísticas Detalhadas */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          <Box display="flex" alignItems="center" gap={1}>
            <InfoIcon />
            Estatísticas Detalhadas
          </Box>
        </Typography>
        {isLoadingEstatisticas ? (
          <Box display="flex" alignItems="center" justifyContent="center" height={150}>
            <CircularProgress />
          </Box>
        ) : estatisticas ? (
          <Box display="flex" flexWrap="wrap" gap={3} justifyContent="center">
            <Box textAlign="center" minWidth={150}>
              <Typography variant="h4" color="primary.main">
                {formatCurrency(estatisticas.totalRecebidoAno)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Receita Anual
              </Typography>
            </Box>
            <Box textAlign="center" minWidth={150}>
              <Typography variant="h4" color="error.main">
                {formatCurrency(estatisticas.totalDespesasAno)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Despesa Anual
              </Typography>
            </Box>
            <Box textAlign="center" minWidth={150}>
              <Typography 
                variant="h4" 
                color={estatisticas.saldoAno >= 0 ? 'success.main' : 'error.main'}
              >
                {formatCurrency(estatisticas.saldoAno)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Saldo Anual
              </Typography>
            </Box>
            <Box textAlign="center" minWidth={150}>
              <Typography variant="h4">
                {estatisticas.locatariosInadimplentes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Inadimplentes
              </Typography>
            </Box>
            <Box textAlign="center" minWidth={150}>
              <Typography variant="h4" color="error.main">
                {estatisticas.percentualInadimplencia.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Taxa Inadimplência
              </Typography>
            </Box>
            <Box textAlign="center" minWidth={150}>
              <Typography variant="h4" color="warning.main">
                {estatisticas.contratosVencendoProximoMes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contratos a Vencer
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box display="flex" alignItems="center" justifyContent="center" height={150}>
            <Typography color="text.secondary">
              Nenhuma estatística disponível
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default DashboardPage;