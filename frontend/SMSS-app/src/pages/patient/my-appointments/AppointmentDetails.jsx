import { Box, Alert, AlertIcon, Button, Flex } from '@chakra-ui/react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useFetchAppointmentDetails } from '../../../hooks/useAppointments';
import Loading from '../../../components/Loading/Loading';
import AppointmentDetailsComponent from '../../../components/AppointmentDetailsComponent/AppointmentDetailsComponent';

const AppointmentDetails = () => {
  const { appointmentId } = useParams();
  const { tokens } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: appointmentDetails, isPending } = useFetchAppointmentDetails(
    appointmentId,
    tokens?.idToken
  );

  const handleReschedule = () => {
    navigate(`${location.pathname}/remarcar`, { state: { appointmentDetails } });
  };
  
  const handleCancel = () => {
    navigate(`${location.pathname}/cancelar`, { state: { appointmentDetails } });
  };

  if (isPending) return <Loading />;

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

  return (
    <Box maxW="container.md" mx="auto" mt={8} p={6} borderWidth="1px" borderRadius="lg" shadow="md">
      <AppointmentDetailsComponent appointmentData={appointmentDetails} />
      <Flex mt={6} justify="space-between">
        <Button colorScheme="teal" onClick={handleReschedule}>
          Remarcar
        </Button>
        <Button colorScheme="red" onClick={handleCancel}>
          Cancelar
        </Button>
      </Flex>
    </Box>
  );
};

export default AppointmentDetails;