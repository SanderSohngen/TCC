import { useMutation } from '@tanstack/react-query';
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

export const useAccount = () => {
  return useMutation({
    mutationFn: accountService.fetchTypedUserData,
  });
};