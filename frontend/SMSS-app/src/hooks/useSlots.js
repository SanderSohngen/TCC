import { useQuery, useMutation } from '@tanstack/react-query';
import * as slotsService from '../services/slotsService';

export const useFetchSlots = ({ profession, dateFrom, dateTo, idToken } = {}) => {
  return useQuery({
    queryKey: ['fetchSlots', { profession, dateFrom, dateTo }],
    queryFn: () => slotsService.fetchSlots({ profession, dateFrom, dateTo, idToken }),
    enabled: !!idToken && !!profession,
  });
};

export const useFetchMySlots = ({ idToken } = {}) => {
  return useQuery({
    queryKey: ['fetchMySlots', idToken],
    queryFn: () => slotsService.fetchMySlots(idToken),
    enabled: !!idToken,
  });
}

export const useFetchProfessionalSlots = ({ professionalId, idToken } = {}) => {
  return useQuery({
    queryKey: ['fetchProfessionalSlots', { professionalId }],
    queryFn: () => slotsService.fetchProfessionalSlots({ professionalId, idToken }),
    enabled: !!idToken && !!professionalId,
  });
}

export const useToggleSlot = () => {
  return useMutation({
    mutationFn: slotsService.toggleSlot,
  });
};