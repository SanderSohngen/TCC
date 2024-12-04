import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Heading } from '@chakra-ui/react';
import Plan from '../../../../components/Plan/Plan';

const TreatmentPlansDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { plan } = location.state || {};

  if (!plan) {
    return (
      <Box textAlign="center" mt={8}>
        <Heading size="lg" color="red.500">
          Nenhum plano foi encontrado!
        </Heading>
        <Button mt={4} colorScheme="blue" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </Box>
    );
  }

  return (
    <Box
      maxW="600px"
      mx="auto"
      mt={8}
      p={6}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="lg"
      bg="white"
    >
      <Heading size="lg" mb={6} textAlign="center" color="customPalette.900">
        Detalhes do Plano
      </Heading>
      <Plan planData={plan} />
      <Box mt={4} display="flex" justifyContent="space-between">
        <Button w="48%" colorScheme="gray" onClick={() => navigate(-1)}>
          Voltar
        </Button>
        <Button
          w="48%"
          onClick={() =>
            navigate(`/paciente/opcoes-de-compras/${plan.plan_id}`, {
              state: { items: plan.items },
            })
          }
          colorScheme="teal"
          isDisabled={!plan.items || plan.items.length === 0}
        >
          Ver Opções de Compra
        </Button>
      </Box>
    </Box>
  );
};

export default TreatmentPlansDetails;