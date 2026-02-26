import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { reposApi } from './repos.api';
import { useChatStore } from '../../store/chat.store';

export const reposKeys = {
  all: ['repos'] as const,
  list: () => [...reposKeys.all, 'list'] as const,
  detail: (id: string) => [...reposKeys.all, 'detail', id] as const,
  summary: (id: string) => [...reposKeys.all, 'summary', id] as const,
  structure: (id: string) => [...reposKeys.all, 'structure', id] as const,
  indexStatus: (id: string) => [...reposKeys.all, 'index-status', id] as const,
};

export function useGetRepos() {
  return useQuery({
    queryKey: reposKeys.list(),
    queryFn: reposApi.getRepos,
    staleTime: 2 * 60 * 1000,
  });
}

export function useGetRepoStructure(repoId?: string) {
  return useQuery({
    queryKey: repoId ? reposKeys.structure(repoId) : reposKeys.structure(''),
    queryFn: () => reposApi.getRepoStructure(repoId as string),
    enabled: !!repoId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRepoStructure(repoId?: string) {
  return useQuery({
    queryKey: repoId ? reposKeys.structure(repoId) : reposKeys.structure(''),
    queryFn: async () => {
      const currentRepoId = repoId as string;
      const cached = useChatStore.getState().repoStructuresById[currentRepoId];
      if (cached) return cached;

      const data = await reposApi.getRepoStructure(currentRepoId);
      useChatStore.getState().setRepoStructure(currentRepoId, data);
      return data;
    },
    enabled: !!repoId,
    staleTime: Infinity,
  });
}

export function useRegisterRepo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reposApi.registerRepo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reposKeys.list() });
    },
  });
}

export function useDeleteRepo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reposApi.deleteRepo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reposKeys.list() });
    },
  });
}

export function useIngestRepo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reposApi.ingestRepo,
    onSuccess: (_, repoId) => {
      queryClient.invalidateQueries({ queryKey: reposKeys.list() });
      queryClient.invalidateQueries({ queryKey: reposKeys.detail(repoId) });
    },
  });
}

export function useRepoSummary(repoId?: string) {
  return useQuery({
    queryKey: repoId ? reposKeys.summary(repoId) : reposKeys.summary(''),
    queryFn: () => reposApi.getRepoSummary(repoId as string),
    enabled: !!repoId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSummarizeRepo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reposApi.summarizeRepo,
    onSuccess: (data, repoId) => {
      queryClient.setQueryData(reposKeys.summary(repoId), data);
    },
  });
}

export function usePinRepo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reposApi.pinRepo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reposKeys.list() });
    },
  });
}

export function useIndexChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reposApi.indexChat,
    onSuccess: (_, chatId) => {
      queryClient.invalidateQueries({ queryKey: reposKeys.list() });
      queryClient.invalidateQueries({ queryKey: reposKeys.detail(chatId) });
      queryClient.invalidateQueries({ queryKey: reposKeys.indexStatus(chatId) });
    },
  });
}

export function useRepoIndexStatus(repoId?: string, shouldPoll = true) {
  return useQuery({
    queryKey: repoId ? reposKeys.indexStatus(repoId) : reposKeys.indexStatus(''),
    queryFn: () => reposApi.getRepoIndexStatus(repoId as string),
    enabled: !!repoId,
    refetchInterval: (query) => {
      if (!shouldPoll) return false;
      const status = query.state.data?.indexStatus;
      return status === 'indexing' || status === 'running' ? 2000 : false;
    },
  });
}
