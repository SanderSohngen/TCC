import { Link as RouterLink } from 'react-router-dom';
import { Flex, Text } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import LoggedTabs from './LoggedTabs';

const Header = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Flex as="header" bg="customPalette.900" color="white" align="center" justify="space-between" padding="4" boxShadow="sm">
      <Text fontSize="xl" fontWeight="bold">
      <RouterLink to="/">Sistema Multissetorial de Saúde</RouterLink>
      </Text>
      {isLoggedIn && <LoggedTabs />}
    </Flex>
  );
};

export default Header;