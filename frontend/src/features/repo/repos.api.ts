import { api } from '../../api/client';

export interface Repo {
  isPinned: boolean;
  _id: string;
  owner: string;
  name: string;
  userId: string;
  indexStatus: 'pending' | 'indexing' | 'indexed' | 'failed';
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

export const reposApi = {
  registerRepo: async (data: RegisterRepoRequest): Promise<Repo> => {
    const { data: repo } = await api.post('/repos', data);
    return repo;
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
