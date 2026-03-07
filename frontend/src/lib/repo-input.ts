export type RepoInputResult = { repoUrl?: string; error?: string };

export function normalizeRepoInput(input: string): RepoInputResult {
  let trimmed = input.trim();
  if (!trimmed) return { error: 'Repository URL is required.' };
  if (trimmed.match(/^(?:www\.)?github\.com\//i)) {
    trimmed = `https://${trimmed}`;
  }
  const ownerRepoMatch = trimmed.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (ownerRepoMatch) {
    const owner = ownerRepoMatch[1];
    const repo = ownerRepoMatch[2].replace(/\.git$/i, '');
    if (!owner || !repo) return { error: 'Enter a valid GitHub repository.' };
    return { repoUrl: `https://github.com/${owner}/${repo}` };
  }
  try {
    const parsed = new URL(trimmed);
    const isGithubHost =
      parsed.hostname === 'github.com' || parsed.hostname === 'www.github.com';
    if (!isGithubHost) {
      return { error: 'Only GitHub repository URLs are supported.' };
    }
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2 || !parts[0] || !parts[1]) {
      return { error: 'Enter a valid GitHub repository URL.' };
    }
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/i, '');
    return { repoUrl: `https://github.com/${owner}/${repo}` };
  } catch {
    return { error: 'Enter a valid GitHub URL or owner/repo.' };
  }
}