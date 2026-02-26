import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi, type ChatMessage } from './chat.api';

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
    onMutate: async (question: string) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.history(repoId) });
      const previousMessages =
        queryClient.getQueryData<ChatMessage[]>(chatKeys.history(repoId)) ?? [];
      const now = new Date().toISOString();
      const optimisticUserMessage: ChatMessage = {
        _id: `temp-user-${Date.now()}`,
        repoId,
        userId: 'me',
        role: 'user',
        content: question,
        createdAt: now,
        updatedAt: now,
      };
      const optimisticAssistantMessage: ChatMessage = {
        _id: `temp-assistant-${Date.now()}`,
        repoId,
        userId: 'assistant',
        role: 'assistant',
        content: '...',
        createdAt: now,
        updatedAt: now,
      };

      queryClient.setQueryData<ChatMessage[]>(chatKeys.history(repoId), [
        ...previousMessages,
        optimisticUserMessage,
        optimisticAssistantMessage,
      ]);

      return { previousMessages, optimisticAssistantId: optimisticAssistantMessage._id };
    },
    onSuccess: (result, _, context) => {
      queryClient.setQueryData<ChatMessage[]>(chatKeys.history(repoId), (current) => {
        if (!current) return current;
        return current.map((message) =>
          message._id === context?.optimisticAssistantId
            ? { ...message, content: result.answer }
            : message
        );
      });
    },
    onError: (_, __, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(chatKeys.history(repoId), context.previousMessages);
      }
    },
    onSettled: () => {
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
