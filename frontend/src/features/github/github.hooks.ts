import { useQuery } from '@tanstack/react-query';
import { githubApi } from './github.api';

export const githubKeys = {
  repoDetails: (owner: string, repo: string) => ['github', 'repo', owner, repo] as const,
  repoContents: (owner: string, repo: string, path: string) => ['github', 'contents', owner, repo, path] as const,
  fileContent: (owner: string, repo: string, filePath: string) => ['github', 'file', owner, repo, filePath] as const,
  fileChunks: (owner: string, repo: string, filePath: string) => ['github', 'chunks', owner, repo, filePath] as const,
};

export function useRepoDetails(owner: string, repo: string, enabled = true) {
  return useQuery({
    queryKey: githubKeys.repoDetails(owner, repo),
    queryFn: () => githubApi.getRepoDetails(owner, repo),
    enabled: enabled && !!owner && !!repo,
    staleTime: 10*60*1000,
  });
}

export function useRepoContents(owner: string, repo: string, path = '', enabled = true) {
  return useQuery({
    queryKey: githubKeys.repoContents(owner, repo, path),
    queryFn: () => githubApi.getRepoContents(owner, repo, path),
    enabled: enabled && !!owner && !!repo,
    staleTime: 5*60*1000,
  });
}

export function useFileContent(owner: string, repo: string, filePath: string, enabled = true) {
  return useQuery({
    queryKey: githubKeys.fileContent(owner, repo, filePath),
    queryFn: () => githubApi.getFileContent(owner, repo, filePath),
    enabled: enabled && !!owner && !!repo && !!filePath,
    staleTime: 10*60*1000,
  });
}

// export function useFileChunks(owner: string, repo: string, filePath: string, enabled = true) {
//   return useQuery({
//     queryKey: githubKeys.fileChunks(owner, repo, filePath),
//     queryFn: () => githubApi.getFileChunks(owner, repo, filePath),
//     enabled: enabled && !!owner && !!repo && !!filePath,
//     staleTime: 10*60*1000,
//   });
// }