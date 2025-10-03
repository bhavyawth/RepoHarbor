import { Request, Response, NextFunction } from "express";
import { getRepoDetails, getRepoContents, getFileContent } from '../services/githubService';


export const getRepoDetailsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { owner, repo } = req.params;

    const details = await getRepoDetails(owner, repo);
    if (!details) {
      return res.status(404).json({ message: 'Repository not found.' });
    }

    res.status(200).json(details);
  } catch (error: any) {
    const { owner, repo } = req.params;
    console.error(`Error fetching repo details for ${owner}/${repo}:`, error.message || error);
    res.status(500).json({ message: 'Failed to fetch repository details.' });
  }
};


export const getRepoContentsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { owner, repo } = req.params;

    const pathStr = (req.query.path as string) || '';
    const branchStr = (req.query.branch as string) || '';

    const contents = await getRepoContents(owner, repo, pathStr, branchStr);

    res.status(200).json(contents);
  } catch (error: any) {
    const { owner, repo } = req.params;
    const pathStr = (req.query.path as string) || '';
    const branchStr = (req.query.branch as string) || 'main';

    console.error(`Error fetching repo contents for ${owner}/${repo}/${pathStr} on branch ${branchStr}:`, error.message || error);
    res.status(500).json({ message: 'Failed to fetch repository contents.' });
  }
};

export const getFileContentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { owner, repo, path } = req.params;
    
    const filePathArray = path // ['src', 'app.css']
    const filePath = Array.isArray(filePathArray) ? filePathArray.join('/') : filePathArray;
    
    if (!filePath) {
      return res.status(400).json({ message: 'File path is required.' });
    }

    const branchStr = (req.query.branch as string) || '';

    const content = await getFileContent(owner, repo, filePath, branchStr);

    res.status(200).type('text/plain').send(content);
  } catch (error: any) {
    const { owner, repo } = req.params;
    const filePath = req.params[0] || '';
    const branchStr = (req.query.branch as string) || '';

    console.error(`Error fetching file content for ${owner}/${repo}/${filePath} on branch ${branchStr}:`, error.message || error);
    res.status(500).json({ message: 'Failed to fetch file content.' });
  }
};
