import { useMutation, useQuery } from '@tanstack/react-query';
import * as assessmentsService from '../services/assessmentsService';

export const useFetchMyAssessments = (idToken) => {
  return useQuery({
    queryKey: ['fetchMyAssessments', idToken],
    queryFn: () => assessmentsService.fetchMyAssessments(idToken),
    enabled: !!idToken,
  });
};

export const useFetchPatientAssessments = ({ patientId, idToken }) => {
  return useQuery({
    queryKey: ['fetchPatientAssessments', patientId, idToken],
    queryFn: () => assessmentsService.fetchPatientAssessments({ patientId, idToken }),
    enabled: !!patientId && !!idToken,
  });
};

export const useFetchAssessmentDetails = ({ assessmentId, idToken }) => {
  return useQuery({
    queryKey: ['fetchAssessmentDetails', assessmentId, idToken],
    queryFn: () => assessmentsService.fetchAssessmentDetails({ assessmentId, idToken }),
    enabled: !!assessmentId && !!idToken,
  });
};

export const useSubmitAssessment = () => {
  return useMutation({
    mutationFn: assessmentsService.submitAssessment,
  });
};