import { Octokit } from "@octokit/rest";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
    console.warn("GITHUB_TOKEN is not set. Requests may be rate-limited.");
}

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const rawContentApiClient = axios.create({ baseURL: "https://raw.githubusercontent.com" });

// Helper for resolving branch if not provided
async function resolveBranch(owner: string, repo: string, branch?: string) {
    if (branch) return branch;
    const response = await octokit.rest.repos.get({ owner, repo });
    return response.data.default_branch;
}

// Fetch high-level repository details
export async function getRepoDetails(owner: string, repo: string): Promise<any> {
    try {
        const response = await octokit.rest.repos.get({ owner, repo });
        const {
            name,
            description,
            html_url,
            stargazers_count,
            forks_count,
            language,
            created_at,
            updated_at,
            default_branch,
            topics,
            license,
        } = response.data;

        return {
            name,
            description,
            html_url,
            stargazers_count,
            forks_count,
            language,
            created_at,
            updated_at,
            default_branch,
            topics: topics || [],
            license: license
            ? { key: license.key, name: license.name, url: license.html_url }
            : null,
        };
    } catch (error: any) {
        if (error.status === 404) throw new Error(`Repository '${owner}/${repo}' not found.`);
        throw new Error(`GitHub API error for ${owner}/${repo}: ${error.status || 500} - ${error.message || "Unknown error"}`);
    }
}

export interface RepoTreeEntry {
    path: string;
    type: "blob" | "tree" | "commit";
    size?: number;
}

export async function getRepoTree(
    owner: string,
    repo: string,
    branch?: string
): Promise<RepoTreeEntry[]> {
    try {
        const usedBranch = await resolveBranch(owner, repo, branch);
        const response = await octokit.rest.git.getTree({
            owner,
            repo,
            tree_sha: usedBranch,
            recursive: "true",
        });
        if (response.data.truncated) throw new Error(`GitHub tree response is truncated for '${owner}/${repo}'.`);
        return (response.data.tree ?? [])
            .map((item) => ({
                path: item.path,
                type: item.type as RepoTreeEntry["type"],
                size: item.size,
            }))
            .filter((item) => !!item.path && !!item.type)
            .filter(
                (item) => item.type === "blob" || item.type === "tree" || item.type === "commit"
            ) as RepoTreeEntry[];
    } catch (error: any) {
        if (error.status === 404) throw new Error(`Repository '${owner}/${repo}' not found.`);
        throw new Error(`GitHub API error for ${owner}/${repo}: ${error.status || 500} - ${error.message || "Unknown error"}`);
    }
}

// Fetch raw content of a specific file
export async function getFileContent(
    owner: string,
    repo: string,
    filePath: string,
    branch?: string
): Promise<string> {
    try {
        const usedBranch = await resolveBranch(owner, repo, branch);
        const url = `/${owner}/${repo}/${usedBranch}/${filePath}`;
        const response = await rawContentApiClient.get(url);
        return response.data;
    } catch (error: any) {
        const usedBranch = await resolveBranch(owner, repo, branch);
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 404) throw new Error(`File '${filePath}' not found in '${owner}/${repo}' on branch '${usedBranch}'.`);
            throw new Error(`Failed to fetch file content: ${error.response.status} - ${error.response.statusText} (branch: ${usedBranch})`);
        }
        throw new Error(`Network or unknown error fetching file content: ${error.message || "Unknown error"}`);
    }
}

export function parseGitHubUrl(url: string): { owner: string; name: string } | null {
    try {
        const parsed = new URL(url);
        if (parsed.hostname !== "github.com") return null;
        const segments = parsed.pathname.split("/").filter(Boolean);
        if (segments.length !== 2) return null;
        const [owner, name] = segments;
        return { owner: owner.toLowerCase(), name: name.toLowerCase() };
    } catch {
        return null;
    }
}

export const checkBranchExists = async (owner: string, name: string, branch: string): Promise<boolean> => {
    try {
        await octokit.rest.repos.getBranch({ owner, repo: name, branch });
        return true;
    } catch (error: any) {
        if (error.response?.status === 404) return false;
        throw error; 
    }
};