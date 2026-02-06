import { api } from '../../api/client';

export interface Repo {
  _id: string;
  owner: string;
  name: string;
  userId: string;
  indexStatus: 'pending' | 'indexing' | 'indexed' | 'failed';
  indexError?: string | null;
  defaultBranch?: string | null;
  lastIndexedAt?: string | null;
  repoMap?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRepoRequest {
  repoUrl: string;
}

export interface RepoSummary {
  summary: string;
}

export interface RepoStructure {
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

  getRepoSummary: async (repoId: string): Promise<RepoSummary> => {
    const { data } = await api.get(`/repos/${repoId}/summary`);
    return data;
  },

  getRepoStructure: async (repoId: string): Promise<RepoStructure> => {
    const { data } = await api.get(`/repos/${repoId}/structure`);
    return data;
  }
};