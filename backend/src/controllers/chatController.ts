import { Response, Request } from "express";
import Repo from "../models/repoModel";
import ChatMsg from "../models/chatMsgModel";
import { generateSummary } from "../services/llm/chatSummarizer";
import { isValidObjectId } from "mongoose";

async function validateRepoOwnership(repoId: string, userId: string): Promise<boolean> {
  const repo = await Repo.findOne({ _id: repoId, userId });
  return repo?.userId.toString() === userId;
}

const SEARCH_MIN_LENGTH = 2;
const SEARCH_LIMIT = 20;

// ============================================================
// GET /repos/:repoId/messages - Get chat history for a repo
// ============================================================
export const getChatHistory = async (req: Request, res: Response) => {
  const { repoId } = req.params;
  if (!isValidObjectId(repoId)) return res.status(400).json({ message: "Invalid repo ID" });
  const ownsRepo = await validateRepoOwnership(repoId, req.user!._id.toString());
  if (!ownsRepo) return res.status(404).json({ message: "Repository not found" });

  try {
    const chatMessages = await ChatMsg.find({ repoId, userId: req.user!._id }).sort({ createdAt: 1 }).lean();
    return res.status(200).json(chatMessages);
  } catch (error: any) {
    console.error("Failed to retrieve chat history:", error);
    return res.status(500).json({ message: "Failed to retrieve chat history" });
  }
};
// ============================================================
// DELETE /repos/:repoId/messages - Clear chat history for a repo
// ============================================================
export const clearChatHistory = async (req: Request, res: Response) => {
  const { repoId } = req.params;
  if (!isValidObjectId(repoId)) return res.status(400).json({ message: "Invalid repo ID" });
  const ownsRepo = await validateRepoOwnership(repoId, req.user!._id.toString());
  if (!ownsRepo) return res.status(404).json({ message: "Repository not found" });

  try {
    await ChatMsg.deleteMany({ repoId, userId: req.user!._id });
    return res.status(200).json({ message: "Chat history cleared" });
  } catch (error: any) {
    console.error("Failed to clear chat history:", error);
    return res.status(500).json({ message: "Failed to clear chat history" });
  }
};
// ============================================================
// GET /repos/:repoId/summary - Get a summary of the repo's chat history
// ============================================================
export const getRepoSummary = async (req: Request, res: Response) => {
  const { repoId } = req.params;
  if (!isValidObjectId(repoId)) return res.status(400).json({ message: "Invalid repo ID" });
  const ownsRepo = await validateRepoOwnership(repoId, req.user!._id.toString());
  if (!ownsRepo) return res.status(404).json({ message: "Repository not found" });

  try {
    const messages = await ChatMsg.find({ repoId, userId: req.user!._id })
      .sort({ createdAt: 1 })
      .limit(20)
      .lean();
    if (messages.length === 0) return res.status(200).json({ summary: "No chat history available to summarize." });
    const chatHistory = messages.map(msg => ({
      role: msg.role as "system" | "user" | "assistant",
      content: msg.content,
    }));
    const summary = await generateSummary(chatHistory);
    return res.status(200).json({ summary });
  } catch (error: any) {
    console.error("Failed to generate summary:", error);
    return res.status(500).json({ message: "Failed to generate repository summary" });
  }
};
// ============================================================
// GET /repos/search/messages?q=... - Search all user chat messages
// ============================================================
export const searchMessages = async (req: Request, res: Response) => {
  const rawQuery = String(req.query.q ?? "").trim();
  if (rawQuery.length < SEARCH_MIN_LENGTH) {
    return res.status(400).json({
      message: `Query must be at least ${SEARCH_MIN_LENGTH} characters.`,
    });
  }

  try {
    const userId = req.user!._id;
    const results = await ChatMsg.aggregate([
      {
        $match: {
          userId,
          $text: { $search: rawQuery },
        },
      },
      {
        $addFields: {
          score: { $meta: "textScore" },
        },
      },
      {
        $sort: {
          score: -1,
          createdAt: -1,
        },
      },
      { $limit: SEARCH_LIMIT },
      {
        $lookup: {
          from: "repos",
          localField: "repoId",
          foreignField: "_id",
          as: "repo",
        },
      },
      {
        $project: {
          _id: 1,
          chatId: "$repoId",
          content: 1,
          role: 1,
          createdAt: 1,
          repoName: {
            $cond: [
              { $gt: [{ $size: "$repo" }, 0] },
              {
                $concat: [
                  { $arrayElemAt: ["$repo.owner", 0] },
                  "/",
                  { $arrayElemAt: ["$repo.name", 0] },
                ],
              },
              "Unknown repository",
            ],
          },
        },
      },
    ]);
    return res.status(200).json(results);
  } catch (error) {
    console.error("Failed to search messages:", error);
    return res.status(500).json({ message: "Failed to search messages." });
  }
};
