import { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
  Divider,
  Typography,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  BuildCircle as BuildIcon,
  AttachMoney as AttachMoneyIcon,
  Money as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Shield as InsuranceIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  drawerWidth: number;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

function Sidebar({ mobileOpen, onDrawerToggle, drawerWidth }: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  // Menu items - serão expandidos conforme formos implementando novas funcionalidades
  const menuItems: MenuItem[] = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
    },
    {
      text: 'Meu Perfil', // Adicionar esta opção
      icon: <PersonIcon />,
      path: '/perfil',
    },
    {
      text: 'Imóveis', // Adicionar esta opção
      icon: <HomeIcon />,
      path: '/imoveis',
    },
    {
      text: 'Locatários',
      icon: <PeopleIcon />,
      path: '/locatarios',
    },
    {
      text: 'Contratos',
      icon: <DescriptionIcon />,
      path: '/contratos',
    },
    {
      text: 'Recebimentos',
      icon: <AttachMoneyIcon />,
      path: '/recebimentos',
    },
    {
      text: 'Movimentações Financeiras',
      icon: <MoneyIcon />,
      path: '/movimentacoes',
    },
    {
      icon: <TrendingUpIcon />,
      text: 'Histórico de Reajustes',
      path: '/reajustes',
    },
    {
      text: 'Manutenções',
      icon: <BuildIcon />,
      path: '/manutencoes',
    },
    {
      text: 'Seguros',
      icon: <InsuranceIcon />,
      path: '/seguros',
    }
  ];

  const handleToggleItem = (text: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [text]: !prev[text],
    }));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      onDrawerToggle();
    }
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems[item.text] || false;
    const active = isActive(item.path);

    return (
      <Box key={item.text}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              if (hasChildren) {
                handleToggleItem(item.text);
              } else if (item.path) {
                handleNavigate(item.path);
              }
            }}
            sx={{
              pl: depth === 0 ? 2 : depth * 3,
              backgroundColor: active
                ? theme.palette.action.selected
                : 'transparent',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: active
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: active ? 600 : 400,
                color: active
                  ? theme.palette.text.primary
                  : theme.palette.text.secondary,
              }}
            />
            {hasChildren && (isOpen ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>

        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  const drawer = (
    <Box>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: theme.palette.primary.main,
          }}
        >
          Imobly
        </Typography>
      </Box>
      <Divider />
      <List sx={{ pt: 2 }}>{menuItems.map((item) => renderMenuItem(item))}</List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}
    </Box>
  );
}

export default Sidebar;