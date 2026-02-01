import { Request, Response } from "express";
import Repo from "../models/repoModel";
import Chunk from "../models/chunkModel";
import { getRepoDetails, parseGitHubUrl } from "../services/githubService"; // adjust import path to match your existing GitHub service
// ============================================================
// POST /repos — Register a repo
// ============================================================
export const registerRepo = async (req: Request, res: Response) => {
  const { repoUrl } = req.body;
  if (!repoUrl || typeof repoUrl !== "string") {
    return res.status(400).json({ message: "repoUrl is required" });
  }
  const parsed = parseGitHubUrl(repoUrl.trim());
  if (!parsed) {
    return res.status(400).json({ message: "Invalid GitHub URL. Expected format: https://github.com/owner/name" });
  }
  const { owner, name } = parsed;
  let repoDetails;
  try {
    repoDetails = await getRepoDetails(owner, name);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return res.status(400).json({message: "Repository does not exist or is not publicly accessible"});
    }
    else if (error.response?.status === 403) {
      return res.status(400).json({message: "GitHub API rate limit exceeded or access forbidden"});
    }
    return res.status(500).json({message: "Failed to verify repository via GitHub"});
  }
  try {
    const repo = await Repo.create({
      owner,
      name,
      userId: req.user!._id,
      indexStatus: "pending",
      defaultBranch: repoDetails.default_branch,
    });
    return res.status(201).json({
      id: repo._id,
      owner: repo.owner,
      name: repo.name,
      indexStatus: repo.indexStatus,
      createdAt: repo.createdAt,
      defaultBranch: repo.defaultBranch,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({message: `Repository ${owner}/${name} is already registered`});
    }
    return res.status(500).json({message: "Failed to register repository"});
  }
};
// ============================================================
// GET /repos — List all repos for the authenticated user
// ============================================================
export const listRepos = async (req: Request, res: Response) => {
  try {
    const repos = await Repo.find({ userId: req.user!._id }).sort({
      createdAt: -1, //new first
    });
    return res.status(200).json(repos);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch repositories" });
  }
};

// ============================================================
// DELETE /repos/:repoId — Delete a repo and all its chunks
// ============================================================
export const deleteRepo = async (req: Request, res: Response) => {
  try {
    const { repoId } = req.params;
    const repo = await Repo.findById(repoId);
    if (!repo) {
      return res.status(404).json({ message: "Repo not found" });
    }
    if (repo.userId.toString() !== req.user!._id.toString()) { //does repo belong to user?
      return res.status(403).json({ message: "Not authorized to delete this repo" });
    }
    //order matters here
    await Chunk.deleteMany({ repoId: repo._id });
    await Repo.findByIdAndDelete(repo._id);
    return res.status(200).json({ message: `Deleted ${repo.owner}/${repo.name}` });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete repository" });
  }
};
