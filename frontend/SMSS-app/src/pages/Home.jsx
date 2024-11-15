import { Flex, Text, VStack, Button } from '@chakra-ui/react';
import AuthTabs from '../components/AuthTabs/AuthTabs';
import { useAuth } from '../context/AuthContext';

function Home() {
    const { isLoggedIn, logout } = useAuth();
    return (
        <Flex align="center" alignItems="center" justifyContent="center">
        <VStack spacing={4} mb={4} mt={4}>
            {
                isLoggedIn? (
                    <>
                        <Text fontSize="4xl" mb={4} fontWeight="bold" color='gray'>Bem Vindo</Text>
                        <Button colorScheme="red" onClick={logout}>Logout</Button>
                    </>
                ) : (
                    <>
                        <AuthTabs />
                    </>
                )
            }
        </VStack>
        </Flex>
    );
};

export default Home;