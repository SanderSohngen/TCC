import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Stack,
  IconButton,
  useMediaQuery,
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDownIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useState } from 'react';

const LoggedTabs = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobile] = useMediaQuery('(max-width: 880px)');
  const [menuOpen, setMenuOpen] = useState(false);

  const navConfig = {
    patient: [
      { label: 'Início', path: '/paciente/inicio' },
      {
        label: 'Atendimentos',
        submenu: [
          { label: 'Agendar Atendimento', path: '/paciente/agendar-atendimento' },
          { label: 'Meus Atendimentos', path: '/paciente/meus-atendimentos' },
        ],
      },
      {
        label: 'Compras',
        submenu: [
          { label: 'Opções de Compras', path: '/paciente/opcoes-de-compras' },
          { label: 'Minhas Compras', path: '/paciente/minhas-compras' },
        ],
      },
      {
        label: 'Histórico de Saúde',
        submenu: [
          { label: 'Avaliações', path: '/paciente/historico-de-saude/avaliacoes' },
          { label: 'Planos de Tratamento', path: '/paciente/historico-de-saude/planos' },
          { label: 'Documentos Médicos', path: '/paciente/historico-de-saude/documentos' },
        ],
      },
      { label: 'Mensagens', path: '/paciente/mensagens' },
      { label: 'Pagamentos', path: '/paciente/pagamentos/historico' },
    ],
    professional: [
      { label: 'Minha Agenda', path: '/profissional/minha-agenda' },
      {
        label: 'Planos de Tratamento',
        submenu: [
          { label: 'Criar Novo Plano', path: '/profissional/planos-de-tratamento/novo' },
          { label: 'Listar Planos', path: '/profissional/planos-de-tratamento' },
        ],
      },
      {
        label: 'Avaliações',
        submenu: [
          { label: 'Criar Avaliação', path: '/profissional/avaliacoes/novo' },
          { label: 'Listar Avaliações', path: '/profissional/avaliacoes' },
        ],
      },
      { label: 'Pacientes Atendidos', path: '/profissional/pacientes-atendidos' },
      { label: 'Mensagens', path: '/profissional/mensagens' },
      {
        label: 'Prescrições',
        submenu: [
          { label: 'Criar Prescrições', path: '/profissional/prescricoes/nova' },
          { label: 'Listar Prescrições', path: '/profissional/prescricoes' },
        ],
      },
    ],
    company: [
      { label: 'Pedidos', path: '/empresa/pedidos' },
      {
        label: 'Integração API',
        submenu: [
          { label: 'Listar Integrações', path: '/empresa/integracao-api' },
          { label: 'Gerenciar Chaves de API', path: '/empresa/integracao-api/chaves' },
          { label: 'Configurar Endpoints', path: '/empresa/integracao-api/endpoints' },
        ],
      },
      { label: 'Perfil da Empresa', path: '/empresa/perfil' },
    ],
  };

  const userNav = navConfig[user.user_type] || [];

  const renderMenuItems = (items) =>
    items.map((item, index) => {
      if (item.submenu) {
        return (
          <Menu key={index} isLazy>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              variant="ghost"
              size="sm"
              mx={1}
              color="white"
              _hover={{ bg: 'customPalette.800' }}
              _active={{ color: 'customPalette.1000' }}
            >
              {item.label}
            </MenuButton>
            <MenuList bg="customPalette.900">
              {item.submenu.map((subItem, subIndex) => (
                <MenuItem
                  key={subIndex}
                  as={Link}
                  to={subItem.path}
                  bg="customPalette.900"
                  _hover={{ bg: 'customPalette.800' }}
                  _active={{ color: 'customPalette.1000' }}
                  color="white"
                  onClick={() => setMenuOpen(false)}
                >
                  {subItem.label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        );
      } else {
        return (
          <Button
            key={index}
            as={Link}
            to={item.path}
            variant="ghost"
            size="sm"
            mx={1}
            color="white"
            _hover={{ bg: 'customPalette.800' }}
            _active={{ color: 'customPalette.1000' }}
            isActive={location.pathname.startsWith(item.path)}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </Button>
        );
      }
    });

  return (
    <Flex align="center">
      {isMobile ? (
        <Menu isOpen={menuOpen}>
          <MenuButton
            as={IconButton}
            icon={<HamburgerIcon />}
            variant="outline"
            color="white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          />
          <MenuList bg="customPalette.900">
            <Stack direction="column">
              {renderMenuItems(userNav)}
            </Stack>
          </MenuList>
        </Menu>
      ) : (
        <Flex>{renderMenuItems(userNav)}</Flex>
      )}
    </Flex>
  );
};

export default LoggedTabs;