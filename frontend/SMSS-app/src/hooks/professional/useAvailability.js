import { useMutation, useQuery } from '@tanstack/react-query';
import * as availabilityService from '../../services/professional/availabilityService';

export const useSubmitAvailability = () => {
	return useMutation({
		mutationFn: availabilityService.submitAvailability,
	});
}

export const useFetchAvailability = (idToken) => {
	return useQuery({
		queryKey: ['fetchAvailability', idToken],
		queryFn: () => availabilityService.fetchAvailability(idToken),
		enabled: !!idToken,
	})
}