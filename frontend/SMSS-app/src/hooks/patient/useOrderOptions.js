import { useQuery } from '@tanstack/react-query';
import * as orderOptionsService from '../../services/patient/orderOptionsService';

export const useFetchOrderOptionsByPlanId = ({ idToken, planId }) => {
  return useQuery({
    queryKey: ['fetchOrderOptionsByPlanId', planId, idToken],
    queryFn: () => orderOptionsService.fetchOrderOptionsByPlanId({ idToken, planId }),
    enabled: !!idToken && !!planId,
  });
};

export const useFetchOrderOptionDetails = ({ idToken, planId, orderOptionId }) => {
  return useQuery({
    queryKey: ['fetchOrderOptionDetails', planId, orderOptionId, idToken],
    queryFn: () => orderOptionsService.fetchOrderOptionDetails({ idToken, planId, orderOptionId }),
    enabled: !!idToken && !!planId && !!orderOptionId,
  });
};