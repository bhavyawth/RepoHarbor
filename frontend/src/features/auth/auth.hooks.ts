import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from './auth.api';
import { isAxiosError } from 'axios';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

export function useAuth() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      try {
        return await authApi.getMe();
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me, null);
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== 'auth',
      });
    },
  });
}
