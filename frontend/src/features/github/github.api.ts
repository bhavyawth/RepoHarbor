import { api } from '../../api/client';

export interface RepoDetails {
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  created_at: string;
  updated_at: string;
  default_branch: string;
  topics: string[];
  license: {
    key: string;
    name: string;
    url: string;
  } | null;
}

export interface RepoItem {
  path: string;
  name: string;
  type: 'file' | 'dir';
  size?: number;
}

//todo : remove this or use this later
// export interface FileChunk {
//   content: string;
//   startIndex: number;
//   chunkIndex: number;
// }

export const githubApi = {
  getRepoDetails: async (owner: string, repo: string): Promise<RepoDetails> => {
    const { data } = await api.get(`/github/repos/${owner}/${repo}`);
    return data;
  },

  getRepoContents: async (
    owner: string,
    repo: string,
    folderPath: string = ''
  ): Promise<RepoItem[]> => {
    const path = folderPath ? `/github/repos/${owner}/${repo}/contents/${folderPath}` : `/github/repos/${owner}/${repo}/contents`;
    const { data } = await api.get(path);
    return data;
  },

  getFileContent: async (
    owner: string,
    repo: string,
    filePath: string
  ): Promise<string> => {
    const { data } = await api.get(`/github/repos/${owner}/${repo}/files/${filePath}`);
    return data;
  },

  // getFileChunks: async (
  //   owner: string,
  //   repo: string,
  //   filePath: string
  // ): Promise<FileChunk[]> => {
  //   const { data } = await api.get(`/github/repos/${owner}/${repo}/file-chunks/${filePath}`);
  //   return data;
  // },
};