import { Box, Alert, AlertIcon, Button, Flex } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useFetchAppointmentDetails } from '../../../hooks/useAppointments';
import Loading from '../../../components/Loading/Loading';
import AppointmentDetailsComponent from '../../../components/AppointmentDetailsComponent/AppointmentDetailsComponent';
import SubmitMeetingButton from '../../../components/SubmitMeetingButton/SubmitMeetingButton';

const AppointmentDetails = () => {
  const { appointmentId } = useParams();
  const { tokens } = useAuth();
  const navigate = useNavigate();

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

  const handleNavigateToCreateAssessment = () => {
    const { appointment, patient } = appointmentDetails;
    navigate(`/profissional/avaliacoes/novo`, {
      state: {
        appointmentId: appointment.appointment_id,
        patientId: patient.patient_id,
      },
    });
  };

  const handleNavigateToCreatePrescription = () => {
    const { patient } = appointmentDetails;
    navigate(`/profissional/prescricoes/${appointmentId}/nova`, {
      state: {
        patientId: patient.patient_id,
      },
    });
  };

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
      <Flex mt={6} justify="center" flexWrap="wrap" gap={4}>
        <SubmitMeetingButton
          appointmentId={appointmentId}
          tokens={tokens}
          userType="profissional"
        />
        <Button colorScheme="teal" onClick={handleNavigateToCreateAssessment}>
          Criar Avaliação
        </Button>
        <Button colorScheme="blue" onClick={handleNavigateToCreatePrescription}>
          Criar Prescrição
        </Button>
        <Button colorScheme="gray" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </Flex>
    </Box>
  );
};

export default AppointmentDetails;