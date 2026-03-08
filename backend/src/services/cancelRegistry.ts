const cancelledRepos = new Set<string>();

export const markCancelled = (repoId: string) => cancelledRepos.add(repoId);
export const isCancelled = (repoId: string) => cancelledRepos.has(repoId);
export const clearCancelled = (repoId: string) => cancelledRepos.delete(repoId);