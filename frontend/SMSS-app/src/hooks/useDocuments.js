import { useMutation, useQuery } from '@tanstack/react-query';
import * as documentsService from '../services/documentsService';

export const useFetchDocuments = (idToken) => {
  return useQuery({
    queryKey: ['fetchDocuments', idToken],
    queryFn: () => documentsService.fetchDocuments(idToken),
    enabled: !!idToken,
  });
};

export const useFetchDocumentDetails = ({ documentId, idToken }) => {
  return useQuery({
    queryKey: ['fetchDocumentDetails', documentId, idToken],
    queryFn: () => documentsService.fetchDocumentDetails({ documentId, idToken }),
    enabled: !!documentId && !!idToken,
  });
};

export const useUploadDocument = () => {
  return useMutation({
    mutationFn: documentsService.uploadDocument,
  });
};