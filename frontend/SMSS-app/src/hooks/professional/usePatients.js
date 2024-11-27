import { useQuery } from '@tanstack/react-query';
import * as appointmentsService from '../../services/appointmentsService';

export const useFetchPatientsDetails = (patientId, idToken) => {
  const { data: appointments = [], isFetching } = useQuery({
    queryKey: ['fetchAppointments', idToken],
    queryFn: () => appointmentsService.fetchAppointments(idToken),
    enabled: !!idToken,
  });

  const patientInfo = appointments.find(
    (appointment) => appointment.patient_id === patientId
  ) || {};

  return { patientInfo, isFetching };
};