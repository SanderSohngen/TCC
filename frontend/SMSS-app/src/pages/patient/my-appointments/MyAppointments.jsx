import { useFetchAppointments } from '../../../hooks/useAppointments';
import Calendar from '../../../components/Calendar/Calendar';
import { useAuth } from '../../../context/AuthContext';
import Loading from '../../../components/Loading/Loading';
import { useNavigate, useLocation } from 'react-router-dom';

const MyAppointments = () => {
  const { user, tokens } = useAuth();
  const { data: appointmentsData, isPending } = useFetchAppointments(tokens.idToken);
  const navigate = useNavigate();
  const location = useLocation();

  if (isPending || !user || !appointmentsData) return <Loading />;

  const getTitle = (appointment) => {
    return appointment.professional_name;
  };

  const getColor = (appointment) => {
    const profession = appointment.profession;
    const professionColor = {
      medic: '#22577a',
      psycologist: '#06090e',
      nutritionist: '#c8ae92',
      personal_trainer: '#61000d',
    }
    return professionColor[profession];
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
    <Calendar
      data={formattedData}
      getTitle={getTitle}
      getColor={getColor}
      onEventClick={handleEventClick}
    />
  );
};

export default MyAppointments;