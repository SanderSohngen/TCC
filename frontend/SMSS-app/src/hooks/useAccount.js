import { useMutation, useQuery } from '@tanstack/react-query';
import * as accountService from '../services/accountService';
import { useAuth } from '../context/AuthContext';

export const useSignup = () => {
    const { login } = useAuth();

    return useMutation({
      mutationFn: accountService.signup,
      onSuccess: (data) => {
        login(data);
      },
    });
};

export const useLogin = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: accountService.login,
    onSuccess: (data) => {
      login(data);
    },
  });
};

export const useFetchTypedUserData = (userType, idToken) => {
  return useQuery({
    queryKey: ['fetchTypedUserData', userType, idToken],
    queryFn: () => accountService.fetchTypedUserData(userType, idToken),
    enabled: !!userType && !!idToken,
  })
};