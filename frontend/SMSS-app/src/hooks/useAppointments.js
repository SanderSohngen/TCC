import { useMutation, useQuery } from '@tanstack/react-query';
import * as appointmentsService from '../services/appointmentsService';

export const useSubmitAppointment = () => {
  return useMutation({
    mutationFn: appointmentsService.submitAppointment,
  });
};

export const useFetchAppointments = (idToken) => {
  return useQuery({
    queryKey: ['fetchAppointments', idToken],
    queryFn: () => appointmentsService.fetchAppointments(idToken),
    enabled: !!idToken,
  });
};

export const useFetchAppointmentDetails = (appointmentId, idToken) => {
  return useQuery({
    queryKey: ['fetchAppointmentDetails', appointmentId, idToken],
    queryFn: () => appointmentsService.fetchAppointmentDetails(appointmentId, idToken),
    enabled: !!appointmentId && !!idToken,
  });
};

export const useUpdateAppointment = () => {
  return useMutation({
    mutationFn: appointmentsService.updateAppointment,
  });
}

export const useSubmitMeeting = () => {
  return useMutation({
    mutationFn: appointmentsService.submitMeeting,
  });
};