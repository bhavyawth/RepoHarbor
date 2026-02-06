import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reposApi } from './repos.api';

export const reposKeys = {
  all: ['repos'] as const,
  list: () => [...reposKeys.all, 'list'] as const,
  detail: (id: string) => [...reposKeys.all, 'detail', id] as const,
  summary: (id: string) => [...reposKeys.all, 'summary', id] as const,
  structure: (id: string) => [...reposKeys.all, 'structure', id] as const,
};

export function useRepos() {
  return useQuery({
    queryKey: reposKeys.list(),
    queryFn: reposApi.getRepos,
    staleTime: 2*60*1000,
  });
}

export function getRepoStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reposApi.getRepoStructure,
    onSuccess: (_, repoId) => {
      queryClient.invalidateQueries({ queryKey: reposKeys.structure(repoId) });
    },
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

export function useRepoSummary(repoId: string, enabled = true) {
  return useQuery({
    queryKey: reposKeys.summary(repoId),
    queryFn: () => reposApi.getRepoSummary(repoId),
    enabled: enabled && !!repoId,
    staleTime: 10*60*1000,
  });
}