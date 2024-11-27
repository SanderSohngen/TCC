import { useEffect, useState } from 'react';
import { Flex, useToast } from '@chakra-ui/react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { Outlet } from 'react-router-dom';
import { useNavigation } from 'react-router-dom';
import Loading from '../components/Loading/Loading';
import { useAuth } from '../context/AuthContext';

function MainLayout() {
    const navigation = useNavigation();
    const { user, isLoggedIn } = useAuth()
    const toast = useToast();
    const [hasWelcomed, setHasWelcomed] = useState(
        localStorage.getItem('hasWelcomed') === 'true'
    );

    useEffect(() => {
        if (isLoggedIn && !hasWelcomed) {
            toast({
                title: 'Bem vindo de volta',
                description: `Olá novamente, ${user.name.split(' ')[0]}.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            })
            setHasWelcomed(true);
            localStorage.setItem('hasWelcomed', 'true');
        }
        else if (!isLoggedIn && hasWelcomed) {
            toast({
                title: 'Tchau',
                description: `Esperamos que volte em breve`,
                status: 'info',
                duration: 3000,
                isClosable: true,
            })
            setHasWelcomed(false);
            localStorage.removeItem('hasWelcomed');
        }
    }, [isLoggedIn, hasWelcomed])

    return (
        <Flex flexDirection="column" minHeight="100vh">
            <Header />
            <Flex flex="1" direction="column" overflowY="auto" justifyContent="center" bg="gray.50">
            {navigation.state === 'loading' ? <Loading /> : <Outlet />}
        </Flex>
            <Footer />
        </Flex>
    );
}

export default MainLayout;