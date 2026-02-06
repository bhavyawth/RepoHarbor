import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from './chat.api';

export const chatKeys = {
  all: ['chat'] as const,
  history: (repoId: string) => [...chatKeys.all, 'history', repoId] as const,
};

export function useChatHistory(repoId: string, enabled = true) {
  return useQuery({
    queryKey: chatKeys.history(repoId),
    queryFn: () => chatApi.getChatHistory(repoId),
    enabled: enabled && !!repoId,
    staleTime: 30*1000,
  });
}

export function useSendMessage(repoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (question: string) => chatApi.sendMessage(repoId, { question }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.history(repoId) });
    },
  });
}

export function useClearChat(repoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => chatApi.clearChatHistory(repoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.history(repoId) });
    },
  });
}