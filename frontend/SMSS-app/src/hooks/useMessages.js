import { useQuery } from '@tanstack/react-query';
import * as appointmentsService from '../services/appointmentsService';
import { DateTime } from 'luxon';

export const useFetchMessages = (idToken) => {
  const { data: appointments = [], isFetching } = useQuery({
    queryKey: ['fetchMessages', idToken],
    queryFn: () => appointmentsService.fetchAppointments(idToken),
    enabled: !!idToken,
  });

  const today = DateTime.local().toSQLDate();
  const filteredAppointments = appointments.filter((appointment) =>
    DateTime.fromSQL(appointment.slot_datetime).toSQLDate() === today
  );
  return { appointments: filteredAppointments, isFetching };
};