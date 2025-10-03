// backend/src/services/githubService.ts
import { Octokit } from 'octokit';
import axios from 'axios';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
    console.warn('GITHUB_TOKEN is not set.');
}

// Octokit client for GitHub API calls as seen in rest api docs
const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Axios client for raw file content (raw.githubusercontent.com) raw content deta hai
const rawContentApiClient = axios.create({
    baseURL: 'https://raw.githubusercontent.com',
});

// Purpose: To interact with GitHub API for fetching high-level repository details
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
            license: license ? { key: license.key, name: license.name, url: license.html_url } : null, // Filter license
        };
    } catch (error: any) {
        if (error.status === 404) {
            throw new Error(`Repository '${owner}/${repo}' not found.`);
        }
        throw new Error(`GitHub API error for ${owner}/${repo}: ${error.status || 500} - ${error.message || 'Unknown error'}`);
    }
}

// Purpose: To interact with GitHub API for fetching repository contents (files and directories)
export interface RepoItem { 
    path: string;
    name: string;
    type: 'file' | 'dir';
}

export const getRepoContents = async (
    owner: string,
    repo: string,
    path: string = '',
    branch: string = 'main'
): Promise<RepoItem[]> => {
    try {
        const response = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
            ref: branch
        });

        // ensure it's always an array for consistent processing.
        const items = Array.isArray(response.data) ? response.data : [response.data];

        const contents: RepoItem[] = items.map((item: any) => ({
            path: item.path,
            name: item.name,
            type: item.type === 'file' ? 'file' : 'dir', 
        }));

        return contents; // Array of files and directories (RepoItem objects)
    } catch (error: any) {
        if (error.status === 404) {
            throw new Error(`Path '${path}' in repository '${owner}/${repo}' not found.`);
        }
        throw new Error(`GitHub API error: ${error.status || 500} - ${error.message || 'Unknown error'}`);
    }
};

// Purpose: To interact with GitHub API for fetching raw content of a specific file in the repository
export async function getFileContent(
    owner: string,
    repo: string,
    filePath: string,
    branch: string = 'main'
): Promise<string> {
    try {
        // the URL for raw file content on raw.githubusercontent.com
        const url = `/${owner}/${repo}/${branch}/${filePath}`;

        // Get the raw text content of the file we give
        const response = await rawContentApiClient.get(url);

        return response.data; // Raw content is directly in response.data for this endpoint
    } catch (error: any) {
        // Check if the error is an Axios error and has a response (HTTP error)
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 404) {
                throw new Error(`File '${filePath}' not found in '${owner}/${repo}' on branch '${branch}'.`);
            }
            // For other HTTP errors
            throw new Error(`Failed to fetch file content from raw.githubusercontent.com: ${error.response.status} - ${error.response.statusText}`);
        }
        throw new Error(`Network or unknown error fetching file content: ${error.message || 'Unknown error'}`);
    }
}