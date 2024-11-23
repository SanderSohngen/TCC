import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Heading, Alert, AlertIcon, useToast } from '@chakra-ui/react';
import { useFetchProfessionalSlots } from '../../../hooks/useSlots';
import { useAuth } from '../../../context/AuthContext';
import Calendar from '../../../components/Calendar/Calendar';
import Loading from '../../../components/Loading/Loading';
import { useUpdateAppointment } from '../../../hooks/useAppointments';

const RescheduleAppointment = () => {
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

  const { professional } = appointmentDetails;

  const { data: slotsData, isPending } = useFetchProfessionalSlots({
			professionalId: professional.professional_id,
			idToken: tokens?.idToken
	});

  const formattedSlots = slotsData?.map((slot) => ({
    id: slot.slot_id,
    start: slot.slot_datetime,
    ...slot,
  }));

  const getTitle = (slot) => ('Disponível');

  const getColor = (slot) => ('green');

  const handleEventClick = async (info) => {
    console.log('Slot selecionado:', info.event);
    const newSlotId = info.event.id;
    const { appointment } = appointmentDetails;
    console.log('appointment:', appointment);

    updateAppointment.mutate(
      {
        appointmentId: appointment.appointment_id,
        appointmentData: { status: 'scheduled', slot_id: newSlotId },
        idToken: tokens?.idToken,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Consulta remarcada com sucesso!',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          navigate(-1);
        },
        onError: (error) => {
          console.error('Erro ao remarcar consulta:', error);
          toast({
            title: 'Erro ao remarcar consulta.',
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

  if (isPending) return <Loading />;

  return (
    <Box p={6} m={5} borderWidth="1px" borderRadius="lg" overflow="hidden" display="flex" flexDirection="column" alignItems="center">
      <Heading size="lg" mb={4} color="customPalette.900" textAlign="center">
        Remarcar Consulta
      </Heading>
      <Calendar
        data={formattedSlots}
        getTitle={getTitle}
        getColor={getColor}
        onEventClick={handleEventClick}
      />
      <Button
        m={5}
        colorScheme="gray"
        onClick={handleBack}
      >
        Voltar
      </Button>
    </Box>
  );
};

export default RescheduleAppointment;