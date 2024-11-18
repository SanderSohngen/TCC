import { Box, Text, Button } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';


function ErrorPage() {
    const navigate = useNavigate();

    return (
        <Box textAlign="center" py="10" px="6">
            <Text fontSize="5xl" fontWeight="bold" color="customPalette.700">404</Text>
            <Text mt="4" mb="8" fontSize="lg" fontWeight="bold" color="customPalette.1000">
                Oops! Pagina não encontrada.
            </Text>
            <Button backgroundColor="customPalette.900" color="white" onClick={() => navigate("/")}>
                Voltar
            </Button>
        </Box>
    );
}

export default ErrorPage;