import { Router, Request, Response } from "express";
import {
  getRepoDetailsController,
  getRepoContentsController,
  getFileContentController,
  getChunkedFileContentController
} from "../controllers/githubController";

const router = Router();
/**
 * @route   GET /api/github/repos/:owner/:repo
 * @desc    Fetch high-level repository details (name, description, stars, default branch, etc.)
 */
router.get('/repos/:owner/:repo', getRepoDetailsController);
/**
 * @route   GET /api/github/repos/:owner/:repo/contents
 * @desc    List files and directories within the repository
 */
router.get('/repos/:owner/:repo/contents/*folderPath', getRepoContentsController);
/**
 * @route   GET /api/github/repos/:owner/:repo/files/*path
 * @desc    Fetch raw content of a specific file in the repository
 */
router.get('/repos/:owner/:repo/files/*filePath', getFileContentController);
/**
 * @route   GET /api/github/repos/:owner/:repo/files/*path/chunks
 * @desc    Fetch raw content of a specific file and split it into chunks
 */
router.get('/repos/:owner/:repo/file-chunks/*filePath', getChunkedFileContentController);
export default router;
