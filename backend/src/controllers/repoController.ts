import { Request, Response } from "express";
import Repo from "../models/repoModel";
import Chunk from "../models/chunkModel";
import { getRepoDetails, parseGitHubUrl } from "../services/githubService";
import { chunkText } from "../services/chunkService";
import { findSimilarChunks, generateEmbedding, generateEmbeddingsForChunks } from "../services/embeddingService";
import { buildJsonTree, hasAllowedExtension, MAX_FILE_SIZE, shouldSkipPath, treeToPrompt } from "../utils/fileUtils";
import { getFileContent, getRepoTree } from "../services/githubService";
import { generateAnswer } from "../services/llm/chatCompletion";
import ChatMsg from "../models/chatMsgModel";

// ============================================================
// POST /repos — Register a repo
// ============================================================
export const registerRepo = async (req: Request, res: Response) => {
  const { repoUrl } = req.body;
  if (!repoUrl || typeof repoUrl !== "string") return res.status(400).json({ message: "repoUrl is required" });
  const parsed = parseGitHubUrl(repoUrl.trim());
  if (!parsed) return res.status(400).json({ message: "Invalid GitHub URL. Expected format: https://github.com/owner/name" });
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
    if (!repo) return res.status(404).json({ message: "Repo not found" });
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
// ============================================================
// POST /repos/:repoId/ingest — Ingest a repository
// ============================================================
export const ingestRepo = async (req: Request, res: Response) => {
  const { repoId } = req.params;
  const repo = await Repo.findById(repoId);
  if (!repo) return res.status(404).json({ message: "Repo not found" });
  if (repo.userId.toString() !== req.user!._id.toString()) return res.status(403).json({ message: "Not authorized" });

  try {
    await Repo.findByIdAndUpdate(repoId, { indexStatus: "indexing" });
    await Chunk.deleteMany({ repoId: repo._id });
    const treeEntries = await getRepoTree(repo.owner, repo.name, repo.defaultBranch ?? undefined);
    const filePaths = treeEntries
      .filter((entry) => entry.type === "blob")
      .filter((entry) => !shouldSkipPath(entry.path))
      .filter((entry) => hasAllowedExtension(entry.path))
      .filter((entry) => entry.size === undefined || entry.size <= MAX_FILE_SIZE)
      .map((entry) => entry.path);
    const repoTree = buildJsonTree(filePaths);
    await Repo.findByIdAndUpdate(repoId, { repoTree });
    const allChunks = [];
    for (const filePath of filePaths) {
      const content = await getFileContent(repo.owner, repo.name, filePath, repo.defaultBranch ?? undefined);
      const chunks = chunkText(
        content,
        `${repo.owner}/${repo.name}`,
        filePath
      );
      allChunks.push(...chunks);
    }
    
    const embeddedChunks = await generateEmbeddingsForChunks(allChunks);
    const chunkDocs = embeddedChunks.map(ec => ({
      repoId: repo._id,
      filePath: ec.filepath,
      content: ec.content,
      startIndex: ec.startIndex,
      chunkIndex: ec.chunkIndex,
      embedding: ec.embedding,
    }));
    await Chunk.insertMany(chunkDocs);
    await Repo.findByIdAndUpdate(repoId, {
      indexStatus: "indexed",
      lastIndexedAt: new Date(),
      indexError: null,
    });
    return res.status(200).json({ message: "Ingestion complete" });
  } catch (error: any) {
    await Repo.findByIdAndUpdate(repoId, {
      indexStatus: "failed",
      indexError: error.message || "Unknown error",
    });
    return res.status(500).json({ message: "Ingestion failed", error: error.message });
  }
};
// ============================================================
// POST /repos/:repoId/chat — Chat with a repository
// ============================================================
export const chatWithRepo = async (req: Request, res: Response) => {
  const { repoId } = req.params;
  const { question } = req.body;
  const messages = await ChatMsg.find({ repoId })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean()
  const chatHistory = messages.reverse()
  const safeHistory = Array.isArray(chatHistory)
    ? chatHistory.slice(-6)
    : [];
  if (!question || typeof question !== "string") return res.status(400).json({ message: "Question is required" });
  
  try {
    const repo = await Repo.findById(repoId);
    if (!repo) return res.status(404).json({ message: "Repo not found" });
    if (repo.userId.toString() !== req.user!._id.toString()) return res.status(403).json({ message: "Not authorized" });
    if (repo.indexStatus !== "indexed") return res.status(400).json({ message: "Repo is not indexed yet" });
    Repo.findByIdAndUpdate(repoId, {}); //to update recent access
    const questionEmbedding = await generateEmbedding(question);
    const chunks = (await Chunk.find({ repoId })).map(c => ({
      repo: repo.owner + "/" + repo.name,
      content: c.content,
      embedding: c.embedding,
      filepath: c.filePath,
      startIndex: c.startIndex,
      chunkIndex: c.chunkIndex,
    }));
    const topKChunksWithSimilarity = findSimilarChunks(questionEmbedding, chunks, 15);
    const context = topKChunksWithSimilarity
      .map(c => `--- FILE: ${c.filepath} ---\n${c.content}`)
      .join("\n\n");
    const repoTreePrompt = treeToPrompt(Array.isArray(repo.repoTree) ? repo.repoTree : []);
    const answer = await generateAnswer(
      question,
      context, 
      repoTreePrompt,
      safeHistory || [],
    );
    //save the msgs
    await ChatMsg.create({
      repoId: repo._id,
      role: "user",
      content: question,
      userId: req.user!._id,
    });
    await ChatMsg.create({
      repoId: repo._id,
      role: "assistant",
      content: answer,
      userId: req.user!._id,
    });

    return res.status(200).json({ answer });
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to generate answer", error: error.message });
  }
}
// ============================================================
// GET /repos/:repoId/structure — Get the repository structure as a tree
// =====================================================
export const getRepoStructure = async (req: Request, res: Response) => {
  const { repoId } = req.params;
  if (!repoId) return res.status(400).json({ message: "Repo ID is required" });
  const repo = await Repo.findById(repoId);
  if (!repo) return res.status(404).json({ message: "Repo not found" });
  if (repo.userId.toString() !== req.user!._id.toString()) return res.status(403).json({ message: "Not authorized" });
  try {
    if (Array.isArray(repo.repoTree) && repo.repoTree.length > 0) {
      return res.status(200).json({ tree: repo.repoTree, structure: treeToPrompt(repo.repoTree) });
    }

    const treeEntries = await getRepoTree(repo.owner, repo.name, repo.defaultBranch ?? undefined);
    const filePaths = treeEntries
      .filter((entry) => entry.type === "blob")
      .filter((entry) => !shouldSkipPath(entry.path))
      .filter((entry) => hasAllowedExtension(entry.path))
      .filter((entry) => entry.size === undefined || entry.size <= MAX_FILE_SIZE)
      .map((entry) => entry.path);
    const repoTree = buildJsonTree(filePaths);
    await Repo.findByIdAndUpdate(repoId, { repoTree });
    return res.status(200).json({ tree: repoTree, structure: treeToPrompt(repoTree) });
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to generate repo structure", error: error.message });
  }
};
// ============================================================
// PATCH /repos/:repoId/pin — Pin or unpin a repository
// ============================================================
export const pinRepo = async (req: Request, res: Response) => {
  const { repoId } = req.params;
  if (!repoId) return res.status(400).json({ message: "Repo ID is required" });
  const repo = await Repo.findById(repoId);
  if (!repo) return res.status(404).json({ message: "Repo not found" });
  if (repo.userId.toString() !== req.user!._id.toString()) return res.status(403).json({ message: "Not authorized" });
  try {
    repo.isPinned = !repo.isPinned;
    await repo.save();
    return res.status(200).json({ message: repo.isPinned ? "Repo pinned" : "Repo unpinned", isPinned: repo.isPinned });
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to update pin status", error: error.message });
  }
};


//todo: have a controller for ingestion bar using websockets in future
