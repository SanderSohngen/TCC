import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Heading, Alert, AlertIcon, useToast } from '@chakra-ui/react';
import { useAuth } from '../../../context/AuthContext';
import { useUpdateAppointment } from '../../../hooks/useAppointments';

const CancelAppointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { tokens } = useAuth();
  const { appointmentDetails } = location.state || {};
  const updateAppointment = useUpdateAppointment();

  if (!appointmentDetails) {
    return (
      <Box maxW="container.md" mx="auto" mt={8} p={6} borderWidth="1px" borderRadius="lg" shadow="md">
        <Alert status="warning">
          <AlertIcon />
          Consulta não encontrada.
        </Alert>
      </Box>
    );
  }

  const { appointment } = appointmentDetails;

  const handleCancelAppointment = async () => {
    updateAppointment.mutate(
      {
        appointmentId: appointment.appointment_id,
        appointmentData: { status: 'canceled' },
        idToken: tokens?.idToken,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Consulta cancelada com sucesso!',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          navigate(-2);
        },
        onError: (error) => {
          console.error('Erro ao cancelar consulta:', error);
          toast({
            title: 'Erro ao cancelar consulta.',
            description: 'Por favor, tente novamente mais tarde.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        },
      }
    );
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
		<Box
			p={6}
			m={5}
			maxW="container.md"
			borderWidth="1px"
			borderRadius="lg"
			overflow="hidden"
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			textAlign="center"
			mx="auto"
		>
      <Heading size="lg" mb={4} color="customPalette.900" textAlign="center">
        Cancelar Consulta
      </Heading>
      <Alert status="warning" mb={6}>
        <AlertIcon />
        Tem certeza de que deseja cancelar a consulta? Essa ação não poderá ser desfeita.
      </Alert>
      <Box display="flex" gap={4}>
        <Button colorScheme="red" onClick={handleCancelAppointment}>
          Confirmar Cancelamento
        </Button>
        <Button colorScheme="gray" onClick={handleBack}>
          Voltar
        </Button>
      </Box>
    </Box>
  );
};

export default CancelAppointment;