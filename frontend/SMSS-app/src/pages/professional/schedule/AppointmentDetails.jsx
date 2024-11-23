import { Box, Alert, AlertIcon } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useFetchAppointmentDetails } from '../../../hooks/useAppointments';
import Loading from '../../../components/Loading/Loading';
import AppointmentDetailsComponent from '../../../components/AppointmentDetailsComponent/AppointmentDetailsComponent';

const AppointmentDetails = () => {
  const { appointmentId } = useParams();
  const { tokens } = useAuth();

  const { data: appointmentDetails, isPending } = useFetchAppointmentDetails(
    appointmentId,
    tokens?.idToken
  );

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

  return <AppointmentDetailsComponent appointmentData={appointmentDetails} />;
};

export default AppointmentDetails;