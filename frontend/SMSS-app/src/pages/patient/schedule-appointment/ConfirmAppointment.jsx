import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useAuth } from '../../../context/AuthContext';
import { useSubmitAppointment } from '../../../hooks/useAppointments';
import { DateTime } from 'luxon';

const ConfirmAppointment = () => {
  const { slotId: slot_id } = useParams();
  const { tokens } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const submitAppointment = useSubmitAppointment();

  const slot = location.state?.slot;

  if (!slot) {
    toast({
      title: 'Erro',
      description: 'Dados do slot não disponíveis.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
    navigate(-1);
    return null;
  }

  const handleConfirm = () => {
    const appointmentData = {
      slot_id,
    }
    submitAppointment.mutateAsync(
      { appointmentData, idToken: tokens.idToken },
      {
        onSuccess: () => {
          toast({
            title: 'Sucesso',
            description: 'Consulta agendada com sucesso.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          navigate('/paciente/meus-atendimentos');
        },
        onError: (error) => {
          toast({
            title: 'Erro',
            description:
              error.response?.data?.error || 'Erro ao agendar a consulta.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        },
      }
    )
  };

  const handleBack = () => {
    navigate(-1);
  };

	const formatDate = (dateString) => {
    const [date, time] = dateString.split(' ');
    const formatted_date = DateTime.fromFormat(date, 'yyyy-MM-dd').toFormat('dd/MM');
    const formatted_time = DateTime.fromFormat(time, 'HH:mm:ssZZ').toLocal().toFormat('HH:mm');
    return `${formatted_date} às ${formatted_time}`;
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
      <Heading size="lg" mb={4} color="customPalette.900">
        Confirmar Agendamento
      </Heading>
      <Text>
        <strong>Data e Hora:</strong>{' '}
        {formatDate(slot.slot_datetime)}
      </Text>
      <Text>
        <strong>Profissional:</strong> {slot.professional_name}
      </Text>
      <Text>
        <strong>Bio:</strong> {slot.bio || 'Não disponível'}
      </Text>
      <Text>
        <strong>Especialidades:</strong>{' '}
        {slot.specialties?.join(', ') || 'Nenhuma'}
      </Text>
      <Text>
        <strong>Preço:</strong> R${' '}
        {typeof parseFloat(slot.price) === 'number'
          ? parseFloat(slot.price).toFixed(2)
          : 'Indisponível'}
      </Text>
      <Button
        colorScheme="teal"
        onClick={handleConfirm}
        isLoading={submitAppointment.isPending}
        mt={4}
      >
        Confirmar Agendamento
      </Button>
      <Button
        mt={6}
        colorScheme="teal"
        width="full"
        size="md"
        onClick={handleBack}
      >
        Voltar
      </Button>
    </Box>
  );
};

export default ConfirmAppointment;