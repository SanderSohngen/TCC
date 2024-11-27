import { Flex, VStack, Button } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import HomeAccordion from '../components/HomeAccordion/HomeAccordion';
import AuthPanel from '../components/AuthPanel/AuthPanel';

const Home = () => {
  const { isLoggedIn, logout } = useAuth();

  return (
    <Flex align="center" justify="center" padding="4" flexGrow={1}>
      <VStack spacing={6} width="100%" >
        {isLoggedIn ? (
          <>
            <HomeAccordion />
            <Button colorScheme="red" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <AuthPanel />
        )}
      </VStack>
    </Flex>
  );
};

export default Home;