import { useNavigate, useLocation } from 'react-router-dom';
import { Flex, Tabs, TabList, Tab, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const { isLoggedIn } = useAuth();

    const paths = ['/', ];

    const currentTabIndex = paths.findLastIndex(path => currentPath.startsWith(path));

    const handleTabsChange = (index) => {
        navigate(paths[index]);
    };

    return (
        <Flex as="header" bg="customPalette.900" color="white" align="center" justify="space-between" padding="4" boxShadow="sm">
        <Text fontSize="xl" fontWeight="bold">Sistema Multissetorial de Saúde</Text>
        <Tabs index={currentTabIndex} onChange={handleTabsChange}>
            <TabList>
            <Tab as={Link} to="/">Home</Tab>
            {isLoggedIn && (
                <>
                </>
            )}
            </TabList>
        </Tabs>
        </Flex>
    );
}

export default Header;

