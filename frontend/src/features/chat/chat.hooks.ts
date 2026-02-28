import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { chatApi, type ChatMessage } from './chat.api';

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_MIN_LENGTH = 2;

export const chatKeys = {
  all: ['chat'] as const,
  history: (repoId: string) => [...chatKeys.all, 'history', repoId] as const,
  searchMessages: (query: string) => [...chatKeys.all, 'search', query] as const,
};

function useDebouncedValue(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeout);
  }, [value, delay]);
  return debouncedValue;
}

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

      queryClient.setQueryData<ChatMessage[]>(chatKeys.history(repoId), [
        ...previousMessages,
        optimisticUserMessage,
      ]);

      return { previousMessages };
    },
    onSuccess: (result) => {
      const now = new Date().toISOString();
      const optimisticAssistantMessage: ChatMessage = {
        _id: `temp-assistant-${Date.now()}`,
        repoId,
        userId: 'assistant',
        role: 'assistant',
        content: result.answer,
        createdAt: now,
        updatedAt: now,
      };

      queryClient.setQueryData<ChatMessage[]>(chatKeys.history(repoId), (current) => {
        if (!current) return [optimisticAssistantMessage];
        return [...current, optimisticAssistantMessage];
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

export function useMessageSearch(query: string, isOpen: boolean) {
  const trimmedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(trimmedQuery, SEARCH_DEBOUNCE_MS);
  return useQuery({
    queryKey: chatKeys.searchMessages(debouncedQuery),
    queryFn: () => chatApi.searchMessages(debouncedQuery),
    enabled: isOpen && debouncedQuery.length >= SEARCH_MIN_LENGTH,
    staleTime: 20 * 1000,
    gcTime: 2 * 60 * 1000,
  });
}
