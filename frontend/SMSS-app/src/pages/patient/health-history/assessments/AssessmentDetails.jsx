import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Heading } from '@chakra-ui/react';
import Assessment from '../../../../components/Assessment/Assessment';

const AssessmentDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { assessment } = location.state || {};

  if (!assessment) {
    return (
      <Box textAlign="center" mt={8}>
        <Heading size="lg" color="red.500">
          Nenhuma avaliação foi encontrada!
        </Heading>
        <Button mt={4} colorScheme="blue" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </Box>
    );
  }

  return (
    <Box maxW="600px" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="white">
      <Heading size="lg" mb={6} textAlign="center" color="customPalette.900">
        Detalhes da Avaliação
      </Heading>
      <Assessment assessmentData={assessment} />
      <Button mt={4} w="100%" colorScheme="teal" onClick={() => navigate(-1)}>
        Voltar
      </Button>
    </Box>
  );
};

export default AssessmentDetails;