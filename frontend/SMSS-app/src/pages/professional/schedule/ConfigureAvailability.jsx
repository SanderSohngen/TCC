import { useState } from 'react';
import { Box, Button, Heading, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import AvailabilityForm from '../../../components/AvailabilityForm/AvailabilityForm';
import Calendar from '../../../components/Calendar/Calendar';
import { useAuth } from '../../../context/AuthContext';
import { useFetchMySlots, useToggleSlot } from '../../../hooks/useSlots';
import Loading from '../../../components/Loading/Loading';

const ConfigureAvailability = () => {
  const { tokens } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { data: slotsData, isPending, refetch } = useFetchMySlots(tokens);
  const toggleSlot = useToggleSlot();

  if (isPending) return <Loading />;

  const formattedSlots = slotsData.map((slot) => ({
    id: slot.slot_id,
    start: slot.slot_datetime,
    ...slot,
  }));

  const getTitle = (item) => {
    if (item.is_reserved)
      return 'Agendado';
    if (item.is_blocked)
      return 'Bloqueado';
    return 'Disponível';
  };

  const getColor = (item) => {
    if (item.is_reserved)
      return 'red';
    if (item.is_blocked)
      return 'gray';
    return 'green';
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleEventClick = (info) => {
    const slotId = info.event.id;
    toggleSlot.mutate(
      { slotId, idToken: tokens?.idToken },
      {
        onSuccess: () => {
          toast({
            title: 'Slot atualizado com sucesso!',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          refetch();
        },
        onError: (error) => {
          console.error('Erro ao alternar o status do slot:', error);
          toast({
            title: 'Erro ao alternar o status do slot.',
            description: 'Por favor, tente novamente mais tarde.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        },
      }
    );
  };

  const handleAvailabilityUpdate = () => {
    refetch();
  };

  return (
    <Box mt={5} display="flex" flexDirection="column" alignItems="center">
      <Heading size="lg" mb={4} color="customPalette.900" textAlign="center">
        Configurar Slots
      </Heading>
      <Calendar
        data={formattedSlots}
        getTitle={getTitle}
        getColor={getColor}
        onEventClick={handleEventClick}
      />
      <AvailabilityForm onSubmit={handleAvailabilityUpdate} />
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

export default ConfigureAvailability;