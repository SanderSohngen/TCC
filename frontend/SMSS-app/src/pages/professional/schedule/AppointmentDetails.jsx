import { Box, Alert, AlertIcon, Button, Flex } from '@chakra-ui/react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useFetchAppointmentDetails } from '../../../hooks/useAppointments';
import Loading from '../../../components/Loading/Loading';
import AppointmentDetailsComponent from '../../../components/AppointmentDetailsComponent/AppointmentDetailsComponent';
import SubmitMeetingButton from '../../../components/SubmitMeetingButton/SubmitMeetingButton';

const AppointmentDetails = () => {
  const { appointmentId } = useParams();
  const { tokens } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: appointmentDetails, isPending } = useFetchAppointmentDetails(
    appointmentId,
    tokens?.idToken
  );

  if (isPending) return <Loading />;

  if (!appointmentDetails) {
    return (
      <Box
        maxW="container.md"
        mx="auto"
        mt={8}
        p={6}
        borderWidth="1px"
        borderRadius="lg"
        shadow="md"
      >
        <Alert status="warning">
          <AlertIcon />
          Consulta não encontrada.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      maxW="container.md"
      mx="auto"
      mt={8}
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      shadow="md"
      textAlign="center"
    >
      <AppointmentDetailsComponent appointmentData={appointmentDetails} />
      <Flex mt={6} justify="center">
        <SubmitMeetingButton
          appointmentId={appointmentId}
          tokens={tokens}
          userType="profissional"
        />
      </Flex>
    </Box>
  );
};

export default AppointmentDetails;

