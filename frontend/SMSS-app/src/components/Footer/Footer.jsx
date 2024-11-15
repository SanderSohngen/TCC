import { Box, Text } from '@chakra-ui/react';

function Footer() {
    return (
        <Box as="footer" bg="customPalette.900" color="white" mt="auto" py="3" px="4" textAlign="center">
            <Text>© 2024 Sistema Multissetorial de Saúde. All rights reserved.</Text>
        </Box>
    );
}

export default Footer;