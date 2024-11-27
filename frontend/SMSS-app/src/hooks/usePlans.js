import { useMutation, useQuery } from '@tanstack/react-query';
import * as plansService from '../services/plansService';

export const useFetchMyPlans = (idToken) => {
  return useQuery({
    queryKey: ['fetchMyPlans', idToken],
    queryFn: () => plansService.fetchMyPlans(idToken),
    enabled: !!idToken,
  });
};

export const useFetchPatientPlans = ({ patientId, idToken }) => {
  return useQuery({
    queryKey: ['fetchPatientPlans', patientId, idToken],
    queryFn: () => plansService.fetchPatientPlans({ patientId, idToken }),
    enabled: !!patientId && !!idToken,
  });
};

export const useFetchPlanDetails = ({ planId, idToken }) => {
  return useQuery({
    queryKey: ['fetchPlanDetails', planId, idToken],
    queryFn: () => plansService.fetchPlanDetails({ planId, idToken }),
    enabled: !!planId && !!idToken,
  });
};

export const useSubmitPlan = () => {
  return useMutation({
    mutationFn: plansService.submitPlan,
  });
};