import { useMutation, useQuery } from '@tanstack/react-query';
import * as ordersService from '../services/ordersService';

export const useCreateOrder = () => {
	return useMutation({
	  mutationFn: ordersService.createOrder,
	});
  };

export const useFetchOrders = (idToken) => {
  return useQuery({
    queryKey: ['fetchOrders', idToken],
    queryFn: () => ordersService.fetchOrders(idToken),
    enabled: !!idToken,
  });
};

export const useFetchOrderDetails = ({ orderId, idToken }) => {
  return useQuery({
    queryKey: ['fetchOrderDetails', orderId, idToken],
    queryFn: () => ordersService.fetchOrderDetails({ orderId, idToken }),
    enabled: !!orderId && !!idToken,
  });
};

export const useUpdateOrderStatus = () => {
  return useMutation({
    mutationFn: ordersService.updateOrderStatus,
  });
};