import { Box, Button } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFetchAppointments } from '../../../hooks/useAppointments'
import Calendar from '../../../components/Calendar/Calendar';
import { useAuth } from '../../../context/AuthContext';
import Loading from '../../../components/Loading/Loading';

export default function Schedule() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, tokens } = useAuth();
  const { data: appointmentsData, isPending } = useFetchAppointments(tokens.idToken);

  const handleRedirect = () => {
    const newPath = `${location.pathname}/configurar`;
    navigate(newPath);
  };

  if (isPending || !user || !appointmentsData) return <Loading />;

  const getTitle = (appointment) => {
    return appointment.patient_name;
  };

  const getColor = (appointment) => {
    const status = appointment.status;
    if (status === 'scheduled') return 'teal';
    if (status === 'completed') return '#22577a';
  };

  const handleEventClick = (info) => {
    navigate(`${location.pathname}/${info.event.id}`);
  };
  
  const formattedData = appointmentsData.map((appointment) => ({
    id: appointment.appointment_id,
    start: appointment.slot_datetime,
    ...appointment,
  }));

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Calendar
        data={formattedData}
        getTitle={getTitle}
        getColor={getColor}
        onEventClick={handleEventClick}
      />
      <Button
        m={5}
        colorScheme="teal"
        width="sm"
        size="md"
        onClick={handleRedirect}
      >
        Configurar Agenda
      </Button>
    </Box>
  );
};
