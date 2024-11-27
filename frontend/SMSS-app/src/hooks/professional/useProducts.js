import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as productsService from '../../services/professional/productsService';

export const useFetchProducts = ({ categories, profession, idToken }) =>
  useQuery({
    queryKey: ['products', categories, profession],
    queryFn: () => productsService.fetchProducts({ categories, profession, idToken }),
    enabled: !!idToken && categories?.length > 0 && !!profession,
  });

export const useSubmitProduct = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: productsService.submitProduct,
		onSuccess: () => {
			queryClient.invalidateQueries(['products']);
		},
	});
};