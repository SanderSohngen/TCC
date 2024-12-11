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

export const useFetchTypedUserData = (idToken) => {
  return useQuery({
    queryKey: ['fetchTypedUserData', idToken],
    queryFn: () => accountService.fetchTypedUserData(idToken),
    enabled: !!idToken,
  })
};

export const useUpdateMe = () => {
  return useMutation({
    mutationFn: accountService.updateMe,
  });
}