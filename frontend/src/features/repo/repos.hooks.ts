import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { reposApi } from './repos.api';

export const reposKeys = {
  all: ['repos'] as const,
  list: () => [...reposKeys.all, 'list'] as const,
  detail: (id: string) => [...reposKeys.all, 'detail', id] as const,
  summary: (id: string) => [...reposKeys.all, 'summary', id] as const,
  structure: (id: string) => [...reposKeys.all, 'structure', id] as const,
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
