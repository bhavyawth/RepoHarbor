import { Request, Response } from "express";
import Repo from "../models/repoModel";
import Chunk from "../models/chunkModel";
import { getRepoDetails, parseGitHubUrl } from "../services/githubService";
import { chunkText, type TextChunk } from "../services/chunkService";
import { findSimilarChunks, generateEmbedding, generateEmbeddingsForChunks } from "../services/embeddingService";
import { buildJsonTree, hasAllowedExtension, MAX_FILE_SIZE, shouldSkipPath, treeToPrompt } from "../utils/fileUtils";
import { getFileContent, getRepoTree, checkBranchExists } from "../services/githubService";
import { generateAnswer } from "../services/llm/chatCompletion";
import { isCancelled, markCancelled, clearCancelled } from "../services/cancelRegistry";
import ChatMsg from "../models/chatMsgModel";
import type { RepoDocument } from "../models/repoModel";

const INGEST_BATCH_SIZE = 10;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message;
  return "Unknown error";
};

async function processIndexing(repo: RepoDocument): Promise<void> {
  const repoName = `${repo.owner}/${repo.name}`;
  const repoId = repo._id.toString();
  const handleCancellation = async (): Promise<void> => {
    clearCancelled(repoId);
    await Chunk.deleteMany({ repoId: repo._id, status: "pending" });
    const activeChunks = await Chunk.countDocuments({ repoId: repo._id, status: "active" });
    await Repo.findByIdAndUpdate(repo._id, {
      indexStatus: activeChunks > 0 ? "done" : "cancelled",
      indexError: activeChunks > 0 ? null : "Indexing cancelled by user",
    });
  };
  const treeEntries = await getRepoTree(
    repo.owner, 
    repo.name,
    repo.branch ?? undefined
  );
  // ['idle', 'running', 'done', 'failed'
  const filePaths = treeEntries
    .filter((entry) => entry.type === "blob")
    .filter((entry) => !shouldSkipPath(entry.path))
    .filter((entry) => hasAllowedExtension(entry.path))
    .filter((entry) => !entry.size || entry.size <= MAX_FILE_SIZE)
    .map((entry) => entry.path);
  if (filePaths.length === 0) throw new Error("No indexable files found in repository");
  let totalChunks = 0;
  for (let i = 0; i < filePaths.length; i += INGEST_BATCH_SIZE) {
    //cancellation happens only at boundary of batches!
    if (isCancelled(repoId)) {
      await handleCancellation();
      // console.log(`[ingestRepo] Cancelled indexing for ${repoName}`);
      return;
    }
    const batchPaths = filePaths.slice(i, i + INGEST_BATCH_SIZE);
    const batchChunks: TextChunk[] = [];
    for (const filePath of batchPaths) {
      if (isCancelled(repoId)) {
        await handleCancellation();
        return;
      }
      try {
        const content = await getFileContent(
          repo.owner,
          repo.name,
          filePath,
          repo.branch ?? undefined
        );
        const chunks = chunkText(content, repoName, filePath);
        batchChunks.push(...chunks);
      } catch (error: unknown) {
        console.warn(`[ingestRepo] Skipping ${filePath}:`, getErrorMessage(error));
      }
    }
    if (batchChunks.length === 0) continue;
    if (isCancelled(repoId)) {
      await handleCancellation();
      return;
    }
    const embeddedChunks = await generateEmbeddingsForChunks(batchChunks);
    if (embeddedChunks.length === 0) continue;
    if (isCancelled(repoId)) {
      await handleCancellation();
      return;
    }
    const chunkDocs = embeddedChunks.map((ec) => ({
      repoId: repo._id,
      filePath: ec.filepath,
      content: ec.content,
      startIndex: ec.startIndex,
      chunkIndex: ec.chunkIndex,
      embedding: ec.embedding,
      status: "pending",
    }));
    await Chunk.insertMany(chunkDocs);
    totalChunks += chunkDocs.length;
  }
  if (totalChunks === 0) throw new Error("No chunks were successfully indexed");
  await Chunk.deleteMany({ repoId: repo._id, status: "active" });
  await Chunk.updateMany(
    { repoId: repo._id, status: "pending" },
    { $set: { status: "active" } }
  );
  await Repo.findByIdAndUpdate(repo._id, {
    indexStatus: "done",
    lastIndexedAt: new Date(),
    indexError: null,
  });
  clearCancelled(repoId);
  // console.log(`[ingestRepo] Successfully indexed ${repoName}: ${totalChunks} chunks from ${filePaths.length} files`);
}
// ============================================================
// POST /repos — Register a repo
// ============================================================
export const registerRepo = async (req: Request, res: Response) => {
  const { repoUrl, branch } = req.body;
  if (!repoUrl || typeof repoUrl !== "string") return res.status(400).json({ message: "repoUrl is required" });
  let input = repoUrl.trim();
  const parsed = parseGitHubUrl(input);
  if (!parsed) return res.status(400).json({ message: "Invalid GitHub input. Provide either https://github.com/owner/name or owner/name" });
  const { owner, name } = parsed;
  let normalizedBranch: string;
  try {
    if (typeof branch === "string" && branch.trim().length > 0) {
      normalizedBranch = branch.trim();
      const branchExists = await checkBranchExists(owner, name, normalizedBranch);
      if (!branchExists) return res.status(400).json({ message: `Branch "${normalizedBranch}" — it doesn't exist in this repository` });
    } else {
      normalizedBranch = (await getRepoDetails(owner, name)).default_branch;
    }
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
    const existingRepo = await Repo.findOne({
      owner,
      name,
      branch: normalizedBranch,
      userId: req.user!._id,
    });
    if (existingRepo) {
      return res.json({
        id: existingRepo._id,
        owner: existingRepo.owner,
        name: existingRepo.name,
        indexStatus: existingRepo.indexStatus,
        createdAt: existingRepo.createdAt,
        branch: existingRepo.branch,
      });
    }
    const repo = await Repo.create({
      owner,
      name,
      userId: req.user!._id,
      indexStatus: "idle",
      branch: normalizedBranch,
    });
    return res.status(201).json({
      id: repo._id,
      owner: repo.owner,
      name: repo.name,
      indexStatus: repo.indexStatus,
      createdAt: repo.createdAt,
      branch: repo.branch,
    });
  } catch (error: any) {
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
    await ChatMsg.deleteMany({ repoId: repo._id });
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
  try {
    const { repoId } = req.params;
    const repo = await Repo.findById(repoId);
    if (!repo)  return res.status(404).json({ message: "Repo not found" });
    if (repo.userId.toString() !== req.user!._id.toString()) return res.status(403).json({ message: "Not authorized" });
    const indexingRepo = await Repo.findOneAndUpdate(
      {
        _id: repo._id,
        userId: req.user!._id,
        indexStatus: { $ne: "running" },
      },
      {
        $set: {
          indexStatus: "running",
          indexError: null,
        },
      },
      { new: true }
    );
    if (!indexingRepo) return res.status(409).json({ message: "Indexing already in progress" });
    res.status(202).json({ message: "Indexing started", repoId, });
    processIndexing(indexingRepo).catch(async (error: unknown) => {
      const errorMessage = getErrorMessage(error);
      console.error(`[ingestRepo] Indexing failed for ${indexingRepo.owner}/${indexingRepo.name}:`, errorMessage);
      try {
        clearCancelled(indexingRepo._id.toString());
        await Repo.findByIdAndUpdate(indexingRepo._id, {
          indexStatus: "failed",
          indexError: errorMessage,
        });
      } catch (updateError: unknown) {
        console.error(`[ingestRepo] Failed to update repo status:`, getErrorMessage(updateError));
      }
    });
  } catch (error: unknown) {
    return res.status(500).json({ 
      message: "Failed to start indexing", 
      error: getErrorMessage(error) 
    });
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
    .lean();
  const formattedMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
  const chatHistory = formattedMessages.reverse()
  const safeHistory = Array.isArray(chatHistory)
    ? chatHistory.slice(-6)
    : [];
  if (!question || typeof question !== "string") return res.status(400).json({ message: "Question is required" });
  
  try {
    const repo = await Repo.findById(repoId);
    if (!repo) return res.status(404).json({ message: "Repo not found" });
    if (repo.userId.toString() !== req.user!._id.toString()) return res.status(403).json({ message: "Not authorized" });
    if (repo.indexStatus !== "done") return res.status(400).json({ message: "Repo is not indexed yet" });
    Repo.findByIdAndUpdate(repoId, { $set: { lastAccessedAt: new Date() } }); //to update recent access
    const questionEmbedding = await generateEmbedding(question);
    const topKChunks = await findSimilarChunks(repoId, `${repo.owner}/${repo.name}`, questionEmbedding, 15);
    const context = topKChunks.map(c => `--- FILE: ${c.filepath} ---\n${c.content}`).join("\n\n");
    const repoTreePrompt = treeToPrompt(Array.isArray(repo.repoTree) ? repo.repoTree : []);
    const answer = await generateAnswer(
      question,
      context, 
      repoTreePrompt,
      safeHistory || [],
    );
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
  } catch (error: unknown) {
    return res.status(500).json({ message: "Failed to generate answer", error: getErrorMessage(error) });
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

    const treeEntries = await getRepoTree(repo.owner, repo.name, repo.branch ?? undefined);
    const filePaths = treeEntries
      .filter((entry) => entry.type === "blob")
      .map((entry) => entry.path);

      // skipped files should be shown in the navbar repotree, correction
      // .filter((entry) => !shouldSkipPath(entry.path))
      // .filter((entry) => hasAllowedExtension(entry.path))
      // .filter((entry) => entry.size === undefined || entry.size <= MAX_FILE_SIZE)
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

// ============================================================
// GET /repos/:repoId/index-status â€” Get indexing status
// ============================================================
export const getRepoIndexStatus = async (req: Request, res: Response) => {
  const { repoId } = req.params;
  if (!repoId) return res.status(400).json({ message: "Repo ID is required" });

  try {
    const repo = await Repo.findById(repoId);
    if (!repo) return res.status(404).json({ message: "Repo not found" });
    if (repo.userId.toString() !== req.user!._id.toString()) return res.status(403).json({ message: "Not authorized" });

    return res.status(200).json({
      indexStatus: repo.indexStatus,
      lastIndexedAt: repo.lastIndexedAt,
      indexError: repo.indexError ?? null,
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to fetch index status", error: error.message });
  }
};

export const cancelIndexing = async (req: Request, res: Response) => {
  try {
    const { repoId } = req.params;
    const repo = await Repo.findById(repoId);
    if (!repo) return res.status(404).json({ message: "Repo not found" });
    if (repo.userId.toString() !== req.user!._id.toString()) return res.status(403).json({ message: "Not authorized" });
    if (repo.indexStatus !== "running") return res.status(400).json({ message: "Repo is not currently indexing" });
    markCancelled(repoId);
    return res.status(200).json({ message: "Cancellation requested" });
  } catch (error: unknown) {
    return res.status(500).json({ message: "Failed to cancel indexing", error: getErrorMessage(error) });
  }
};
