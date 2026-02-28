import { AxiosError } from 'axios';
import { api } from '../../api/client';

export interface Repo {
  indexed?: boolean;
  isPinned: boolean;
  _id: string;
  owner: string;
  name: string;
  userId: string;
  indexStatus: 'idle' | 'running' | 'done' | 'pending' | 'indexing' | 'indexed' | 'failed';
  indexError?: string | null;
  defaultBranch?: string | null;
  lastIndexedAt?: string | null;
  repoTree?: RepoNode[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRepoRequest {
  repoUrl: string;
}

export interface RepoSummary {
  summary: string;
}

export interface RepoNode {
  name: string;
  type: 'file' | 'folder';
  children?: RepoNode[];
}

export interface RepoStructure {
  tree: RepoNode[];
  structure: string;
}

export interface RepoIndexStatus {
  indexStatus: Repo['indexStatus'];
  indexError?: string | null;
  lastIndexedAt?: string | null;
}

export type NormalizedIndexStatus = 'idle' | 'running' | 'done' | 'failed';

export function normalizeIndexStatus(status?: Repo['indexStatus'] | string | null): NormalizedIndexStatus {
  if (!status) return 'idle';
  if (status === 'failed') return 'failed';
  if (status === 'running' || status === 'indexing') return 'running';
  if (status === 'done' || status === 'indexed') return 'done';
  return 'idle';
}

type ResolveIndexStatusInput = {
  backendStatus?: Repo['indexStatus'] | string | null;
  chatStatus?: Repo['indexStatus'] | string | null;
  lastIndexedAt?: string | null;
  localIndexing?: boolean;
};

export function resolveIndexStatus({
  backendStatus,
  chatStatus,
  lastIndexedAt,
  localIndexing = false,
}: ResolveIndexStatusInput): NormalizedIndexStatus {
  if (localIndexing) return 'running';
  const normalizedBackend = normalizeIndexStatus(backendStatus);
  const normalizedChat = normalizeIndexStatus(chatStatus);
  const hasIndexedOnce =
    !!lastIndexedAt || normalizedBackend === 'done' || normalizedChat === 'done';
  if (normalizedBackend === 'running' || normalizedChat === 'running') return 'running';
  if (hasIndexedOnce) return 'done';
  if (normalizedBackend === 'failed' || normalizedChat === 'failed') return 'failed';
  return 'idle';
}

export const reposApi = {
  registerRepo: async (data: RegisterRepoRequest): Promise<Repo> => {
    const { data: repo } = await api.post('/repos', data);
    const normalizedId = repo._id ?? repo.id;
    return {
      ...repo,
      _id: normalizedId,
      isPinned: repo.isPinned ?? false,
      userId: repo.userId ?? '',
      updatedAt: repo.updatedAt ?? repo.createdAt,
    };
  },

  getRepos: async (): Promise<Repo[]> => {
    const { data } = await api.get('/repos');
    return data;
  },

  deleteRepo: async (repoId: string): Promise<void> => {
    await api.delete(`/repos/${repoId}`);
  },

  ingestRepo: async (repoId: string): Promise<void> => {
    await api.post(`/repos/${repoId}/ingest`);
  },

  indexChat: async (chatId: string): Promise<RepoIndexStatus> => {
    const { data } = await api.post(`/chats/${chatId}/index`);
    return data;
  },

  getRepoIndexStatus: async (repoId: string): Promise<RepoIndexStatus> => {
    try {
      const { data } = await api.get(`/chats/${repoId}/index-status`);
      return data;
    } catch (error) {
      if ((error as AxiosError).response?.status !== 404) {
        throw error;
      }
      const { data } = await api.get(`/repos/${repoId}/index-status`);
      return data;
    }
  },

  summarizeRepo: async (repoId: string): Promise<RepoSummary> => {
    const { data } = await api.get(`/repos/${repoId}/summary`);
    return data;
  },

  getRepoSummary: async (repoId: string): Promise<RepoSummary> => {
    return reposApi.summarizeRepo(repoId);
  },

  getRepoStructure: async (repoId: string): Promise<RepoStructure> => {
    const { data } = await api.get(`/repos/${repoId}/structure`);
    return data;
  },

  pinRepo: async (repoId: string): Promise<void> => {
    await api.patch(`/repos/${repoId}/pin`);
  }
};