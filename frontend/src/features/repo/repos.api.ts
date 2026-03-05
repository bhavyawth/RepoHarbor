import { api } from '../../api/client';

export type IndexStatus = 'idle' | 'running' | 'done' | 'failed';
export interface Repo {
  isPinned: boolean;
  _id: string;
  owner: string;
  name: string;
  branch?: string | null;
  userId: string;
  indexStatus: IndexStatus;
  indexError?: string | null;
  defaultBranch?: string | null;
  lastIndexedAt?: string | null;
  repoTree?: RepoNode[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRepoRequest {
  repoUrl: string;
  branch?: string;
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

export const reposApi = {
  registerRepo: async (data: RegisterRepoRequest): Promise<Repo> => {
    const payload = {
      ...data,
      branch: data.branch?.trim() || "main",
    };
    const { data: repo } = await api.post('/repos', payload);
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
    const { data } = await api.get(`/repos/${repoId}/index-status`);
    return data;
  },

  getRepoSummary: async (repoId: string): Promise<RepoSummary> => {
    const { data } = await api.get(`/repos/${repoId}/summary`);
    return data;
  },

  summarizeRepo: async (repoId: string): Promise<RepoSummary> => {
    const { data } = await api.get(`/repos/${repoId}/summary`);
    return data;
  },

  getRepoStructure: async (repoId: string): Promise<RepoStructure> => {
    const { data } = await api.get(`/repos/${repoId}/structure`);
    return data;
  },

  pinRepo: async (repoId: string): Promise<void> => {
    await api.patch(`/repos/${repoId}/pin`);
  }
};
