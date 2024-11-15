import { Box, Text, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

function ErrorPage() {
    const navigate = useNavigate();

    return (
        <Box textAlign="center" py="10" px="6">
            <Text fontSize="5xl" fontWeight="bold" color="red.500">404</Text>
            <Text mt="4" mb="8" fontSize="lg" fontWeight="bold">
                Oops! Pagina não encontrada.
            </Text>
            <Button colorScheme="blue" onClick={() => navigate("/")}>
                Voltar
            </Button>
        </Box>
    );
}

export default ErrorPage;